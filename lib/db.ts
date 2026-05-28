import { Pool } from "pg";
import { DEFAULT_WEEKLY_RULE, WEEKDAY_KEYS, type DailyOverrideAction, type WeeklyRule } from "@/lib/constants";
import { getRequiredEnv } from "@/lib/env";
import { generateApiKey, hashPassword } from "@/lib/crypto";
import { APP_TIMEZONE } from "@/lib/constants";

export type AdminUserRecord = {
  id: number;
  passwordHash: string;
  passwordChangedAt: string | null;
};

export type SettingsRecord = {
  timezone: string;
  apiKey: string;
  requirePasswordChange: boolean;
};

export type DailyOverrideRecord = {
  date: string;
  action: DailyOverrideAction;
};

const APP_SCHEMA = "app_private";
const TABLES = {
  adminUser: `${APP_SCHEMA}.admin_user`,
  settings: `${APP_SCHEMA}.settings`,
  weeklyRule: `${APP_SCHEMA}.weekly_rule`,
  dailyOverride: `${APP_SCHEMA}.daily_override`,
} as const;

let pool: Pool | null = null;
let initializationPromise: Promise<void> | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: getRequiredEnv("DATABASE_URL"),
      ssl: process.env.DATABASE_SSL === "disable" ? false : { rejectUnauthorized: false },
    });
  }

  return pool;
}

async function createSchema() {
  await getPool().query(`
    CREATE SCHEMA IF NOT EXISTS app_private;
    REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
    ALTER DEFAULT PRIVILEGES IN SCHEMA app_private REVOKE ALL ON TABLES FROM PUBLIC;
  `);
}

async function migrateLegacyPublicTables() {
  await getPool().query(`
    DO $$
    BEGIN
      IF to_regclass('app_private.admin_user') IS NULL THEN
        ALTER TABLE IF EXISTS public.admin_user SET SCHEMA app_private;
      END IF;
    END $$;
  `);

  await getPool().query(`
    DO $$
    BEGIN
      IF to_regclass('app_private.settings') IS NULL THEN
        ALTER TABLE IF EXISTS public.settings SET SCHEMA app_private;
      END IF;
    END $$;
  `);

  await getPool().query(`
    DO $$
    BEGIN
      IF to_regclass('app_private.weekly_rule') IS NULL THEN
        ALTER TABLE IF EXISTS public.weekly_rule SET SCHEMA app_private;
      END IF;
    END $$;
  `);

  await getPool().query(`
    DO $$
    BEGIN
      IF to_regclass('app_private.daily_override') IS NULL THEN
        ALTER TABLE IF EXISTS public.daily_override SET SCHEMA app_private;
      END IF;
    END $$;
  `);
}

async function createTables() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS app_private.admin_user (
      id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      password_hash TEXT NOT NULL,
      password_changed_at TIMESTAMPTZ
    );
  `);

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS app_private.settings (
      id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      timezone TEXT NOT NULL,
      api_key TEXT NOT NULL,
      require_password_change BOOLEAN NOT NULL DEFAULT TRUE
    );
  `);

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS app_private.weekly_rule (
      id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      monday BOOLEAN NOT NULL,
      tuesday BOOLEAN NOT NULL,
      wednesday BOOLEAN NOT NULL,
      thursday BOOLEAN NOT NULL,
      friday BOOLEAN NOT NULL,
      saturday BOOLEAN NOT NULL,
      sunday BOOLEAN NOT NULL
    );
  `);

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS app_private.daily_override (
      date DATE PRIMARY KEY,
      action TEXT NOT NULL CHECK (action IN ('FORCE_ON', 'FORCE_OFF'))
    );
  `);
}

async function seedDefaults() {
  const passwordHash = await hashPassword(getRequiredEnv("DEFAULT_ADMIN_PASSWORD"));

  await getPool().query(
    `
      INSERT INTO ${TABLES.adminUser} (id, password_hash)
      VALUES (1, $1)
      ON CONFLICT (id) DO NOTHING
    `,
    [passwordHash],
  );

  await getPool().query(
    `
      INSERT INTO ${TABLES.settings} (id, timezone, api_key, require_password_change)
      VALUES (1, $1, $2, TRUE)
      ON CONFLICT (id) DO NOTHING
    `,
    [APP_TIMEZONE, generateApiKey()],
  );

  await getPool().query(
    `
      INSERT INTO ${TABLES.weeklyRule} (
        id, monday, tuesday, wednesday, thursday, friday, saturday, sunday
      ) VALUES (1, $1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING
    `,
    WEEKDAY_KEYS.map((key) => DEFAULT_WEEKLY_RULE[key]),
  );
}

