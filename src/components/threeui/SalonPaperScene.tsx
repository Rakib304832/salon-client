"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme";
import { ThreeDPaper } from "@/shaders/3d-paper/ThreeDPaper";
import styles from "./SalonPaperScene.module.css";

/**
 * SALON PAPER SCENE
 * -----------------
 * Project wrapper around the registered ThreeUI component. The component and
 * its four source documents are integrated byte-for-byte; this file only adds
 * SalonBook's salon photograph, palette and theme switch around them.
 *
 * The switch is the shared global control, not a local scene preference: the
 * paper page must follow the same palette as every other route. The exact
 * configured usage is preserved inside `.shader-frame`:
 *   <ThreeDPaper variant="original" />
 */
export function SalonPaperScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // See HomePaperBackdrop: creating the iframe after hydration guarantees
    // React receives its load event and marks the scene ready.
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section aria-labelledby="paper-scene-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>SalonBook atelier</p>
          <h2 id="paper-scene-heading" className={styles.heading}>
            The calm behind every appointment.
          </h2>
          <p className={styles.lead}>
            Drag the translucent card to turn it, or hover to catch the light.
            Switch the room between our soft ivory palette and its dark plum
            counterpart.
          </p>

          <ThemeToggle variant="segmented" local className={styles.switch} />
        </header>

        <div className={`shader-frame ${styles.stage}`}>
          {mounted ? <ThreeDPaper variant="original" /> : null}
        </div>
      </div>
    </section>
  );
}
