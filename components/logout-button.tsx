"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/actions";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="ghost-button"
      type="button"
      onClick={() => {
        startTransition(async () => {
          await logoutAction();
        });
      }}
      disabled={isPending}
    >
      {isPending ? "退出中..." : "退出登录"}
    </button>
  );
}
