/**
 * Flipr icon generator
 * Generates all required PWA/web icons from an SVG source using sharp
 */
import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, 'public');

// ── SVG source ──────────────────────────────────────────────────────────────
// Zap bolt on a violet→purple gradient square (rounded for app icon)
// The bolt is the Lucide "zap" path, scaled and centered

function makeSVG(size, rounded = false) {
  const r = rounded ? Math.round(size * 0.22) : 0; // iOS-style rounding
  // Zap path scaled to fill ~55% of the icon, centered
  // Original lucide zap viewBox is 24x24
  // We scale it to ~55% of our icon size and center it
  const iconSize = size * 0.52;
  const offset = (size - iconSize) / 2;
  const scale = iconSize / 24;
  const tx = offset;
  const ty = offset;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="60%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.22)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <!-- Shine overlay -->
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#shine)"/>

  <!-- Zap icon (Lucide path, filled white) -->
  <g transform="translate(${tx}, ${ty}) scale(${scale})">
    <!-- Lucide zap filled: a lightning bolt polygon -->
    <polygon
      points="13,2 4.5,13.5 11,13.5 10.5,22 19.5,10.5 13,10.5"
      fill="white"
      stroke="none"
    />
  </g>
</svg>`;
}

// Favicon SVG (used as favicon.svg — modern browsers support it)
function makeFaviconSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="7" fill="url(#bg)"/>
  <polygon
    points="18,4 9,17 15.5,17 15,28 24,15 17.5,15"
    fill="white"
  />
</svg>`;
}

async function generate() {
  console.log('⚡ Generating Flipr icons...\n');

  // 1. favicon.svg (modern browsers — best quality at any size)
  const faviconSvg = makeFaviconSVG();
  writeFileSync(`${PUBLIC}/favicon.svg`, faviconSvg);
  console.log('✓ favicon.svg');

  // 2. favicon.ico (16x16 + 32x32 embedded) — use 32px PNG
  const favicon32 = await sharp(Buffer.from(makeSVG(32, true)))
    .resize(32, 32)
    .png()
    .toBuffer();
  // Write as .ico by just writing the PNG (most browsers accept PNG-as-ICO)
  await sharp(Buffer.from(makeSVG(32, true)))
    .resize(32, 32)
    .toFile(`${PUBLIC}/favicon.ico`);
  console.log('✓ favicon.ico (32x32)');

  // 3. icon-192.png (PWA)
  await sharp(Buffer.from(makeSVG(192, true)))
    .resize(192, 192)
    .png()
    .toFile(`${PUBLIC}/icon-192.png`);
  console.log('✓ icon-192.png');

  // 4. icon-512.png (PWA splash)
  await sharp(Buffer.from(makeSVG(512, true)))
    .resize(512, 512)
    .png()
    .toFile(`${PUBLIC}/icon-512.png`);
  console.log('✓ icon-512.png');

  // 5. apple-touch-icon.png (180x180, iOS home screen — must have opaque bg)
  await sharp(Buffer.from(makeSVG(180, true)))
    .resize(180, 180)
    .png()
    .toFile(`${PUBLIC}/apple-touch-icon.png`);
  console.log('✓ apple-touch-icon.png (180x180)');

  // 6. apple-touch-icon.svg (vector version)
  writeFileSync(`${PUBLIC}/apple-touch-icon.svg`, makeSVG(180, true));
  console.log('✓ apple-touch-icon.svg');

  // 7. og-image concept: 1200x630 for social sharing
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d0b14"/>
      <stop offset="100%" stop-color="#1a1028"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- Decorative blob -->
  <circle cx="950" cy="150" r="280" fill="#7c3aed" opacity="0.12"/>
  <circle cx="200" cy="500" r="200" fill="#a855f7" opacity="0.08"/>
  <!-- Logo icon -->
  <rect x="80" y="220" width="90" height="90" rx="20" fill="url(#accent)"/>
  <polygon points="137,237 108,267 126,267 125,303 154,273 136,273" fill="white" transform="scale(2.1) translate(-25,-85)"/>
  <!-- Text: Flipr -->
  <text x="190" y="295" font-family="system-ui, sans-serif" font-size="72" font-weight="800" fill="white" letter-spacing="-2">Flipr</text>
  <!-- Tagline -->
  <text x="190" y="340" font-family="system-ui, sans-serif" font-size="26" font-weight="400" fill="rgba(255,255,255,0.45)">Tu panel de compra-venta en Wallapop</text>
</svg>`;

  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .png()
    .toFile(`${PUBLIC}/og-image.png`);
  console.log('✓ og-image.png (1200x630)');

  console.log('\n✅ All icons generated successfully!');
}

generate().catch(console.error);