export async function ensureInitialized() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      await createSchema();
      await migrateLegacyPublicTables();
      await createTables();
      await seedDefaults();
    })();
  }

  return initializationPromise;
}

export async function getSettings(): Promise<SettingsRecord> {
  await ensureInitialized();
  const result = await getPool().query(
    `SELECT timezone, api_key, require_password_change FROM ${TABLES.settings} WHERE id = 1`,
  );
  const row = result.rows[0];

  return {
    timezone: row.timezone,
    apiKey: row.api_key,
    requirePasswordChange: row.require_password_change,
  };
}

export async function getAdminUser(): Promise<AdminUserRecord> {
  await ensureInitialized();
  const result = await getPool().query(
    `SELECT id, password_hash, password_changed_at FROM ${TABLES.adminUser} WHERE id = 1`,
  );
  const row = result.rows[0];

  return {
    id: row.id,
    passwordHash: row.password_hash,
    passwordChangedAt: row.password_changed_at,
  };
}

export async function updatePassword(passwordHash: string) {
  await ensureInitialized();
  await getPool().query(
    `
      UPDATE ${TABLES.adminUser}
      SET password_hash = $1, password_changed_at = NOW()
      WHERE id = 1
    `,
    [passwordHash],
  );
  await getPool().query(
    `
      UPDATE ${TABLES.settings}
      SET require_password_change = FALSE
      WHERE id = 1
    `,
  );
}

export async function getWeeklyRule(): Promise<WeeklyRule> {
  await ensureInitialized();
  const result = await getPool().query(
    `SELECT monday, tuesday, wednesday, thursday, friday, saturday, sunday FROM ${TABLES.weeklyRule} WHERE id = 1`,
  );
  const row = result.rows[0];

  return WEEKDAY_KEYS.reduce((accumulator, key) => {
    accumulator[key] = row[key];
    return accumulator;
  }, {} as WeeklyRule);
}

export async function updateWeeklyRule(nextRule: WeeklyRule) {
  await ensureInitialized();
  await getPool().query(
    `
      UPDATE ${TABLES.weeklyRule}
      SET monday = $1,
          tuesday = $2,
          wednesday = $3,
          thursday = $4,
          friday = $5,
          saturday = $6,
          sunday = $7
      WHERE id = 1
    `,
    WEEKDAY_KEYS.map((key) => nextRule[key]),
  );
}

export async function getDailyOverridesForRange(startDate: string, endDate: string) {
  await ensureInitialized();
  const result = await getPool().query(
    `
      SELECT date::text AS date, action
      FROM ${TABLES.dailyOverride}
      WHERE date >= $1::date AND date <= $2::date
      ORDER BY date ASC
    `,
    [startDate, endDate],
  );

  return result.rows as DailyOverrideRecord[];
}

export async function getDailyOverride(date: string) {
  await ensureInitialized();
  const result = await getPool().query(
    `SELECT date::text AS date, action FROM ${TABLES.dailyOverride} WHERE date = $1::date`,
    [date],
  );

  return (result.rows[0] as DailyOverrideRecord | undefined) ?? null;
}

export async function upsertDailyOverride(date: string, action: DailyOverrideAction) {
  await ensureInitialized();
  await getPool().query(
    `
      INSERT INTO ${TABLES.dailyOverride} (date, action)
      VALUES ($1::date, $2)
      ON CONFLICT (date) DO UPDATE
      SET action = EXCLUDED.action
    `,
    [date, action],
  );
}

export async function deleteDailyOverride(date: string) {
  await ensureInitialized();
  await getPool().query(`DELETE FROM ${TABLES.dailyOverride} WHERE date = $1::date`, [date]);
}

export async function rotateApiKey() {
  await ensureInitialized();
  const apiKey = generateApiKey();
  await getPool().query(`UPDATE ${TABLES.settings} SET api_key = $1 WHERE id = 1`, [apiKey]);
  return apiKey;
}
