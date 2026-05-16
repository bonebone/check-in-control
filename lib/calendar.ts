import { type DailyOverrideRecord } from "@/lib/db";
import { type WeekdayKey, type WeeklyRule } from "@/lib/constants";
import { compareDateStrings, getMonthMatrix, getShanghaiDateString, getShanghaiWeekday } from "@/lib/time";

export type CalendarDay = {
  date: string;
  day: number;
  isPast: boolean;
  weekday: WeekdayKey;
  weeklyCheckin: boolean;
  effectiveCheckin: boolean;
  source: "weekly_rule" | "daily_override";
  sourceHint: "周" | "日";
  overrideAction: DailyOverrideRecord["action"] | null;
};

export function buildCalendarDays(input: {
  monthCursor: string;
  weeklyRule: WeeklyRule;
  overrides: DailyOverrideRecord[];
  today?: string;
}): Array<CalendarDay | null> {
  const today = input.today ?? getShanghaiDateString();
  const overrideMap = new Map(input.overrides.map((item) => [item.date, item.action]));

  return getMonthMatrix(input.monthCursor).map((cell) => {
    if (!cell) {
      return null;
    }

    const weekday = getShanghaiWeekday(new Date(`${cell.date}T12:00:00+08:00`));
    const weeklyCheckin = input.weeklyRule[weekday];
    const overrideAction = overrideMap.get(cell.date) ?? null;
    const source = overrideAction ? "daily_override" : "weekly_rule";
    const effectiveCheckin =
      overrideAction === "FORCE_ON" ? true : overrideAction === "FORCE_OFF" ? false : weeklyCheckin;

    return {
      date: cell.date,
      day: cell.day,
      isPast: compareDateStrings(cell.date, today) < 0,
      weekday,
      weeklyCheckin,
      effectiveCheckin,
      source,
      sourceHint: source === "daily_override" ? "日" : "周",
      overrideAction,
    };
  });
}
