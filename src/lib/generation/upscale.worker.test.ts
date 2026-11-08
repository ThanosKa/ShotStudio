import { beforeEach, describe, expect, test, vi } from "vitest";
import { logger } from "@/lib/logger";
import { upscaleToAppStore } from "./upscale.worker";

// The real binding only exists on Cloudflare, so this fakes that one boundary
// and checks the request against Cloudflare's documented options. The result
// itself can only be proven on the deployed Worker.
const calls = vi.hoisted(() => ({
  input: [] as Uint8Array[],
  transform: [] as unknown[],
  output: [] as unknown[],
  failWith: null as Error | null,
}));

vi.mock("cloudflare:workers", () => ({
  env: {
    IMAGES: {
      input(stream: ReadableStream<Uint8Array>) {
        const chain = {
          transform(options: unknown) {
            calls.transform.push(options);
            return chain;
          },
          async output(options: unknown) {
            if (calls.failWith) throw calls.failWith;
            calls.output.push(options);
            calls.input.push(new Uint8Array(await new Response(stream).arrayBuffer()));
            return { response: () => new Response(new Uint8Array([1, 2, 3])) };
          },
        };
        return chain;
      },
    },
  },
}));

describe("upscaleToAppStore (Worker runtime)", () => {
  beforeEach(() => {
    calls.input.length = 0;
    calls.transform.length = 0;
    calls.output.length = 0;
    calls.failWith = null;
  });

  // Past the monthly allowance every Generation fails and is refunded, so the
  // product is shut without anyone noticing unless this is logged as such.
  test("logs an error naming the monthly Images limit when the binding answers 9422", async () => {
    const error = vi.spyOn(logger, "error").mockImplementation(() => undefined as never);
    calls.failWith = new Error("IMAGES_TRANSFORM_ERROR 9422: Exceeded monthly transformations");

    await expect(upscaleToAppStore(Buffer.from([1]).toString("base64"))).rejects.toThrow("9422");

    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({ err: calls.failWith }),
      "cloudflare images monthly transformation limit reached",
    );
    error.mockRestore();
  });

  test("asks the Images binding for a 1290x2796 PNG, enlarged if needed and centre-cropped", async () => {
    const png = await upscaleToAppStore(Buffer.from([9, 8, 7]).toString("base64"));

    expect(calls.input).toEqual([new Uint8Array([9, 8, 7])]);
    // `cover` enlarges small images; `crop` would not. No `gravity`: Cloudflare
    // documents the centre as the default.
    expect(calls.transform).toEqual([{ width: 1290, height: 2796, fit: "cover" }]);
    expect(calls.output).toEqual([{ format: "image/png" }]);
    expect([...png]).toEqual([1, 2, 3]);
  });
});
