import type { LocationResult } from "@/app/api/identify-location/route";

export interface IdentifiedLocation {
  id: string;
  tripSlug: string;
  result: LocationResult;
  /** Optional small thumbnail (data URL) for the result list */
  thumbnailDataUrl?: string;
  identifiedAt: string;
}
