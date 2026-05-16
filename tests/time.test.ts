import test from "node:test";
import assert from "node:assert/strict";
import { addMonths, getMonthCursor, getMonthMatrix, getShanghaiDateString, getShanghaiWeekday, isMonthCursor } from "@/lib/time";

test("Shanghai date string follows UTC+8 across day boundaries", () => {
  assert.equal(getShanghaiDateString(new Date("2026-05-15T15:59:59Z")), "2026-05-15");
  assert.equal(getShanghaiDateString(new Date("2026-05-15T16:00:00Z")), "2026-05-16");
});

test("Shanghai weekday respects UTC+8 boundary", () => {
  assert.equal(getShanghaiWeekday(new Date("2026-05-13T15:59:59Z")), "wednesday");
  assert.equal(getShanghaiWeekday(new Date("2026-05-13T16:00:00Z")), "thursday");
});

test("month helpers are stable", () => {
  assert.equal(getMonthCursor(new Date("2026-05-15T16:00:00Z")), "2026-05");
  assert.equal(addMonths("2026-01", -1), "2025-12");
  assert.equal(addMonths("2026-12", 1), "2027-01");
  assert.equal(isMonthCursor("2026-05"), true);
  assert.equal(isMonthCursor("2026-5"), false);
});

test("month matrix pads leading and trailing blanks", () => {
  const matrix = getMonthMatrix("2026-02");
  assert.equal(matrix.length % 7, 0);
  assert.equal(matrix[0], null);
  assert.deepEqual(matrix[6], { date: "2026-02-01", day: 1 });
});
