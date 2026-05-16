import { type DailyOverrideAction, type WeeklyRule, type WeekdayKey } from "@/lib/constants";
import { getDailyOverride, getWeeklyRule } from "@/lib/db";
import { getShanghaiDateString, getShanghaiWeekday } from "@/lib/time";

export function resolveCheckinDecision(input: {
  weeklyRule: WeeklyRule;
  weekday: WeekdayKey;
  dailyOverrideAction?: DailyOverrideAction | null;
}) {
  if (input.dailyOverrideAction === "FORCE_ON") {
    return true;
  }

  if (input.dailyOverrideAction === "FORCE_OFF") {
    return false;
  }

  return input.weeklyRule[input.weekday];
}

export async function getTodayCheckinDecision(now: Date = new Date()) {
  const date = getShanghaiDateString(now);
  const weekday = getShanghaiWeekday(now);
  const [weeklyRule, dailyOverride] = await Promise.all([getWeeklyRule(), getDailyOverride(date)]);

  return {
    date,
    weekday,
    checkin: resolveCheckinDecision({
      weeklyRule,
      weekday,
      dailyOverrideAction: dailyOverride?.action ?? null,
    }),
    source: dailyOverride ? "daily_override" : "weekly_rule",
  };
}
