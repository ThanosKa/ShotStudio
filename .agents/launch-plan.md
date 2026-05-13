# ShotStudio Launch Plan

*Generated 2026-05-13. Today is Wednesday. Recommended Product Hunt launch: **Tuesday 2026-05-19, 00:01 PT.***

This is a concrete, dated execution playbook — not a framework. Read top-to-bottom once, then work down it.

---

## Strategic Frame

**Phase:** You've launched the site. Now you're in Phase 5 (Full Launch) of the ORB framework — what's missing is concentrated *distribution moments* to compound the launch into noticed traffic.

**Audience:** Indie iOS developers (also indie hackers, freelancers, two-person studios). They cluster on:
- **Twitter/X** — the primary indie iOS / build-in-public watering hole
- **Reddit** — r/iOSProgramming, r/swift, r/SideProject, r/indiehackers, r/iosdev
- **Hacker News** — Show HN
- **Product Hunt** — tech-savvy early adopters
- **IndieHackers.com** — milestone posts
- **iOS Dev Weekly newsletter** — Dave Verwer reaches every serious indie iOS dev

**ORB allocation right now:**
- **Rented (90%)** — most of the launch week is rented channels (PH, HN, Reddit, X). That's correct: speed-to-noticed beats owned channels you don't have yet.
- **Borrowed (10%)** — light outreach to iOS Dev Weekly and 1–2 indie iOS YouTubers in week 2.
- **Owned (build during the run)** — every visitor should get pulled into an email capture or X follow. You're trying to convert *rented* attention into *owned* relationships.

**The launch hook (use this everywhere — vary the prose, not the substance):**

> ShotStudio generates three polished App Store screenshots from three raw simulator screens in ~1 minute. AI writes the headline from your pitch. $7 one-time, no subscription. Uploads never touch our disk.

This single sentence has every wedge: speed (1 min), output (3 shots, 1290×2796), AI (headline + layout), pricing (one-time, $7), privacy (zero persistence).

---

## Week 1 — Concentrated Launch Push (May 13–19)

### Day 0 — Wed May 13 (today): Asset prep + hunter outreach

**1. Lock the Product Hunt launch date: Tue May 19, 00:01 PT.**
- Tue–Thu are the right days. Avoid weekends (low traffic) and Mondays (Apple keynote / news days crowd you out).
- Create the PH listing now in draft, schedule for 00:01 PT Tue. (You're in the US; if you're not, set an alarm.)

**2. Find a hunter.**
- A hunter with their own followers gives a ranking bump. If you have someone who's hunted #1 or #2 before, ideal. If not, you can hunt yourself — it's no longer the penalty it used to be.
- DM @chrismessina (the original PH hunter) or @kevinwilliam — both still active. Worst case: hunt yourself.

**3. Prep PH assets:**
- [ ] **Tagline** (60 chars max): "App Store screenshots in under a minute, $7 once"
- [ ] **Description** (260 chars): Use the launch hook above
- [ ] **Gallery (4 images)**: (1) hero — before/after of a real generation; (2) the 1-min flow as a 3-panel GIF; (3) the 3-shot output side-by-side with a real App Store listing; (4) pricing — $7 once, no subscription
- [ ] **Demo video (60s max)**: Screen-record one real generation. Show: upload → ~60s wait (cut to 8s) → 3 polished shots. Caption text only, no voiceover.
- [ ] **First comment** (write it now, paste it at 00:02 PT): Why you built it, what's behind the privacy commitment, what's *not* in v1 (Android, video, subscriptions). Indies trust founders who admit gaps.

**4. Prep the Show HN post:**
- [ ] **Title**: "Show HN: ShotStudio – AI-generated App Store screenshots, $7 one-time"
- [ ] **Body** (HN rewards plain text, technical detail): Tech stack (Next.js, OpenRouter gpt-image, Clerk, Stripe), the privacy architecture (no images table, in-memory pass-through, why), the credit accounting model (debit-before-AI, refund-on-failure). HN respects engineering honesty.
- [ ] Post Thursday May 21 at 9am PT (not the same day as PH — splits attention). HN front-page peak is 9am–11am PT weekdays.

