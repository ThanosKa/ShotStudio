"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ShowcaseMarquee } from "@/components/marketing/showcase-marquee";

export function Hero() {
  const reduce = useReducedMotion();

  const item = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative overflow-hidden">
      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.08, delayChildren: 0.05 }}
        className="mx-auto max-w-3xl px-6 pt-14 pb-8 text-center md:pt-20 md:pb-12"
      >
        <motion.h1
          variants={item}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-balance text-heading-lg font-semibold md:text-[56px] md:leading-[1.05] md:tracking-[-1.4px]"
        >
          <Image
            src="/app-store-badge.svg"
            alt=""
            width={40}
            height={40}
            priority
            unoptimized
            aria-hidden
            className="mr-2 inline-block size-[0.9em] align-[-0.15em] md:mr-3"
          />
          App Store screenshots in under a minute,{" "}
          <span className="text-muted-foreground">
            without the subscription.
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-4 max-w-lg text-pretty text-body-lg text-muted-foreground md:text-heading-sm"
        >
          Three raw uploads in, three polished shots back from $7, ready for App
          Store Connect.
        </motion.p>

        <motion.div
          variants={item}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex justify-center"
        >
          <Link
            href="/sign-up"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
          >
            Generate my screenshots
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        <motion.p
          variants={item}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 text-center font-mono text-caption uppercase tracking-[0.18em] text-muted-foreground"
        >
          Credits never expire · Auto-refund on failed shots · Images never
          stored
        </motion.p>
      </motion.div>

      <motion.div
        id="examples"
        initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
        className="pb-16 md:pb-24"
      >
        <ShowcaseMarquee />
      </motion.div>
    </section>
  );
}
