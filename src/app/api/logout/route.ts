import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "app_session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
