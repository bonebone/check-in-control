"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

function parseCursor(cursor: string) {
  const [year, month] = cursor.split("-").map(Number);
  return { year, month };
}

export function CalendarHeader(props: {
  monthCursor: string;
  prevMonth: string;
  nextMonth: string;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const yearSelectRef = useRef<HTMLSelectElement>(null);
  const monthSelectRef = useRef<HTMLSelectElement>(null);
  const [, startTransition] = useTransition();
  const [activePicker, setActivePicker] = useState<"year" | "month" | null>(null);
  const { year, month } = parseCursor(props.monthCursor);
  const currentYear = new Date().getFullYear();
  const startYear = Math.min(year, currentYear) - 3;
  const endYear = Math.max(year, currentYear) + 3;
  const yearOptions = [];

  for (let optionYear = startYear; optionYear <= endYear; optionYear += 1) {
    yearOptions.push(optionYear);
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setActivePicker(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActivePicker(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (activePicker === "year") {
      yearSelectRef.current?.focus();
    }

    if (activePicker === "month") {
      monthSelectRef.current?.focus();
    }
  }, [activePicker]);

  function jumpTo(nextYear: number, nextMonth: number) {
    const nextCursor = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
    setActivePicker(null);
    startTransition(() => {
      router.push(`/?month=${nextCursor}`);
    });
  }

  return (
    <div className="calendar-toolbar">
      <div className="eyebrow">Calendar</div>
      <div className="calendar-nav" ref={rootRef}>
        <div className="calendar-title-group">
          <button className="ghost-button icon-button calendar-nav-button" type="button" aria-label="上个月" onClick={() => jumpTo(...Object.values(parseCursor(props.prevMonth)) as [number, number])}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14.7 5.3a1 1 0 0 1 0 1.4L9.41 12l5.3 5.3a1 1 0 1 1-1.42 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.42 0Z" />
            </svg>
          </button>

          {activePicker === "year" ? (
            <select
              ref={yearSelectRef}
              className="calendar-inline-select"
              value={String(year)}
              onBlur={() => setActivePicker(null)}
              onChange={(event) => jumpTo(Number(event.target.value), month)}
            >
              {yearOptions.map((optionYear) => (
                <option key={optionYear} value={optionYear}>
                  {optionYear}
                </option>
              ))}
            </select>
          ) : (
            <button className="calendar-title-button" type="button" onClick={() => setActivePicker("year")}>
              <span className="section-title">{year}</span>
            </button>
          )}

          <span className="calendar-separator">-</span>

          {activePicker === "month" ? (
            <select
              ref={monthSelectRef}
              className="calendar-inline-select month"
              value={String(month)}
              onBlur={() => setActivePicker(null)}
              onChange={(event) => jumpTo(year, Number(event.target.value))}
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map((optionMonth) => (
                <option key={optionMonth} value={optionMonth}>
                  {String(optionMonth).padStart(2, "0")}
                </option>
              ))}
            </select>
          ) : (
            <button className="calendar-title-button" type="button" onClick={() => setActivePicker("month")}>
              <span className="section-title">{String(month).padStart(2, "0")}</span>
            </button>
          )}

          <button className="ghost-button icon-button calendar-nav-button" type="button" aria-label="下个月" onClick={() => jumpTo(...Object.values(parseCursor(props.nextMonth)) as [number, number])}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9.3 18.7a1 1 0 0 1 0-1.4L14.59 12l-5.3-5.3a1 1 0 0 1 1.42-1.4l6 6a1 1 0 0 1 0 1.4l-6 6a1 1 0 0 1-1.42 0Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
