import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compileMDX } from "next-mdx-remote/rsc";
import { createElement, type ComponentProps, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { build } from "vite";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { Post, PostMeta } from "./blog";
import { blogContent } from "./blog-vite-plugin";

const REAL_BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");
const SIZES_SLUG = "app-store-screenshot-sizes-2026";
const GENERATORS_SLUG = "best-app-store-screenshot-generators-2026";

const NEW_POST = `---
title: "A post nobody registered"
description: "Dropped into the folder."
publishedAt: "2026-12-01"
---

Hello **world**.
`;

// Proves the MDX components still apply, the way mdx-content.tsx uses them.
const components = {
  strong: (props: ComponentProps<"strong">) =>
    createElement("strong", { ...props, className: "custom" }),
};

type WorkerBlog = {
  getAllPosts(): Post[];
  getAllPostMetas(): PostMeta[];
  getPostBySlug(slug: string): Post | undefined;
  MDXRemote(props: {
    source: string;
    components: typeof components;
  }): ReactElement | Promise<ReactElement>;
};

describe("blog content built into the Worker", () => {
  let tempDir: string;
  let worker: WorkerBlog;

  const entryFile = () => path.join(tempDir, "entry.ts");

  function buildWorkerBlog(contentDir: string, outDir: string) {
    return build({
      configFile: false,
      logLevel: "silent",
      plugins: [blogContent({ dir: contentDir })],
      resolve: { alias: { "@": path.join(process.cwd(), "src") } },
      ssr: { noExternal: true },
      build: {
        ssr: entryFile(),
        outDir,
        minify: false,
        rollupOptions: { output: { entryFileNames: "worker-blog.mjs" } },
      },
    });
  }

  beforeAll(async () => {
    // The Worker runs the production build of everything.
    vi.stubEnv("NODE_ENV", "production");
    // Inside the project, so the entry below can resolve packages.
    const cacheDir = path.join(process.cwd(), "node_modules", ".cache");
    fs.mkdirSync(cacheDir, { recursive: true });
    tempDir = fs.mkdtempSync(path.join(cacheDir, "blog-worker-"));
    const contentDir = path.join(tempDir, "content");
    fs.cpSync(REAL_BLOG_DIR, contentDir, { recursive: true });
    fs.writeFileSync(path.join(contentDir, "brand-new-post.mdx"), NEW_POST);

    fs.writeFileSync(
      entryFile(),
      `export * from "@/lib/blog";
       export { MDXRemote } from "next-mdx-remote/rsc";`,
    );
    await buildWorkerBlog(contentDir, path.join(tempDir, "out"));

    // Workers have no project files: nothing may need the folder after the build.
    fs.rmSync(contentDir, { recursive: true });

    const bundle = path.join(tempDir, "out", "worker-blog.mjs");
    worker = (await import(
      /* @vite-ignore */ pathToFileURL(bundle).href
    )) as WorkerBlog;
    vi.unstubAllEnvs();
  }, 120_000);

  afterAll(() => {
    vi.unstubAllGlobals();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("lists every post, including one added to the folder with no other step", () => {
    const slugs = worker.getAllPostMetas().map((p) => p.slug);
    expect(slugs[0]).toBe("brand-new-post");
    expect(slugs.toSorted()).toEqual([
      SIZES_SLUG,
      GENERATORS_SLUG,
      "brand-new-post",
    ]);
  });

  it("serves a post's frontmatter the way the live site shows it", () => {
    const post = worker.getPostBySlug(SIZES_SLUG);
    expect(post).toMatchObject({
      slug: SIZES_SLUG,
      title: "App Store screenshot sizes 2026: the full spec",
      publishedAt: "2026-05-10",
      updatedAt: "2026-11-11",
      heroImage: "/blog/screenshot-sizes-hero.png",
    });
    expect(post?.readingTime).toMatch(/^\d+ min read$/);
  });

  it("returns nothing for an unknown slug", () => {
    expect(worker.getPostBySlug("nope")).toBeUndefined();
    expect(worker.getPostBySlug("__proto__")).toBeUndefined();
  });

  it("renders the same HTML as the Next build, with no code generation at request time", async () => {
    for (const filename of fs.readdirSync(REAL_BLOG_DIR)) {
      const slug = filename.replace(/\.mdx$/, "");
      const source = worker.getPostBySlug(slug)!.content;
      const next = await compileMDX({ source, components });
      const expected = renderToStaticMarkup(next.content);

      // workerd refuses `new Function`, which is how MDXRemote normally runs.
      vi.stubGlobal("Function", function blocked() {
        throw new EvalError("Code generation from strings disallowed");
      });
      const element = await worker.MDXRemote({ source, components });
      vi.unstubAllGlobals();

      expect(renderToStaticMarkup(element)).toBe(expected);
    }
    expect(fs.readdirSync(REAL_BLOG_DIR).length).toBeGreaterThan(0);
  });

  it("applies the MDX components to a post added to the folder", async () => {
    const source = worker.getPostBySlug("brand-new-post")!.content;
    const element = await worker.MDXRemote({ source, components });
    expect(renderToStaticMarkup(element)).toBe(
      '<p>Hello <strong class="custom">world</strong>.</p>',
    );
  });

  it("fails loudly for content it did not compile, rather than rendering nothing", async () => {
    await expect(
      (async () => worker.MDXRemote({ source: "not built", components }))(),
    ).rejects.toThrow(/not compiled at build time/);
  });

  it("stops the build when the folder has no posts, rather than shipping an empty blog", async () => {
    const emptyDir = path.join(tempDir, "empty");
    fs.mkdirSync(emptyDir);
    await expect(buildWorkerBlog(emptyDir, path.join(tempDir, "empty-out"))).rejects.toThrow(
      /No blog posts found/,
    );
  });
});
