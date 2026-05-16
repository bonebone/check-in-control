import test from "node:test";
import assert from "node:assert/strict";
import { buildCalendarDays } from "@/lib/calendar";
import { resolveCheckinDecision, resolveNextOverrideAction } from "@/lib/checkin-logic";
import { DEFAULT_WEEKLY_RULE } from "@/lib/constants";

test("daily override wins over weekly rule", () => {
  assert.equal(
    resolveCheckinDecision({
      weeklyRule: DEFAULT_WEEKLY_RULE,
      weekday: "thursday",
      dailyOverrideAction: "FORCE_OFF",
    }),
    false,
  );

  assert.equal(
    resolveCheckinDecision({
      weeklyRule: DEFAULT_WEEKLY_RULE,
      weekday: "monday",
      dailyOverrideAction: "FORCE_ON",
    }),
    true,
  );
});

test("calendar days mark past days and apply effective source", () => {
  const days = buildCalendarDays({
    monthCursor: "2026-05",
    weeklyRule: DEFAULT_WEEKLY_RULE,
    overrides: [
      { date: "2026-05-16", action: "FORCE_OFF" },
      { date: "2026-05-18", action: "FORCE_ON" },
    ],
    today: "2026-05-16",
  }).filter(Boolean);

  const may16 = days.find((day) => day?.date === "2026-05-16");
  const may18 = days.find((day) => day?.date === "2026-05-18");
  const may15 = days.find((day) => day?.date === "2026-05-15");

  assert.equal(may16?.isPast, false);
  assert.equal(may16?.weeklyCheckin, true);
  assert.equal(may16?.source, "daily_override");
  assert.equal(may16?.sourceHint, "日");
  assert.equal(may16?.effectiveCheckin, false);

  assert.equal(may18?.source, "daily_override");
  assert.equal(may18?.effectiveCheckin, true);

  assert.equal(may15?.isPast, true);
});

test("next override action covers all six daily state transitions", () => {
  assert.equal(resolveNextOverrideAction({
    weeklyCheckin: true,
    currentOverrideAction: null,
    nextEffectiveCheckin: false,
  }), "FORCE_OFF");

  assert.equal(resolveNextOverrideAction({
    weeklyCheckin: true,
    currentOverrideAction: "FORCE_ON",
    nextEffectiveCheckin: false,
  }), "FORCE_OFF");

  assert.equal(resolveNextOverrideAction({
    weeklyCheckin: true,
    currentOverrideAction: "FORCE_OFF",
    nextEffectiveCheckin: true,
  }), null);

  assert.equal(resolveNextOverrideAction({
    weeklyCheckin: false,
    currentOverrideAction: null,
    nextEffectiveCheckin: true,
  }), "FORCE_ON");

  assert.equal(resolveNextOverrideAction({
    weeklyCheckin: false,
    currentOverrideAction: "FORCE_OFF",
    nextEffectiveCheckin: true,
  }), "FORCE_ON");

  assert.equal(resolveNextOverrideAction({
    weeklyCheckin: false,
    currentOverrideAction: "FORCE_ON",
    nextEffectiveCheckin: false,
  }), null);
});
