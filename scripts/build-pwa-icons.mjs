#!/usr/bin/env node
/**
 * Pre-generates square PWA home-screen icons from Andrea's portrait photo.
 *
 * Why pre-render to static PNGs instead of using ImageResponse at runtime?
 * - Android only picks icons whose declared sizes match adaptive-icon sizes
 *   (192 / 512). Static files with exact dimensions are the most reliable.
 * - @vercel/og + Windows paths with spaces ("KIM Prototyping") error during
 *   `next build`, so a build-time generator is more portable.
 *
 * Re-run after replacing the source photo:
 *   node scripts/build-pwa-icons.mjs
 */
import sharp from "sharp";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SOURCE = join(ROOT, "public", "images", "Andrea.jpg");
const OUT_DIR = join(ROOT, "public", "icons");

// Standard PWA icon sizes. 192 = Android home-screen, 512 = adaptive icon
// + splash-screen source, 180 = iOS Safari "Add to Home Screen".
const SIZES = [192, 512, 180];

async function main() {
  // Centre-crop to square. Andrea's face is well centred (745×725 source,
  // aspect 1.027) so a default centre crop keeps her smile in frame.
  const baseSquare = sharp(SOURCE).resize({
    width: 1024,
    height: 1024,
    fit: "cover",
    position: "centre",
  });

  await Promise.all(
    SIZES.map(async (size) => {
      const out = join(OUT_DIR, `andrea-${size}.png`);
      await baseSquare
        .clone()
        .resize(size, size)
        .png({ compressionLevel: 9 })
        .toFile(out);
      console.log(`✓ ${out}`);
    }),
  );

  console.log("\nDone. Don't forget to commit public/icons/ + manifest.ts.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
