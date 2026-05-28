import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const dbSource = readFileSync(resolve(process.cwd(), "lib/db.ts"), "utf8");

test("database tables live in a private schema instead of public", () => {
  assert.match(dbSource, /CREATE SCHEMA IF NOT EXISTS app_private/i);
  assert.match(dbSource, /ALTER TABLE IF EXISTS public\.admin_user SET SCHEMA app_private/i);
  assert.match(dbSource, /ALTER TABLE IF EXISTS public\.settings SET SCHEMA app_private/i);
  assert.match(dbSource, /ALTER TABLE IF EXISTS public\.weekly_rule SET SCHEMA app_private/i);
  assert.match(dbSource, /ALTER TABLE IF EXISTS public\.daily_override SET SCHEMA app_private/i);
  assert.doesNotMatch(dbSource, /CREATE TABLE IF NOT EXISTS admin_user/i);
  assert.doesNotMatch(dbSource, /CREATE TABLE IF NOT EXISTS settings/i);
  assert.doesNotMatch(dbSource, /CREATE TABLE IF NOT EXISTS weekly_rule/i);
  assert.doesNotMatch(dbSource, /CREATE TABLE IF NOT EXISTS daily_override/i);
});
