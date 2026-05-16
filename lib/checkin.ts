import { getDailyOverride, getWeeklyRule } from "@/lib/db";
import { resolveCheckinDecision } from "@/lib/checkin-logic";
import { getShanghaiDateString, getShanghaiWeekday } from "@/lib/time";

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
