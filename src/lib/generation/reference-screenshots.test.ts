import sharp from "sharp";
import { describe, expect, test, vi } from "vitest";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/identity/user-sync";
import { users } from "@/lib/db/schema";
import { generateImage } from "@/lib/openrouter";
import { upscaleToAppStore } from "@/lib/generation/upscale";
import { eq } from "drizzle-orm";
import { runGeneration } from "./lifecycle";

const ROLES = ["hero_feature", "differentiator", "another_feature"] as const;

function upload(fill: number, name: string): File {
  return new File([new Uint8Array(64).fill(fill)], name, { type: "image/png" });
}

function dataUrlOf(file: File, bytes: number): string {
  return `data:${file.type};base64,${Buffer.alloc(64, bytes).toString("base64")}`;
}

function solidPng(rgb: [number, number, number]): Promise<Buffer> {
  return sharp({
    create: { width: 1, height: 1, channels: 3, background: { r: rgb[0], g: rgb[1], b: rgb[2] } },
  })
    .png()
    .toBuffer();
}

describe("runGeneration reference screenshots", () => {
  test("each Shot Role sends only its own Reference Screenshot, and the Set is in role order", async () => {
    await ensureUser({ userId: "u_refs", email: "u_refs@test" });
    await db.update(users).set({ credits: 3 }).where(eq(users.id, "u_refs"));

    const screenshots: [File, File, File] = [
      upload(1, "first.png"),
      upload(2, "second.png"),
      upload(3, "third.png"),
    ];
    const sent = [dataUrlOf(screenshots[0], 1), dataUrlOf(screenshots[1], 2), dataUrlOf(screenshots[2], 3)];

    const generated = await Promise.all([
      solidPng([255, 0, 0]),
      solidPng([0, 255, 0]),
      solidPng([0, 0, 255]),
    ]);
    vi.mocked(generateImage).mockImplementation(async ({ prompt }) => {
      const i = ROLES.findIndex((role) => prompt.includes(`Shot role: ${role}`));
      if (i === -1) throw new Error("prompt names no known Shot Role");
      return generated[i].toString("base64");
    });

    const outcome = await runGeneration({
      userId: "u_refs",
      appName: "Acme",
      pitch: "Track calories from a meal photo, no manual logging.",
      category: "productivity",
      stylePreset: "friendly",
      screenshots,
    });

    expect(outcome.kind).toBe("ok");
    if (outcome.kind !== "ok") return;

    const calls = vi.mocked(generateImage).mock.calls.map(([args]) => args);
    expect(calls).toHaveLength(3);
    ROLES.forEach((role, i) => {
      const forRole = calls.filter((c) => c.prompt.includes(`Shot role: ${role}`));
      expect(forRole).toHaveLength(1);
      expect(forRole[0].referenceImages).toEqual([sent[i]]);
    });

    expect(outcome.imageUrls).toHaveLength(3);
    const expected = await Promise.all(
      generated.map(async (png) => {
        const out = await upscaleToAppStore(png.toString("base64"));
        return `data:image/png;base64,${out.toString("base64")}`;
      }),
    );
    expect(outcome.imageUrls).toEqual(expected);
  });
});
