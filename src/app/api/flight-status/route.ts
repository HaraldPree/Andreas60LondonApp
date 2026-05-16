import { fetchFlightStatus } from "@/lib/flightStatus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const flightIata = url.searchParams.get("flight");
  const flightDate = url.searchParams.get("date") ?? undefined;

  if (!flightIata) {
    return new Response(JSON.stringify({ error: "flight param required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = await fetchFlightStatus(flightIata, flightDate);
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
