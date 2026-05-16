export const APP_TIMEZONE = "Asia/Shanghai";
export const SESSION_COOKIE_NAME = "checkin-control-session";
export const WEEKDAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const WEEKDAY_LABELS: Record<(typeof WEEKDAY_KEYS)[number], string> = {
  monday: "周一",
  tuesday: "周二",
  wednesday: "周三",
  thursday: "周四",
  friday: "周五",
  saturday: "周六",
  sunday: "周日",
};

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export type WeeklyRule = Record<WeekdayKey, boolean>;

export type DailyOverrideAction = "FORCE_ON" | "FORCE_OFF";

export const DEFAULT_WEEKLY_RULE: WeeklyRule = {
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: true,
  friday: true,
  saturday: true,
  sunday: true,
};
