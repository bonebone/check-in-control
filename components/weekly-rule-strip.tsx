"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { WEEKDAY_KEYS, WEEKDAY_LABELS, type WeeklyRule, type WeekdayKey } from "@/lib/constants";
import { useToast } from "@/components/toast-provider";

export function WeeklyRuleStrip(props: {
  weeklyRule: WeeklyRule;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [rule, setRule] = useState<WeeklyRule>(props.weeklyRule);

  useEffect(() => {
    setRule(props.weeklyRule);
  }, [props.weeklyRule]);

  function updateOneDay(day: WeekdayKey, checked: boolean) {
    const nextRule = {
      ...rule,
      [day]: checked,
    };

    setRule(nextRule);

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/weekly-rule", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nextRule),
        });

        if (!response.ok) {
          throw new Error("Failed to update weekly rule");
        }

        showToast(`每${WEEKDAY_LABELS[day]}已${checked ? "设置为默认打卡" : "取消默认打卡"}`);
        router.refresh();
      } catch {
        setRule(rule);
        showToast(`${WEEKDAY_LABELS[day]}保存失败`, 2200);
      }
    });
  }

  return (
    <>
      {WEEKDAY_KEYS.map((weekday) => (
        <label key={weekday} className={`weekday weekday-control ${rule[weekday] ? "active" : ""}`}>
          <span className="weekday-label">{WEEKDAY_LABELS[weekday]}</span>
          <span className="weekday-toggle">
            <input
              type="checkbox"
              checked={rule[weekday]}
              disabled={isPending}
              onChange={(event) => updateOneDay(weekday, event.target.checked)}
            />
            <span className="weekday-toggle-text">打卡</span>
          </span>
        </label>
      ))}
    </>
  );
}
