import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");

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

function readPostFile(filename: string): Post {
  const filePath = path.join(BLOG_DIR, filename);
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

function readAllPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map(readPostFile)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

/**
 * Posts are read from disk once per process. `MarketingFooter` calls
 * `getAllPostMetas()` from the `(marketing)` layout, so without this every one
 * of the ~55 prerendered pages re-ran `readdirSync` + `readFileSync` +
 * gray-matter + a word-count split over every post — ~110 parses to render two
 * footer links, growing as posts × pages.
 *
 * Only cached in production: under `next dev` the MDX files change while the
 * server is running, and editing a post must still show up on reload.
 */
const CACHE_POSTS = process.env.NODE_ENV === "production";
let postsCache: Post[] | undefined;
let postMetasCache: PostMeta[] | undefined;

export function getAllPosts(): Post[] {
  if (!CACHE_POSTS) return readAllPosts();
  return (postsCache ??= readAllPosts());
}

export function getAllPostMetas(): PostMeta[] {
  if (CACHE_POSTS && postMetasCache) return postMetasCache;
  const metas = toPostMetas(getAllPosts());
  if (CACHE_POSTS) postMetasCache = metas;
  return metas;
}

function toPostMetas(posts: Post[]): PostMeta[] {
  return posts.map(
    ({
      slug,
      title,
      description,
      publishedAt,
      updatedAt,
      readingTime,
      heroImage,
    }) => ({
      slug,
      title,
      description,
      publishedAt,
      updatedAt,
      readingTime,
      heroImage,
    }),
  );
}

export function getPostBySlug(slug: string): Post | undefined {
  const filename = `${slug}.mdx`;
  const filePath = path.join(BLOG_DIR, filename);
  if (!fs.existsSync(filePath)) return undefined;
  return readPostFile(filename);
}

export function formatPublishedAt(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
