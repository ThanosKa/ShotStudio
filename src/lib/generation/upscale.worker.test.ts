import { beforeEach, describe, expect, test, vi } from "vitest";
import { upscaleToAppStore } from "./upscale.worker";

// The real binding only exists on Cloudflare, so this fakes that one boundary
// and checks the request against Cloudflare's documented options. The result
// itself can only be proven on the deployed Worker.
const calls = vi.hoisted(() => ({
  input: [] as Uint8Array[],
  transform: [] as unknown[],
  output: [] as unknown[],
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
