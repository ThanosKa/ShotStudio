import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const tsFiles = ["**/*.ts", "**/*.tsx"];

// Vitest's own globs, plus the helpers only tests import.
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

// The mechanical half of CODING_STANDARDS.md.
const objectArgumentRule = [
  "error",
  {
    selector: "FunctionDeclaration[params.length>1]:not([id.name=/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|generateMetadata|generateViewport|middleware|proxy)$/])",
    message: "Take one object argument instead of positional params.",
  },
  {
    selector: "VariableDeclarator:not([id.name=/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|generateMetadata|generateViewport|middleware|proxy)$/]) > ArrowFunctionExpression[params.length>1]",
    message: "Take one object argument instead of positional params.",
  },
];

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
  // Server code logs through `@/lib/logger`. Client error boundaries can't
  // import pino, and `scripts/` sits outside `src`, so both keep `console`.
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
    files: testFiles,
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/consistent-type-assertions": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-restricted-syntax": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // vinext build output.
    ".cloudflare/**",
    ".vinext/**",
    "dist/**",
    // Skill / agent script directories — own toolchains, not app code.
    ".agents/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
