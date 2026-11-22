import path from "node:path";
import { serialize } from "next-mdx-remote/serialize";
import type { Plugin } from "vite";
import { BLOG_DIR, readPosts, type Post } from "./blog-source";

const COMPILED_MDX_ID = "\0shotstudio:compiled-blog-mdx";

function postsModule(posts: Post[]): string {
  return `
const posts = ${JSON.stringify(posts)};
export function readPosts() { return posts; }
export function readPost(slug) { return posts.find((post) => post.slug === slug); }
`;
}

async function compiledMdxModule({
  posts,
  sourceModule,
}: {
  posts: Post[];
  sourceModule: string;
}): Promise<string> {
  const bodies = await Promise.all(
    posts.map(async (post) => {
      const { compiledSource } = await serialize(post.content, {}, true);
      return `${JSON.stringify(post.slug)}: function () {\n${compiledSource}\n}`;
    }),
  );
  const runtime =
    process.env.NODE_ENV === "production"
      ? "react/jsx-runtime"
      : "react/jsx-dev-runtime";
  return `
import { createElement } from "react";
import * as runtime from ${JSON.stringify(runtime)};
import { readPosts } from ${JSON.stringify(sourceModule)};

const bodies = {
${bodies.join(",\n")}
};
const bodyBySource = new Map(
  readPosts().map((post) => [post.content, bodies[post.slug]]),
);

export function MDXRemote({ source, components }) {
  const body = bodyBySource.get(source);
  if (!body) throw new Error("This MDX was not compiled at build time");
  return createElement(body(runtime).default, { components });
}
`;
}

export function blogContent({ dir = BLOG_DIR }: { dir?: string } = {}): Plugin {
  const sourceFile = path.join(process.cwd(), "src", "lib", "blog-source.ts");

  function readBuiltPosts(): Post[] {
    const posts = readPosts(dir);
    if (posts.length === 0) throw new Error(`No blog posts found in ${dir}`);
    return posts;
  }

  return {
    name: "shotstudio:blog-content",
    enforce: "pre",
    resolveId(id) {
      return id === "next-mdx-remote/rsc" ? COMPILED_MDX_ID : undefined;
    },
    load(id) {
      if (id === sourceFile) return postsModule(readBuiltPosts());
      if (id === COMPILED_MDX_ID) {
        return compiledMdxModule({ posts: readBuiltPosts(), sourceModule: sourceFile });
      }
    },
  };
}
