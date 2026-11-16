import { describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs", () => ({ Show: () => null, SignUpButton: () => null }));

import { generateMetadata as competitorMetadata } from "./alternatives/[competitor]/page";
import { generateMetadata as categoryMetadata } from "./screenshots-for/[category]/page";
import { APP_URL } from "@/lib/utils";

const competitor = (slug: string) =>
  competitorMetadata({ params: Promise.resolve({ competitor: slug }) });
const category = (slug: string) =>
  categoryMetadata({ params: Promise.resolve({ category: slug }) });

describe("/alternatives/[competitor] metadata", () => {
  it("has its own Twitter card and keeps its title, description and URLs", async () => {
    const meta = await competitor("appscreens");
    const title = "AppScreens alternatives — ShotStudio, $7 one-time";
    expect(meta.title).toEqual({ absolute: title });
    expect(meta.alternates?.canonical).toBe("/alternatives/appscreens");
    expect(meta.openGraph?.title).toBe(title);
    expect(meta.openGraph?.url).toBe(`${APP_URL}/alternatives/appscreens`);
    expect(meta.openGraph?.description).toBe(meta.description);
    expect(meta.twitter).toMatchObject({
      title,
      description: meta.description,
    });
    expect(meta.twitter?.images).toBeTruthy();
  });

  it("gives empty metadata for an unknown competitor", async () => {
    expect(await competitor("no-such-competitor")).toEqual({});
  });
});

describe("/screenshots-for/[category] metadata", () => {
  it("has its own Twitter card and keeps its title, description and URLs", async () => {
    const meta = await category("finance-apps");
    const title = "Finance app screenshots: one big number wins";
    expect(meta.title).toBe(title);
    expect(meta.alternates?.canonical).toBe("/screenshots-for/finance-apps");
    expect(meta.openGraph?.title).toBe(`${title} — ShotStudio`);
    expect(meta.openGraph?.url).toBe(`${APP_URL}/screenshots-for/finance-apps`);
    expect(meta.openGraph?.description).toBe(meta.description);
    expect(meta.twitter).toMatchObject({
      title: `${title} — ShotStudio`,
      description: meta.description,
    });
    expect(meta.twitter?.images).toBeTruthy();
  });

  it("gives empty metadata for an unknown category", async () => {
    expect(await category("no-such-category")).toEqual({});
  });
});
