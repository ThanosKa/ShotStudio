"use client";

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
    <section className="relative overflow-hidden bg-muted/40">
      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.08, delayChildren: 0.05 }}
        className="mx-auto max-w-4xl px-6 pt-24 pb-12 text-center md:pt-32 md:pb-16"
      >
        <motion.h1
          variants={item}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
        >
          Marketing-grade App Store screenshots,{" "}
          <span className="text-muted-foreground">
            without the subscription.
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground md:text-lg"
        >
          Pay $7 once. Get four polished shots back, ready for App Store
          Connect.
        </motion.p>

        <motion.div
          variants={item}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex justify-center"
        >
          <Link
            href="/sign-up"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
          >
            Generate my screenshots
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
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
