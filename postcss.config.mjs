/**
 * PostCSS configuration required by Tailwind CSS v4 in Next.js 16.
 *
 * Why this file exists:
 * - `globals.css` starts with `@import "tailwindcss"`.
 * - That import is a PostCSS plugin, not plain CSS. Without registering
 *   `@tailwindcss/postcss`, Next.js copies the raw @import/@theme text into the
 *   browser bundle and no utility classes (bg-ivory, text-plum, etc.) are made.
 * - Registering the plugin here makes Tailwind expand the import, generate the
 *   utilities, and process our @theme design tokens at build time.
 *
 * The plugin has no secrets and no environment-specific values.
 */
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
