import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Server code logs through `@/lib/logger`. Client error boundaries can't
  // import pino, and `scripts/` sits outside `src`, so both keep `console`.
  {
    files: ["src/**"],
    ignores: ["src/app/**/error.tsx", "src/app/**/global-error.tsx"],
    rules: {
      "no-console": "error",
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
