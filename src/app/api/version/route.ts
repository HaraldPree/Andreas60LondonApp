export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Returns the version of the currently-deployed server.
 * Compared client-side against the version baked into the client bundle
 * (NEXT_PUBLIC_BUILD_VERSION) to detect when a new deployment is live.
 *
 * Also reports whether the PIN gate is configured — useful for diagnosing
 * "I set APP_PIN in Vercel but auth still doesn't block" issues without
 * revealing the secret value itself. Knowing whether a PIN exists tells
 * us nothing about what it is, so this is safe to expose.
 */
export async function GET() {
  const version =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    "dev";

  const pin = process.env.APP_PIN?.trim() ?? "";
  const pinConfigured = pin.length > 0;

  return Response.json(
    {
      version,
      deployedAt:
        process.env.VERCEL_DEPLOYMENT_ID ?? new Date().toISOString(),
      // Gate diagnostics (safe — no secret value exposed)
      pinConfigured,
      pinLength: pinConfigured ? pin.length : 0,
      nodeEnv: process.env.NODE_ENV ?? "unknown",
    },
    {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    },
  );
}
