import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Pre-existing `as any` casts (event-handler typing workarounds in
      // Magnetic.tsx / BackgroundE.tsx) — tracked as warnings rather than
      // failing the build; tighten to "error" once they're cleaned up.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
