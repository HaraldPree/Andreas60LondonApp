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

  const aviationstackKey = process.env.AVIATIONSTACK_API_KEY?.trim() ?? "";
  const aviationstackConfigured = aviationstackKey.length > 0;

  const anthropicKey = (
    process.env.APP_ANTHROPIC_KEY ||
    process.env.RCMK_ANTHROPIC_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    ""
  ).trim();
  const anthropicConfigured = anthropicKey.length > 0;

  // Foto-Sharing-Backend (v1.1.3+: Blob-only Architektur).
  // Metadaten werden in einer Manifest-JSON im Blob selbst gespeichert
  // → KV ist nicht mehr nötig.
  const blobConfigured = !!process.env.BLOB_READ_WRITE_TOKEN?.trim();
  // kvConfigured wird informationshalber noch ausgewiesen (falls KV
  // doch noch parallel da ist), aber NICHT mehr als requirement gewertet.
  const kvConfigured =
    !!process.env.KV_REST_API_URL?.trim() &&
    !!process.env.KV_REST_API_TOKEN?.trim();
  const photoSharingReady = blobConfigured; // KV nicht mehr nötig

  const hints: string[] = [];
  if (!pinConfigured) {
    hints.push(
      "APP_PIN ist im Edge-Runtime nicht sichtbar. In Vercel setzen + Redeploy.",
    );
  }
  if (!aviationstackConfigured) {
    hints.push(
      "AVIATIONSTACK_API_KEY nicht gesetzt — Flugstatus fällt auf Flightradar24-Link zurück.",
    );
  }
  if (!anthropicConfigured) {
    hints.push(
      "APP_ANTHROPIC_KEY fehlt — KI-Chat liefert 500-Fehler.",
    );
  }
  if (!blobConfigured) {
    hints.push(
      "BLOB_READ_WRITE_TOKEN fehlt — Foto-Sharing nicht verfügbar.",
    );
  }
  // KV ist seit v1.1.3 optional — kein hint mehr

  return Response.json(
    {
      version,
      deployedAt:
        process.env.VERCEL_DEPLOYMENT_ID ?? new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      // Gate diagnostics (safe — no secret values exposed)
      pinConfigured,
      pinLength: pinConfigured ? pin.length : 0,
      // Integration diagnostics
      aviationstackConfigured,
      anthropicConfigured,
      // Foto-Sharing Storage (v1.0.1+)
      blobConfigured,
      kvConfigured,
      photoSharingReady,
      hints: hints.length > 0 ? hints : undefined,
    },
    {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    },
  );
}
