import { APP_TIMEZONE, WEEKDAY_KEYS, type WeekdayKey } from "@/lib/constants";

type DateParts = {
  year: number;
  month: number;
  day: number;
};

const zhDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIMEZONE,
  weekday: "long",
});

function parseDateParts(input: Date): DateParts {
  const parts = zhDateFormatter.formatToParts(input);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  if (!year || !month || !day) {
    throw new Error("Failed to parse timezone-adjusted date parts.");
  }

  return { year, month, day };
}

export function getShanghaiDateString(input: Date = new Date()): string {
  return zhDateFormatter.format(input);
}

export function getShanghaiWeekday(input: Date = new Date()): WeekdayKey {
  const value = weekdayFormatter.format(input).toLowerCase();
  const match = WEEKDAY_KEYS.find((weekday) => weekday === value);

  if (!match) {
    throw new Error(`Unsupported weekday value: ${value}`);
  }

  return match;
}

export function getMonthCursor(input: Date = new Date()): string {
  const { year, month } = parseDateParts(input);
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function parseMonthCursor(cursor: string): DateParts {
  const match = /^(\d{4})-(\d{2})$/.exec(cursor);

  if (!match) {
    throw new Error("Invalid month cursor.");
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: 1,
  };
}

export function isMonthCursor(cursor: string): boolean {
  return /^\d{4}-\d{2}$/.test(cursor);
}

export function buildDateString(parts: DateParts): string {
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function compareDateStrings(left: string, right: string): number {
  return left.localeCompare(right);
}

export function addMonths(cursor: string, offset: number): string {
  const parts = parseMonthCursor(cursor);
  const normalizedMonth = parts.month - 1 + offset;
  const year = parts.year + Math.floor(normalizedMonth / 12);
  const month = ((normalizedMonth % 12) + 12) % 12 + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getMonthMatrix(cursor: string) {
  const { year, month } = parseMonthCursor(cursor);
  const firstDayUtc = new Date(Date.UTC(year, month - 1, 1));
  const firstWeekday = (firstDayUtc.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: Array<{ date: string; day: number } | null> = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: buildDateString({ year, month, day }), day });
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}
