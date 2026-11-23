/**
 * Raw text imports.
 *
 * ThreeUI's registered `ThreeDPaper` component imports its self-contained
 * shader documents with Vite's `?raw` suffix. Next.js 16/Turbopack handles the
 * runtime side through `turbopack.rules`; this declaration only gives
 * TypeScript the correct string type.
 */
declare module "*.html?raw" {
  const source: string;
  export default source;
}
