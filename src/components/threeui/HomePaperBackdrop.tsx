"use client";

import { useEffect, useState } from "react";
import { ThreeDPaper } from "@/shaders/3d-paper/ThreeDPaper";
import styles from "./HomePaperBackdrop.module.css";

/**
 * HOME HERO PAPER BACKDROP
 * ------------------------
 * The paper-page scene becomes the hero's full-bleed visual without replacing
 * any existing hero markup. It renders the exact registered component; this
 * wrapper only supplies layout, the salon photograph and the theme-aware
 * blend. The hero grid passes pointer events through outside its text column,
 * so the scene keeps its drag/hover behaviour without covering any buttons.
 */
export function HomePaperBackdrop() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Create the iframe after hydration. If it is present in the server HTML,
    // a fast-loading srcDoc can finish before React attaches onLoad and the
    // component would stay in its loading state forever.
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div aria-hidden="true" className={styles.backdrop}>
      <div className={`shader-frame ${styles.stage}`}>
        {mounted ? <ThreeDPaper variant="original" /> : null}
      </div>
    </div>
  );
}
