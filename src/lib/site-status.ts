import { z } from "zod";

export const STATUS_PAGE_URL = "https://thanoska.betteruptime.com";

const STATUS_RESOURCE_NAME = "ShotStudio";

const siteStateSchema = z.enum(["operational", "degraded", "downtime", "maintenance"]);

export type SiteState = z.infer<typeof siteStateSchema>;

const statusPageSchema = z.object({
  data: z.object({ attributes: z.object({ aggregate_state: z.unknown() }) }),
  included: z.array(z.unknown()).default([]),
});

const statusResourceSchema = z.object({
  type: z.literal("status_page_resource"),
  attributes: z.object({ public_name: z.string(), status: z.unknown() }),
});

type SiteStateDisplay = { label: string; dotClass: string };

const SITE_STATE_DISPLAY = {
  operational: { label: "All systems normal", dotClass: "bg-chart-3" },
  degraded: { label: "Partial outage", dotClass: "bg-chart-2" },
  downtime: { label: "Major outage", dotClass: "bg-destructive" },
  maintenance: { label: "Under maintenance", dotClass: "bg-muted-foreground" },
} satisfies Record<SiteState, SiteStateDisplay>;

const UNKNOWN_DISPLAY: SiteStateDisplay = { label: "Status", dotClass: "invisible" };

export function readSiteState(body: unknown): SiteState | null {
  const page = statusPageSchema.safeParse(body);
  if (!page.success) return null;
  const ownResource = page.data.included
    .map((item) => statusResourceSchema.safeParse(item))
    .find((item) => item.success && item.data.attributes.public_name === STATUS_RESOURCE_NAME);
  const rawState = ownResource?.success
    ? ownResource.data.attributes.status
    : page.data.data.attributes.aggregate_state;
  const state = siteStateSchema.safeParse(rawState);
  return state.success ? state.data : null;
}

export async function fetchSiteState(signal: AbortSignal): Promise<SiteState | null> {
  try {
    const response = await fetch(`${STATUS_PAGE_URL}/index.json`, { signal, cache: "no-store" });
    if (!response.ok) return null;
    const body: unknown = await response.json();
    return readSiteState(body);
  } catch {
    return null;
  }
}

export function describeSiteState(state: SiteState | null): SiteStateDisplay {
  return state ? SITE_STATE_DISPLAY[state] : UNKNOWN_DISPLAY;
}