**5. Twitter/X thread (publish Tue same time as PH):**

```
Built ShotStudio: drop 3 raw iOS screenshots, get 3 polished App Store shots back in ~1 min.

AI writes the headline from your pitch. $7 once.
No subscription. No images stored.

Indie iOS devs — this is for the night before submission. ↓

[GIF of the flow]

(1/8)
```

Continue with: pricing breakdown, privacy architecture (the "no images table" detail is sticky), failed-gen auto-refund, the 4 personality presets, what's NOT in v1, what's next, CTA.

**Brand voice (per product context):** dry, declarative, specific numbers. *Avoid* "AI-powered," "platform," "users." *Use* indie, ship, three shots, 1290×2796.

### Day 1 — Thu May 14: Reddit + Indie Hackers prep

Don't post yet — Reddit punishes new accounts hard. Today: warm them up.

- [ ] Comment substantively on 5 posts in r/iOSProgramming, r/swift, r/SideProject, r/indiehackers. Be useful, not promotional. Build karma.
- [ ] Draft your **Indie Hackers** milestone post: "I launched my $7 one-time pay App Store screenshot generator." IH rewards revenue numbers and lessons — share the credit-pack pricing math, the OpenRouter cost-per-image margin, what worked and didn't in build.
- [ ] Draft **r/SideProject** post (separate from launch — softer pitch): "I built a $7 App Store screenshot generator — feedback wanted." This subreddit *loves* indie tools and tolerates founders posting their own work.

### Day 2 — Fri May 15: Build-in-public X posts (warm-up sequence)

Start posting on X *now* — don't wait for launch day. The PH bump is bigger when followers are already primed.

Three posts, spaced through the day:

1. **Morning**: "Spent the weekend rebuilding our pricing page after realizing $7 doesn't read as 'serious enough.' Kept it at $7 anyway. Indies don't want $29 entry, they want $7 entry." (+ screenshot of pricing page)
2. **Midday**: A specific build detail — "ShotStudio doesn't store images. No table, no S3 bucket, no thumbnail cache. The model gets bytes from memory, generates, returns, and we drop the buffer. That's the *only* way 'privacy' is a feature, not a marketing claim." (+ screenshot of relevant code or arch diagram)
3. **Evening**: A before/after example of one real generation.

### Day 3–4 — Sat May 16 + Sun May 17: Quiet weekend, sharpen assets

