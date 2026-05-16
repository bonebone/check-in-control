import { NextResponse } from "next/server";
import { createSession } from "@/lib/session";
import { getAdminUser } from "@/lib/db";
import { verifyPassword } from "@/lib/crypto";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  const user = await getAdminUser();
  const valid = await verifyPassword(body.password ?? "", user.passwordHash);

  if (!valid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
