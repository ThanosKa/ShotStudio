This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Cloudflare Workers

The app runs on Cloudflare Workers through [vinext](https://github.com/cloudflare/vinext). `NEXT_PUBLIC_*` values come from `.env.production.local` at build time, and every other value is a Worker secret declared in `cloudflare.config.ts`.

```bash
pnpm build:vinext
pnpm exec cf deploy --prebuilt
```

Both need Node 24.22 or newer. **Merging to `main` does not update the Worker**: production only changes when someone runs these two commands. CI only runs lint, type-check, tests and build.

`shotstudio.dev` runs on the Worker. `www.shotstudio.dev` stays on Vercel for its redirect to the apex, so the domain must stay in the Vercel project until something else serves that redirect. The Vercel project is the fallback, and it still builds from `main`.
