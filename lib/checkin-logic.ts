import { type DailyOverrideAction, type WeeklyRule, type WeekdayKey } from "@/lib/constants";

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

export function resolveNextOverrideAction(input: {
  weeklyCheckin: boolean;
  currentOverrideAction?: DailyOverrideAction | null;
  nextEffectiveCheckin: boolean;
}): DailyOverrideAction | null {
  if (input.nextEffectiveCheckin === input.weeklyCheckin) {
    return null;
  }

  return input.nextEffectiveCheckin ? "FORCE_ON" : "FORCE_OFF";
}
