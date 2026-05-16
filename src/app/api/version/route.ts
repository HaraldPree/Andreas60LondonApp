export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Returns the version of the currently-deployed server.
 * Compared client-side against the version baked into the client bundle
 * (NEXT_PUBLIC_BUILD_VERSION) to detect when a new deployment is live.
 */
export async function GET() {
  const version =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    "dev";

  return Response.json(
    {
      version,
      deployedAt:
        process.env.VERCEL_DEPLOYMENT_ID ?? new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    },
  );
}
