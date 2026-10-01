import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

let generateImage: typeof import("./openrouter").generateImage;

beforeAll(async () => {
  vi.stubEnv("OPENROUTER_API_KEY", "test-key");
  ({ generateImage } = await vi.importActual<typeof import("./openrouter")>("./openrouter"));
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockFetch(response: Response) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(response);
}

describe("generateImage", () => {
  it("posts to the images endpoint with pixel size and reference images, returns base64", async () => {
    const spy = mockFetch(Response.json({ data: [{ b64_json: "QUJD", media_type: "image/png" }] }));

    const b64 = await generateImage({
      prompt: "p",
      referenceImages: ["data:image/png;base64,AAAA"],
      imageSize: "1K",
    });

    expect(b64).toBe("QUJD");
    const [url, init] = spy.mock.calls[0];
    expect(url).toBe("https://openrouter.ai/api/v1/images");
    const body = JSON.parse(String(init?.body));
    expect(body).toMatchObject({
      model: "openai/gpt-image-2.5-sunburst",
      prompt: "p",
      size: "864x1536",
      n: 1,
      input_references: [{ type: "image_url", image_url: { url: "data:image/png;base64,AAAA" } }],
    });
  });

  it("omits input_references when none are given", async () => {
    const spy = mockFetch(Response.json({ data: [{ b64_json: "QUJD" }] }));
    await generateImage({ prompt: "p", aspectRatio: "1:1", imageSize: "2K" });
    const body = JSON.parse(String(spy.mock.calls[0][1]?.body));
    expect(body.size).toBe("2048x2048");
    expect(body).not.toHaveProperty("input_references");
  });

  it("throws on non-2xx and on empty data", async () => {
    mockFetch(new Response("nope", { status: 404 }));
    await expect(generateImage({ prompt: "p" })).rejects.toThrow("OpenRouter 404");
    mockFetch(Response.json({ data: [] }));
    await expect(generateImage({ prompt: "p" })).rejects.toThrow("no image");
  });

  it("rejects a malformed aspect ratio", async () => {
    await expect(generateImage({ prompt: "p", aspectRatio: "wide" })).rejects.toThrow("Invalid aspect ratio");
  });
});
