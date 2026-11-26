import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const tsFiles = ["**/*.ts", "**/*.tsx"];

const testFiles = [
  "**/*.test.ts",
  "**/*.test.tsx",
  "**/*.spec.ts",
  "**/*.spec.tsx",
  "tests/**",
  "**/__tests__/**",
  "vitest.setup.ts",
  "src/lib/db/test-db.ts",
];

const objectArgumentRule = [
  "error",
  {
    selector: "FunctionDeclaration[params.length>1]:not([id.name=/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|generateMetadata|generateViewport|middleware|proxy|onRequestError)$/])",
    message: "Take one object argument instead of positional params.",
  },
  {
    selector: "VariableDeclarator:not([id.name=/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|generateMetadata|generateViewport|middleware|proxy|onRequestError)$/]) > ArrowFunctionExpression[params.length>1]",
    message: "Take one object argument instead of positional params.",
  },
];

const ALLOWED_COMMENTS = [
  /^\s*prettier-ignore\s*$/,
  /^\s*eslint-(disable|enable)/,
  /^\s*@(vitest|jest)-environment\s/,
  /^\s*(@vite-ignore|webpackIgnore:)/,
  /^\/\s*<reference\s/,
  /https?:\/\/\S+/,
  /\b(copyright|license|SPDX-License-Identifier)\b/i,
];

function isDocOnExport({ comment, source }) {
  if (comment.type !== "Block" || !comment.value.startsWith("*")) return false;
  return source.getTokenAfter(comment, { includeComments: false })?.value === "export";
}

const noCommentsRule = {
  meta: {
    type: "suggestion",
    messages: {
      banned:
        "Delete this comment and let the code say it. Allowed: a license header, prettier-ignore, /** */ on an export, or a link to the issue, RFC or vendor doc that forces the behaviour.",
    },
  },
  create(context) {
    const source = context.sourceCode;
    return {
      Program() {
        for (const comment of source.getAllComments()) {
          if (comment.type === "Shebang") continue;
          if (isDocOnExport({ comment, source })) continue;
          if (ALLOWED_COMMENTS.some((pattern) => pattern.test(comment.value))) continue;
          context.report({ loc: comment.loc, messageId: "banned" });
        }
      },
    };
  },
};

const localPlugin = { rules: { "no-comments": noCommentsRule } };

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: tsFiles,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "no-restricted-syntax": objectArgumentRule,
    },
  },
  {
    files: ["src/**", ...tsFiles],
    ignores: [
      "src/app/**/error.tsx",
      "src/app/**/global-error.tsx",
      "scripts/**",
    ],
    rules: {
      "no-console": "error",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,mts,cts}"],
    plugins: { local: localPlugin },
    rules: { "local/no-comments": "error" },
  },
  {
    files: testFiles,
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/consistent-type-assertions": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-restricted-syntax": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".cloudflare/**",
    ".vinext/**",
    "dist/**",
    ".agents/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
