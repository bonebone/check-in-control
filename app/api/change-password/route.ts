import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/session";
import { hashPassword } from "@/lib/crypto";
import { updatePassword } from "@/lib/db";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { password?: string };

  if (!body.password || body.password.length < 8) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  await updatePassword(await hashPassword(body.password));
  return NextResponse.json({ ok: true });
}