- [ ] Re-record the demo video if it's not <60s
- [ ] Test the OG image preview on the live URL using [opengraph.xyz](https://www.opengraph.xyz/)
- [ ] Have 2 friends do a full unfamiliar-user flow — sign up, buy $7, generate. Note every friction point. Fix anything that can be fixed by Mon evening.

### Day 5 — Mon May 18: Final prep + soft outreach

- [ ] DM 10 people who might amplify on Tuesday. Don't ask for upvotes (PH-banned). Ask: "Launching tomorrow on PH. Would value your honest feedback in the comments — even critical." Indies will show up for that framing.
- [ ] Schedule the X thread for Tue 00:02 PT
- [ ] Schedule a follow-up X reply: "We're live on Product Hunt: [URL]" at 06:00 PT (so you don't get rate-limited at 00:01)
- [ ] Email any existing list (even 5 people): "Launching tomorrow. Reply with anything broken."

### Day 6 — **Tue May 19: PRODUCT HUNT LAUNCH** 🚀

**00:01 PT** — PH listing goes live. Founder comment posted at 00:02.
**00:05 PT** — X thread published.
**06:00 PT** — "We're live" reply on the thread + new standalone tweet.
**07:00 PT** — Post to r/SideProject (use draft from Day 1).
**09:00 PT** — Indie Hackers milestone post live.

**All day**: Reply to every PH comment within 15 minutes. Every comment. The PH algorithm rewards engagement velocity, and indies notice when founders show up. Don't take meetings. Don't context-switch.

**Avoid**: Posting to r/iOSProgramming or r/swift today — the moderators are strict, you risk a ban. Save those for Day 7+ after the dust settles, with a "what I learned launching" angle, not a launch post.

---

## Week 2 — Sustain + Convert the Bump (May 20–26)

The PH spike lasts ~36 hours. The job in week 2 is converting curious visitors into owned-channel relationships.

### Wed May 20: Show HN
- 9:00 AM PT post (see Day 0 prep)
- Same engagement rule: reply to every comment, fast. HN especially rewards engineering substance.

### Thu May 21: Directory submissions wave 1 — AI tool sites

Submit to these in priority order (free unless noted). Each takes 5–15 min:

| Directory | URL | Notes |
|---|---|---|
| There's An AI For That | theresanaiforthat.com | Massive AI-tool aggregator |
| Futurepedia | futurepedia.io | Top AI tool directory by traffic |
| Toolify | toolify.ai | AI tool listing |
| AI Tools Directory | aitoolsdirectory.com | Submission queue |
| Future Tools | futuretools.io | Curated, slower review |
| Insidr | insidr.ai | AI tool roundup site |
| There's An AI | theresanaifor.com | Different from #1 |

### Fri May 22: Directory submissions wave 2 — indie launch sites

| Directory | URL | Notes |
|---|---|---|
| BetaList | betalist.com | Long-running indie launch site |
| Peerlist | peerlist.io/launch | Strong indie/dev audience |
| Tiny Launch | tinylaunch.com | New, hungry for submissions |
| Uneed | uneed.best | Curated weekly |
| Fazier | fazier.com | Weekly leaderboard |
| Launching Next | launchingnext.com | Free |
| AppSumo Sumo Day | (skip — not a fit for one-time SaaS) | |

### Mon May 26: iOS Dev Weekly outreach
- Email Dave Verwer (publisher of iOS Dev Weekly): contact@iosdevweekly.com
- Subject: "Tool submission — ShotStudio (1-min App Store screenshots)"
- Body: 3 sentences. What it is, who it's for, the privacy commitment (he cares). Link.
- Newsletter goes out Fri — submissions need to be in by Wed.

---

## Week 3 — Borrowed Channels + Reddit Native (May 27–Jun 2)

### Reddit (now safe to post)

Post to one subreddit at a time, spaced 3–4 days apart. **Different framing per subreddit** — repeating the same post is the fastest way to get banned.

- **r/iOSProgramming** — Mon May 27. Frame: "I built a tool that generates 1290×2796 App Store screenshots from raw simulator screens. Would love feedback from indies who've shipped." Lead with the spec, not the price. This sub is technical.
- **r/swift** — Wed May 29. Frame: "Privacy-first architecture: how I built an image-generation SaaS with zero image persistence." Lead with the engineering, mention the product at the end.
- **r/indiehackers** — Fri May 31. Frame: "I launched a $7 one-time pay screenshot tool — here are the numbers." Lead with revenue/cost math, not the product.

### iOS YouTubers / Newsletters — light outreach

| Person | Where | Approach |
|---|---|---|
| Sean Allen | YouTube (indie iOS) | DM or email — offer free credits + the architecture story |
| Paul Hudson (Hacking with Swift) | hackingwithswift.com | He runs sponsorships — pitch a one-week sponsored slot at indie-friendly rates |
| Antoine van der Lee (SwiftLee) | swiftlee.com | Newsletter; pitch with the privacy angle |
| Dominik Hauser (continued learning) | YouTube | Smaller audience but indie-aligned |

**Outreach script (use verbatim, vary names):**

> Hi [Name] — I built ShotStudio, a $7 one-time pay App Store screenshot generator for indie iOS devs. Three raw screens → three polished 1290×2796 shots in ~1 min, AI-written headlines, no subscription.
>
> Not a paid pitch — just hoping it might be useful to your audience. Free credits if you want to try it (no obligation). The privacy architecture might be of interest: we don't store uploads at all.
>
> [URL]
>
> Cheers, [Your name]

Send 5–10 of these total. Don't follow up if no reply.

---

## Week 4+ — Ongoing Cadence

### Twitter/X — sustained build-in-public
3 posts/week. Specific, technical, with screenshots. Topics:
- Real generations (anonymized) — before/after
- A pricing math post — "$7 entry: here's the unit economics"
- A privacy architecture deep-dive
- A "what I learned launching" thread (reuse PH learnings)
- A "should I add Android?" poll
- A roadmap-from-revenue thread once you have purchases

### Email capture
- Add a single-input email capture to the homepage footer ("Get notified when Android support ships"). Even 20–50 emails is the start of an owned channel.
- Send one launch-week recap email to whoever signs up. Then go quiet until you have something to say.

### Comparison pages → traffic loop
The `/alternatives/*` pages you have are *passive* SEO assets. To get them ranking faster:
- Each PH/HN/Reddit/Twitter post should occasionally link to the most relevant alternative page (not the homepage). This sends Google a backlink signal that those pages matter.
- Add the `/alternatives` hub to your site nav if it's not already.

---

## Critical Don'ts

- **Don't ask for PH upvotes in DMs or posts.** Auto-ban. Ask for comments only.
- **Don't post the same exact launch text to multiple subreddits same week.** Auto-spam-flag.
- **Don't post to r/iOSProgramming or r/swift on launch day.** Strict mods. Wait, soften framing, lead with engineering.
- **Don't run paid ads in launch week.** You don't know what converts yet. Wait until you have organic baseline + funnel data.
- **Don't redesign the site on launch day** based on early feedback. Capture feedback, sit with it for 3 days, then prioritize.
- **Don't ignore HN comments because they're harsh.** HN is harsh by design. Respond technically, never defensively. The watchers convert better than the commenters.

---

## What "Success" Looks Like — Honest Baselines

Most launches do less than founders expect. Realistic for a $7 indie tool with no existing audience:

| Channel | Realistic 30-day | Stretch |
|---|---|---|
| Product Hunt | 200–500 upvotes, top 10–20 of day | Top 5 of day |
| Show HN | 50–150 points if it hits front page; 0–10 if it doesn't | Front-page top 10 |
| Reddit (across subs) | 200–800 total upvotes, 2k–10k visits | 20k+ visits |
| Twitter | 50–300 new followers, 5–50k thread impressions | 100k+ thread |
| Direct purchases from launch week | 20–80 paid conversions ($140–$560) | 200+ |
| Email captures | 100–500 | 2k+ |

**The goal of launch week is not revenue.** It's: (a) get the alternatives + pSEO pages indexed and linked, (b) capture a small list, (c) generate the first 5–10 testimonials, (d) learn what messaging actually converts.

Revenue from launch traffic is a bonus. The compounding asset is the indexed pages, the X followers, and the email list.

---

## Files this plan touches / produces

- This file: `.agents/launch-plan.md` (strategic reference)
- PH assets: `/public/launch/` — create this folder, drop hero GIF, demo video, gallery images here
- A `launch/` folder in your blog (`src/app/(marketing)/blog/launch-week-recap`) — write the recap post on Day 8 while it's fresh
- `src/data/competitors.ts` — already updated with accurate competitor facts (separate work)

---

## Open questions / things I can't decide for you

1. **Do you have a hunter lined up?** If not, hunt yourself — it's fine. Decide today.
2. **Will you do Show HN?** It's high-variance — front page is huge, missing it is silent. Recommend yes; cost is low.
3. **Do you have any existing audience (X followers, email list, friends with audiences)?** If yes, soft-tell them by Mon May 18. If no, this plan still works — adjust expectations toward the lower end of the "realistic" table.
4. **Are there any beta users from before the public launch?** Email them on Mon May 18 — they're your highest-conversion launch-day audience.
5. **What's the v2 hook?** Even though it's not built, knowing what comes next gives the launch post a future tense to anchor against ("v1 today; Android export in Q3").
