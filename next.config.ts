import type { NextConfig } from "next";

/**
 * Next.js configuration for the SalonBook client.
 *
 * Important Next.js 16 note:
 * - Older projects used `images.domains`, but that option is deprecated.
 * - We use `images.remotePatterns` so only the exact image hosts we trust can
 *   be optimized by next/image. This is both safer and future-proof.
 *
 * This file does NOT contain the API URL. The API origin belongs in
 * NEXT_PUBLIC_API_URL so the same build can be deployed to different hosts
 * without editing source code.
 */
const nextConfig: NextConfig = {
  /**
   * React strict mode highlights unsafe patterns during development.
   * It does not change production behaviour, but it helps catch bad effects
   * while we build the session hook and data-fetching components later.
   */
  reactStrictMode: true,

  images: {
    /**
     * Service images are uploaded to ImgBB by the Express server. The server
     * returns the public ImgBB URL, and the client renders it with next/image.
     *
     * `pathname: "/**"` allows any path under these hosts, which is required
     * because ImgBB generates random file names. We still restrict the protocol
     * to https and the hostname to ImgBB only, so arbitrary remote hosts cannot
     * be used through our image optimizer.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ibb.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
