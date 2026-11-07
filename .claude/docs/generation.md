# Generation pipeline

- `src/app/api/generations/route.ts` declares `export const maxDuration = 300` for the long-running image calls. Don't remove it: each shot gets two attempts of up to 120s.
- In development only the `hero_feature` shot runs (`ACTIVE_ROLES` in `src/lib/generation/lifecycle.ts`), so a dev set has 1 image; other environments, tests included, produce 3.
- Any shot failing after its retry fails the whole generation: the row is marked `failed` and the one credit is refunded (see `.claude/docs/credits.md`).
- Images travel as data URLs in the response and are never stored; `generations` rows hold metadata only. The privacy page publicly promises this.

## Upscaling on the Worker

`upscaleToAppStore` has two versions with the same signature: `upscale.ts` (sharp, for `next dev`, `next build` and Vitest) and `upscale.worker.ts` (Cloudflare Images binding). The alias in `vite.config.ts` swaps them for the Worker build only, so sharp is not in the Worker bundle.

Why the binding, not a WebAssembly library: Cloudflare documents all three needs (`fit: "cover"` enlarges and crops, the centre is the default crop point, PNG is a listed output format), and the decode and encode run in Cloudflare's service, not in the Worker's CPU and memory. Use `cover`, not `crop`: `crop` does not enlarge, and AI images arrive smaller than 1290x2796.

Privacy, from Cloudflare's docs (2026-11-07): binding responses "are not automatically cached", Images storage is a separate paid feature this app does not use, and Workers Cache stays off. The docs give no explicit statement on how long the service keeps bytes while processing, and monthly billing per "unique combination of source image and parameters" means it keeps some record of each source. Do not enable Workers Cache or `env.IMAGES.hosted` on this path.

Local preview proves wiring only: Miniflare's local binding is sharp itself, so a match with the old output there says nothing about Cloudflare's service.

Local numbers (Worker preview, 864x1536 inputs of 3.6-3.7 MB, 9.5-10.7 MB PNG out):

- `workerd` CPU: 83-97 ms per shot, 95-115 ms for three shots. Over the free plan's 10 ms, far under the paid plan's limit. It includes local-only transport, and this is another machine.
- Memory: `workerd` process grew 86-88 MB for one shot and 285-389 MB for three, against a 128 MB limit. That is the whole process, with local copies and no pressure to free memory, so it is not the Worker's measured usage. The data alive at once adds up to about 80-95 MB (three data URLs, their PNGs, the uploads), before the Worker's own baseline. This is close enough to the limit to need a real check.

Still to prove on the deployed Worker, with a real Generation:

- Each Shot is exactly 1290x2796 and a real PNG, including enlarging from a smaller image.
- The crop is centred and looks like today's output.
- PNG file size, since the binding has no compression setting.
- CPU per Generation in Cloudflare's logs, and whether the free plan can run it at all.
- No `exceededMemory` outcome across three Shots, with realistic images. If it fails, reduce what the response holds in memory.
- The binding works on this account with the free plan's 5,000 unique transformations a month. Past that it returns error `9422`, which fails the Shot and refunds the Credit.
