import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
    ],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@next/next/no-img-element": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];