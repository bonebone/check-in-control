import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { getRequiredEnv } from "@/lib/env";
import { getSettings } from "@/lib/db";

type SessionPayload = {
  authenticated: true;
  issuedAt: number;
};

function sign(value: string) {
  return crypto.createHmac("sha256", getRequiredEnv("SESSION_SECRET")).update(value).digest("base64url");
}

function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeSession(input: string | undefined): SessionPayload | null {
  if (!input) {
    return null;
  }

  const [body, signature] = input.split(".");

  if (!body || !signature || sign(body) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    return payload.authenticated ? payload : null;
  } catch {
    return null;
  }
}

export async function createSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, encodeSession({ authenticated: true, issuedAt: Date.now() }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value) !== null;
}

export async function requireAuthenticated(options?: { allowPasswordChange?: boolean }) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }

  const settings = await getSettings();

  if (!options?.allowPasswordChange && settings.requirePasswordChange) {
    redirect("/change-password");
  }
}
