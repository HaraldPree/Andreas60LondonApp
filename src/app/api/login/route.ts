import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "app_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: Request) {
  let body: { pin?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const submittedPin = (body.pin ?? "").trim();
  // Trim the env var too — pasting into Vercel sometimes adds trailing
  // whitespace/newlines that silently break the comparison.
  const expectedPin = process.env.APP_PIN?.trim();

  if (!expectedPin) {
    return NextResponse.json(
      { ok: true, note: "No PIN configured on server – access is open" },
      { status: 200 },
    );
  }

  if (submittedPin !== expectedPin) {
    // Small delay to slow down brute-force
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json(
      { error: "Falscher Code" },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: COOKIE_NAME,
    value: expectedPin,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return res;
}
