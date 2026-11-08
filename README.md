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
pnpm check:worker-bundle
pnpm exec cf deploy --prebuilt
```

All three need Node 24.22 or newer. This is the only deploy path. `check:worker-bundle` fails if sharp got into the Worker or the Clerk publishable key was not baked in, both of which build without an error. **Merging to `main` does not update the Worker**: production only changes when someone runs these commands. CI runs lint, type-check, tests, the Next build, the Worker build and the bundle check, but never deploys.

The deploy also sets the Worker's Cron Trigger (every 5 minutes), which refunds Generations left `pending` by a run that was cut off (see `.claude/docs/generation.md`).

To go back to an earlier version, read its id first (the newest deployment is the live one), then send all traffic to it:

```bash
pnpm exec cf workers deployments list --script-name shot-studio
pnpm exec cf workers deployments create --script-name shot-studio --strategy percentage \
  --versions '[{"version_id":"<version-id>","percentage":100}]'
```

Secrets, domains and the Cron Trigger belong to the Worker, not to a version, so they stay. A version older than the Cron Trigger has no `scheduled` handler: each run then fails in the logs and refunds nothing until the trigger is removed (dashboard: the Worker's Settings, Triggers, Cron Triggers) or a newer version is deployed.

`shotstudio.dev` runs on the Worker. `www.shotstudio.dev` stays on Vercel for its redirect to the apex, so the domain must stay in the Vercel project until something else serves that redirect. The Vercel project is the fallback, and it still builds from `main`.
