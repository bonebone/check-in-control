"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { logoutAction } from "@/app/actions";

export function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`account-menu ${isOpen ? "open" : ""}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="account-trigger"
        type="button"
        aria-label="账号菜单"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12.2a4.1 4.1 0 1 0-4.1-4.1 4.1 4.1 0 0 0 4.1 4.1Zm0 2c-4.28 0-7.75 2.2-7.75 4.9 0 .5.4.9.9.9h13.7a.9.9 0 0 0 .9-.9c0-2.7-3.47-4.9-7.75-4.9Z" />
        </svg>
      </button>

      <div className="account-dropdown" role="menu" aria-label="账号操作">
        <Link className="account-item" href="/change-password" role="menuitem" onClick={() => setIsOpen(false)}>
          修改密码
        </Link>
        <button
          className="account-item danger"
          type="button"
          role="menuitem"
          onClick={() => {
            startTransition(async () => {
              await logoutAction();
            });
          }}
          disabled={isPending}
        >
          {isPending ? "退出中..." : "退出登录"}
        </button>
      </div>
    </div>
  );
}
