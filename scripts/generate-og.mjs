// One-off generator for the social preview (Open Graph) image.
// Run: node scripts/generate-og.mjs  (requires `sharp`)
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const W = 1200;
const H = 630;

// Circular avatar composited from the site's profile picture.
const avatarSize = 220;
const avatar = await sharp(path.join(root, "public/profilepic.png"))
  .resize(avatarSize, avatarSize, { fit: "cover" })
  .composite([
    {
      input: Buffer.from(
        `<svg width="${avatarSize}" height="${avatarSize}"><circle cx="${avatarSize / 2}" cy="${avatarSize / 2}" r="${avatarSize / 2}" fill="#fff"/></svg>`
      ),
      blend: "dest-in",
    },
  ])
  .png()
  .toBuffer();

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1220"/>
      <stop offset="55%" stop-color="#0d1b3a"/>
      <stop offset="100%" stop-color="#0b1220"/>
    </linearGradient>
    <radialGradient id="glow" cx="78%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#2563eb" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#2563eb" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- accent bar -->
  <rect x="0" y="0" width="14" height="${H}" fill="#2563eb"/>

  <!-- ring for avatar -->
  <circle cx="990" cy="200" r="${avatarSize / 2 + 8}" fill="none" stroke="#2563eb" stroke-width="4" opacity="0.9"/>

  <text x="90" y="250" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="82" font-weight="700" fill="#f8fafc">Lucas Loepke</text>
  <text x="92" y="315" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="34" font-weight="600" fill="#60a5fa">Software Engineer &amp; AI Developer</text>

  <text x="92" y="410" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="28" fill="#cbd5e1">Computer Science &amp; Economics @ Pitt</text>
  <text x="92" y="452" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="28" fill="#cbd5e1">Building agentic AI systems &amp; enterprise tooling @ SAP</text>

  <text x="92" y="560" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="24" font-weight="600" fill="#94a3b8">lucasloepke.github.io</text>
</svg>
`;

await sharp(Buffer.from(svg))
  .composite([{ input: avatar, left: 990 - avatarSize / 2, top: 200 - avatarSize / 2 }])
  .png()
  .toFile(path.join(root, "public/og-image.png"));

console.log("Wrote public/og-image.png");
