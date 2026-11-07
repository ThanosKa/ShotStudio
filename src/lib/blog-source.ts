import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * The only blog code that touches the disk. The Worker has no project files, so
 * `blog-vite-plugin.ts` replaces this module with the posts themselves at build
 * time. It must keep exporting what that replacement exports.
 */
export const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  /** Defaults to publishedAt when not set in frontmatter. */
  updatedAt: string;
  /** Plain-language reading-time hint, e.g. "6 min read" */
  readingTime: string;
  /** Optional landscape hero image, served from /public. */
  heroImage?: string;
};

export type Post = PostMeta & {
  content: string;
};

function readPostFile(dir: string, filename: string): Post {
  const filePath = path.join(dir, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const slug = filename.replace(/\.mdx$/, "");
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readingTime = `${Math.max(1, Math.round(wordCount / 220))} min read`;

  const publishedAt = String(data.publishedAt ?? "");
  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    publishedAt,
    updatedAt: String(data.updatedAt ?? publishedAt),
    readingTime,
    heroImage: data.heroImage ? String(data.heroImage) : undefined,
    content,
  };
}

export function readPosts(dir: string = BLOG_DIR): Post[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => readPostFile(dir, f))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function readPost(slug: string): Post | undefined {
  const filename = `${slug}.mdx`;
  if (!fs.existsSync(path.join(BLOG_DIR, filename))) return undefined;
  return readPostFile(BLOG_DIR, filename);
}
