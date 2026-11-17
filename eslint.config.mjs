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
      ".next-*/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "figma-web/**",
      // PHP edition (static browser scripts + minified editor bundle)
      "php-site/**",
      "dist/**",
      // CommonJS by design (cPanel Passenger startup file, PM2 config)
      "server.js",
      "ecosystem.config.cjs",
    ],
  },
];

export default eslintConfig;
