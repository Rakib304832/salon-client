"use client";

import dynamic from "next/dynamic";
import styles from "./HeroPaperCard.module.css";

/**
 * HERO PAPER CARD
 * ---------------
 * Client-only island for the registered <ThreeDPaper variant="original" />.
 * The exact source is imported from src/shaders; nothing in the shader, paper
 * geometry, typography or motion is recreated or edited here.
 *
 * `ssr: false` is required because the scene creates a WebGL context. Rendering
 * it on the server would try to touch browser-only APIs during prerendering.
 * Next.js only allows this option inside a Client Component, hence this file.
 */
const ThreeDPaper = dynamic(
  () => import("@/shaders/3d-paper/ThreeDPaper").then((mod) => mod.ThreeDPaper),
  { ssr: false },
);

export function HeroPaperCard() {
  return (
    <div className={styles.slot}>
      {/*
        The inline background overrides the opaque value set by the source's
        host style and by the shared ThreeUI class. The source already creates
        its renderer with `alpha: true`, so the WebGL clear is transparent; only
        these CSS layers needed removing to let the hero photo show through.
      */}
      <ThreeDPaper
        variant="original"
        style={{ background: "transparent" }}
      />
    </div>
  );
}
