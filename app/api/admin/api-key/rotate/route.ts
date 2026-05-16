import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/session";
import { rotateApiKey } from "@/lib/db";

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await rotateApiKey();
  return NextResponse.json({ ok: true });
}
