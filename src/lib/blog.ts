import { readPost, readPosts, type Post, type PostMeta } from "@/lib/blog-source";

export type { Post, PostMeta };

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
  if (!CACHE_POSTS) return readPosts();
  return (postsCache ??= readPosts());
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
  return readPost(slug);
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
