import type { Metadata } from "next";
import { SalonPaperScene } from "@/components/threeui";

export const metadata: Metadata = {
  title: "The SalonBook Atelier",
  description:
    "An interactive translucent 3D paper scene, styled in SalonBook's light and dark palettes.",
};

export default function PaperPage() {
  return (
    <main id="main-content" className="bg-ivory">
      <SalonPaperScene />
    </main>
  );
}
