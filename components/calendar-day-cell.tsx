"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";
import { resolveNextOverrideAction } from "@/lib/checkin-logic";
import type { CalendarDay } from "@/lib/calendar";

function getDayCardClass(day: CalendarDay) {
  const statusClass = day.effectiveCheckin ? "status-on" : "status-off";
  return `day-card ${statusClass}${day.isPast ? " disabled" : ""}`;
}

export function CalendarDayCell(props: {
  day: CalendarDay;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [day, setDay] = useState(props.day);

  useEffect(() => {
    setDay(props.day);
  }, [props.day]);

  function formatMonthDay(date: string) {
    const [, month, currentDay] = date.split("-");
    return `${Number(month)}月${Number(currentDay)}日`;
  }

  function applyLocalState(nextEffectiveCheckin: boolean, nextOverrideAction: CalendarDay["overrideAction"] | null) {
    setDay((current) => ({
      ...current,
      effectiveCheckin: nextEffectiveCheckin,
      overrideAction: nextOverrideAction,
      source: nextOverrideAction ? "daily_override" : "weekly_rule",
      sourceHint: nextOverrideAction ? "日" : "周",
    }));
  }

  function handleToggle(nextChecked: boolean) {
    const previousDay = day;
    const nextOverrideAction = resolveNextOverrideAction({
      weeklyCheckin: day.weeklyCheckin,
      currentOverrideAction: day.overrideAction,
      nextEffectiveCheckin: nextChecked,
    });

    applyLocalState(nextChecked, nextOverrideAction);

    startTransition(async () => {
      try {
        if (nextOverrideAction === null) {
          const response = await fetch(`/api/admin/daily-override?date=${day.date}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete daily override");
          }
        } else {
          const response = await fetch("/api/admin/daily-override", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              date: day.date,
              action: nextOverrideAction,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to upsert daily override");
          }
        }

        showToast(`${formatMonthDay(day.date)}已设置为${nextChecked ? "打卡" : "不打卡"}`);
        router.refresh();
      } catch {
        setDay(previousDay);
        showToast(`${formatMonthDay(day.date)}保存失败`, 2200);
      }
    });
  }

  return (
    <article className={getDayCardClass(day)}>
      <span className="day-source-hint">{day.sourceHint}</span>
      <div className="day-header">
        <div className="day-number">{day.day}</div>
      </div>
      {!day.isPast ? (
        <label className="day-toggle">
          <input
            type="checkbox"
            checked={day.effectiveCheckin}
            disabled={isPending}
            onChange={(event) => handleToggle(event.target.checked)}
          />
          <span className="day-toggle-label">{day.effectiveCheckin ? "打卡" : "不打卡"}</span>
        </label>
      ) : null}
    </article>
  );
}
