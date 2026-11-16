import { setTimeout as realSleep } from "node:timers/promises";
import pino from "pino";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { generateImage } from "@/lib/openrouter";
import { generateSet, type Brief } from "./shot-set";

const log = pino({ level: "silent" });

const brief: Brief = {
  appName: "Acme",
  pitch: "Track calories from a meal photo.",
  category: "productivity",
  stylePreset: "friendly",
  referenceScreenshots: ["data:ref-0", "data:ref-1", "data:ref-2"],
};

const PURPOSES = [
  "the hook",
  "the journey",
  "the closer",
] as const;

type Call = { prompt: string; referenceImages: string[] };

function calls(): Call[] {
  return vi.mocked(generateImage).mock.calls.map(([args]) => args as Call);
}

function callsFor(ref: string): Call[] {
  return calls().filter((c) => c.referenceImages[0] === ref);
}

async function solidPng(background = "white"): Promise<string> {
  const png = await sharp({
    create: { width: 4, height: 4, channels: 3, background },
  })
    .png()
    .toBuffer();
  return png.toString("base64");
}

async function run(): Promise<ReturnType<typeof generateSet>> {
  const pending = generateSet(brief, log);
  await vi.runAllTimersAsync();
  return pending;
}

describe("generateSet", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(generateImage).mockReset();
    vi.mocked(generateImage).mockImplementation(async () => solidPng());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test("ok returns three 1290x2796 PNG data URLs, in Shot Role order", async () => {
    const outcome = await run();

    expect(outcome.kind).toBe("ok");
    if (outcome.kind !== "ok") return;
    expect(outcome.shots).toHaveLength(3);
    for (const url of outcome.shots) {
      expect(url.startsWith("data:image/png;base64,")).toBe(true);
      const png = Buffer.from(url.split(",")[1], "base64");
      const meta = await sharp(png).metadata();
      expect(meta.format).toBe("png");
      expect([meta.width, meta.height]).toEqual([1290, 2796]);
    }
  });

  test("keeps Shot Role order even when the shots finish out of order", async () => {
    const colours = ["red", "green", "blue"];
    const images = await Promise.all(colours.map((c) => solidPng(c)));
    vi.mocked(generateImage).mockImplementation(async ({ referenceImages }) => {
      const idx = Number(referenceImages![0].slice(-1));
      // The first Shot Role answers last.
      await new Promise((r) => setTimeout(r, (3 - idx) * 100));
      return images[idx];
    });

    const outcome = await run();

    expect(outcome.kind).toBe("ok");
    if (outcome.kind !== "ok") return;
    const centres = await Promise.all(
      outcome.shots.map(async (url) => {
        const { data } = await sharp(Buffer.from(url.split(",")[1], "base64"))
          .extract({ left: 645, top: 1398, width: 1, height: 1 })
          .raw()
          .toBuffer({ resolveWithObject: true });
        return [...data];
      }),
    );
    expect(centres[0][0]).toBeGreaterThan(200); // red
    expect(centres[1][1]).toBeGreaterThan(100); // green
    expect(centres[2][2]).toBeGreaterThan(200); // blue
  });

  test("sends each Shot Role its own Reference Screenshot", async () => {
    await run();

    expect(calls()).toHaveLength(3);
    PURPOSES.forEach((purpose, i) => {
      const matching = callsFor(`data:ref-${i}`);
      expect(matching).toHaveLength(1);
      expect(matching[0].referenceImages).toEqual([`data:ref-${i}`]);
      expect(matching[0].prompt).toContain(purpose);
    });
    expect(callsFor("data:ref-0")[0].prompt).toContain("hero_feature");
    expect(callsFor("data:ref-1")[0].prompt).toContain("differentiator");
    expect(callsFor("data:ref-2")[0].prompt).toContain("another_feature");
  });

  test("a failed first attempt and a good second attempt give ok, with two calls for that Shot Role", async () => {
    let failedOnce = false;
    vi.mocked(generateImage).mockImplementation(async ({ referenceImages }) => {
      if (referenceImages![0] === "data:ref-1" && !failedOnce) {
        failedOnce = true;
        throw new Error("boom");
      }
      return await solidPng();
    });

    const outcome = await run();

    expect(outcome.kind).toBe("ok");
    expect(callsFor("data:ref-1")).toHaveLength(2);
    expect(callsFor("data:ref-0")).toHaveLength(1);
    expect(callsFor("data:ref-2")).toHaveLength(1);
  });

  test("a Shot Role that fails twice gives failed 1 of 3 and does not throw", async () => {
    vi.mocked(generateImage).mockImplementation(async ({ referenceImages }) => {
      if (referenceImages![0] === "data:ref-2") throw new Error("down");
      return solidPng();
    });

    const outcome = await run();

    expect(outcome).toEqual({ kind: "failed", failed: 1, total: 3 });
    expect(callsFor("data:ref-2")).toHaveLength(2);
  });
  test("a Shot Role whose two attempts both fail settles after the single wait between them", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    vi.mocked(generateImage).mockImplementation(async ({ referenceImages }) => {
      if (referenceImages![0] === "data:ref-2") throw new Error("down");
      return solidPng();
    });
    let settled: Awaited<ReturnType<typeof generateSet>> | undefined;
    void generateSet(brief, log).then((o) => {
      settled = o;
    });

    await vi.advanceTimersByTimeAsync(1000);
    // The other two Shots upscale with real sharp work; wait for it in real time.
    for (let i = 0; i < 100 && !settled; i++) await realSleep(50);

    expect(settled).toEqual({ kind: "failed", failed: 1, total: 3 });
    expect(vi.getTimerCount()).toBe(0);
  });

  test.each([
    [0, 500],
    [0.999, 999.5],
  ])(
    "the wait between the first and second attempt is between 0.5 and 1 s (random %s)",
    async (random, waitMs) => {
      vi.spyOn(Math, "random").mockReturnValue(random);
      vi.mocked(generateImage).mockImplementation(async ({ referenceImages }) => {
        if (referenceImages![0] === "data:ref-1") throw new Error("down");
        return solidPng();
      });
      void generateSet(brief, log);

      await vi.advanceTimersByTimeAsync(Math.floor(waitMs) - 1);
      expect(callsFor("data:ref-1")).toHaveLength(1);
      await vi.advanceTimersByTimeAsync(2);
      expect(callsFor("data:ref-1")).toHaveLength(2);
    },
  );
});
