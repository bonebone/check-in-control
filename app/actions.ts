"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, clearSession } from "@/lib/session";
import { getAdminUser, rotateApiKey, updatePassword, updateWeeklyRule, upsertDailyOverride, deleteDailyOverride } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { WEEKDAY_KEYS, type DailyOverrideAction, type WeeklyRule } from "@/lib/constants";
import { compareDateStrings, getShanghaiDateString } from "@/lib/time";

export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const user = await getAdminUser();
  const valid = await verifyPassword(password, user.passwordHash);

  if (!valid) {
    return {
      status: "error",
      message: "密码不正确。",
    };
  }

  await createSession();
  redirect("/");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function changePasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return { status: "error", message: "新密码至少 8 位。" };
  }

  if (password !== confirmPassword) {
    return { status: "error", message: "两次输入的新密码不一致。" };
  }

  const passwordHash = await hashPassword(password);
  await updatePassword(passwordHash);
  await createSession();
  redirect("/");
}

export async function updateWeeklyRuleAction(formData: FormData) {
  const nextRule = WEEKDAY_KEYS.reduce((accumulator, key) => {
    accumulator[key] = formData.get(key) === "on";
    return accumulator;
  }, {} as WeeklyRule);

  await updateWeeklyRule(nextRule);
  revalidatePath("/");
}

export async function setDailyOverrideAction(formData: FormData) {
  const date = String(formData.get("date") ?? "");
  const action = String(formData.get("action") ?? "") as DailyOverrideAction;
  const today = getShanghaiDateString();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || compareDateStrings(date, today) < 0) {
    throw new Error("Invalid date.");
  }

  if (action !== "FORCE_ON" && action !== "FORCE_OFF") {
    throw new Error("Invalid action.");
  }

  await upsertDailyOverride(date, action);
  revalidatePath("/");
}

export async function clearDailyOverrideAction(formData: FormData) {
  const date = String(formData.get("date") ?? "");
  const today = getShanghaiDateString();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || compareDateStrings(date, today) < 0) {
    throw new Error("Invalid date.");
  }

  await deleteDailyOverride(date);
  revalidatePath("/");
}

export async function rotateApiKeyAction() {
  await rotateApiKey();
  revalidatePath("/");
}
