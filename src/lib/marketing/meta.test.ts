import { describe, expect, it } from "vitest";
import { CATEGORIES } from "@/data/categories";
import { COMPETITORS } from "@/data/competitors";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  TITLE_SUFFIX_LENGTH,
  categorySnippet,
  competitorSnippet,
  hubMetadata,
} from "@/lib/marketing/meta";

/**
 * `meta.ts` documents a length budget — titles under 60 chars *including* the
 * " — ShotStudio" suffix the root layout appends, descriptions under 155 — so
 * the brand survives SERP truncation. Nothing enforced it, which meant the
 * budget silently applied only to the snippets someone remembered to count.
 *
 * These assertions make adding a 41st category fail here rather than in a
 * truncated Google snippet. Failures report the offending string and its
 * length, so the fix is obvious.
 */

function tooLong(
  values: { title: string; description: string }[],
  pick: (v: { title: string; description: string }) => string,
  budget: number,
): string[] {
  return values
    .map(pick)
    .filter((v) => v.length > budget)
    .map((v) => `${v.length} chars: ${v}`);
}

describe("categorySnippet", () => {
  const snippets = CATEGORIES.map(categorySnippet);

  it("keeps every title inside the budget once the brand suffix is appended", () => {
    expect(
      tooLong(snippets, (s) => s.title, MAX_TITLE_LENGTH - TITLE_SUFFIX_LENGTH),
    ).toEqual([]);
  });

  it("keeps every description inside the budget", () => {
    expect(
      tooLong(snippets, (s) => s.description, MAX_DESCRIPTION_LENGTH),
    ).toEqual([]);
  });

  it("covers every category", () => {
    expect(snippets).toHaveLength(CATEGORIES.length);
    expect(snippets.every((s) => s.title && s.description)).toBe(true);
  });
});

describe("hubMetadata", () => {
  /**
   * This pins the exact object the five hub pages used to declare inline. It is
   * the proof that folding them into one helper changed no emitted tag: if this
   * shape drifts, the canonical, the OG url or the brand suffix has moved.
   */
  it("emits exactly the metadata the hub pages declared by hand", () => {
    expect(
      hubMetadata({
        title: "Privacy — your screenshots are never stored",
        description: "Exactly what we store and what we don't.",
        path: "/privacy",
      }),
    ).toEqual({
      title: "Privacy — your screenshots are never stored",
      description: "Exactly what we store and what we don't.",
      alternates: { canonical: "/privacy" },
      openGraph: {
        title: "Privacy — your screenshots are never stored — ShotStudio",
        description: "Exactly what we store and what we don't.",
        url: "https://shotstudio.dev/privacy",
      },
    });
  });

  it("keeps the canonical root-relative and the OpenGraph url absolute", () => {
    const meta = hubMetadata({ title: "T", description: "D", path: "/blog" });
    expect(meta.alternates?.canonical).toBe("/blog");
    expect(meta.openGraph).toMatchObject({ url: "https://shotstudio.dev/blog" });
  });
});

describe("competitorSnippet", () => {
  const snippets = COMPETITORS.map(competitorSnippet);

  // Competitor titles are absolute — they fold the brand in themselves rather
  // than taking the layout's suffix — so they get the full budget.
  it("keeps every title inside the budget", () => {
    expect(tooLong(snippets, (s) => s.title, MAX_TITLE_LENGTH)).toEqual([]);
  });

  it("keeps every description inside the budget", () => {
    expect(
      tooLong(snippets, (s) => s.description, MAX_DESCRIPTION_LENGTH),
    ).toEqual([]);
  });
});
