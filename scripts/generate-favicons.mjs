import sharp from "sharp";
import fs from "fs";
import path from "path";

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#172744"/>
      <stop offset="100%" stop-color="#0E182A"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E5D7BF"/>
      <stop offset="50%" stop-color="#B9A77A"/>
      <stop offset="100%" stop-color="#D8C8AF"/>
    </linearGradient>
  </defs>
  
  <!-- Base Luxury Midnight Background -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)"/>
  
  <!-- Subtle Champagne Gold Hairline Inner Border -->
  <rect x="24" y="24" width="464" height="464" rx="88" fill="none" stroke="#B9A77A" stroke-width="3.5" stroke-opacity="0.38"/>
  
  <!-- Top Luxury Diamond Spark Star -->
  <path d="M256 86 L264 114 L292 122 L264 130 L256 158 L248 130 L220 122 L248 114 Z" fill="url(#goldGrad)"/>

  <!-- Iconic Serif 'A' Monogram -->
  <text x="256" y="364" text-anchor="middle" font-family="'Cormorant Garamond', 'Georgia', serif" font-size="252" font-weight="500" fill="url(#goldGrad)">A</text>
  
  <!-- Bottom Minimal Gold Accent Bar -->
  <rect x="216" y="400" width="80" height="4" rx="2" fill="url(#goldGrad)" opacity="0.85"/>
</svg>`;

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E5D7BF"/>
      <stop offset="50%" stop-color="#B9A77A"/>
      <stop offset="100%" stop-color="#D8C8AF"/>
    </linearGradient>
  </defs>
  <g fill="#172744">
    <text x="200" y="52" text-anchor="middle" font-family="'Cormorant Garamond', 'Georgia', serif" font-size="36" font-weight="500" letter-spacing="14" fill="#172744">AURELIN</text>
    <text x="200" y="76" text-anchor="middle" font-family="'Cormorant Garamond', 'Georgia', serif" font-size="18" font-weight="400" letter-spacing="8" fill="#172744">&amp; CO.</text>
    <line x1="120" y1="88" x2="280" y2="88" stroke="#B9A77A" stroke-width="0.75"/>
    <text x="200" y="104" text-anchor="middle" font-family="'Inter', system-ui, sans-serif" font-size="8" font-weight="400" letter-spacing="5" fill="#172744" opacity="0.75">MAISON DE L'HOMME</text>
  </g>
</svg>`;

const ogBannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="ogBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#172744"/>
      <stop offset="50%" stop-color="#101C32"/>
      <stop offset="100%" stop-color="#0A1220"/>
    </linearGradient>
    <linearGradient id="ogGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F2E6D0"/>
      <stop offset="50%" stop-color="#B9A77A"/>
      <stop offset="100%" stop-color="#D8C8AF"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#ogBg)"/>

  <!-- Luxury Double Border Frame -->
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="#B9A77A" stroke-width="1.5" stroke-opacity="0.35"/>
  <rect x="52" y="52" width="1096" height="526" fill="none" stroke="#B9A77A" stroke-width="0.5" stroke-opacity="0.2"/>

  <!-- Corner Flourishes -->
  <path d="M40 70 L40 40 L70 40" fill="none" stroke="#B9A77A" stroke-width="2"/>
  <path d="M1160 70 L1160 40 L1130 40" fill="none" stroke="#B9A77A" stroke-width="2"/>
  <path d="M40 560 L40 590 L70 590" fill="none" stroke="#B9A77A" stroke-width="2"/>
  <path d="M1160 560 L1160 590 L1130 590" fill="none" stroke="#B9A77A" stroke-width="2"/>

  <!-- Top Star Emblem -->
  <path d="M600 130 L607 154 L631 161 L607 168 L600 192 L593 168 L569 161 L593 154 Z" fill="url(#ogGold)"/>

  <!-- Brand Typography -->
  <text x="600" y="270" text-anchor="middle" font-family="'Cormorant Garamond', 'Georgia', serif" font-size="76" font-weight="500" letter-spacing="18" fill="#F8F6F0">AURELIN</text>
  <text x="600" y="325" text-anchor="middle" font-family="'Cormorant Garamond', 'Georgia', serif" font-size="34" font-weight="400" letter-spacing="10" fill="#D8C8AF">&amp; CO.</text>

  <!-- Elegant Gold Divider -->
  <line x1="460" y1="360" x2="740" y2="360" stroke="#B9A77A" stroke-width="1"/>
  <circle cx="600" cy="360" r="3" fill="#B9A77A"/>

  <!-- Subtitle / Tagline -->
  <text x="600" y="405" text-anchor="middle" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="400" letter-spacing="7" fill="#B9A77A">MAISON DE L'HOMME</text>

  <!-- Micro-description -->
  <text x="600" y="460" text-anchor="middle" font-family="'Inter', system-ui, sans-serif" font-size="16" font-weight="300" letter-spacing="3" fill="#F8F6F0" opacity="0.85">PURE EUROPEAN LINEN • MEDITERRANEAN TAILORING • LIMITED ATELIER EDITIONS</text>

  <!-- Bottom Website Badge -->
  <rect x="520" y="505" width="160" height="30" rx="4" fill="#B9A77A" fill-opacity="0.12" stroke="#B9A77A" stroke-width="0.75" stroke-opacity="0.4"/>
  <text x="600" y="525" text-anchor="middle" font-family="'Inter', system-ui, sans-serif" font-size="11" font-weight="500" letter-spacing="2" fill="#B9A77A">aurelinco.com</text>
</svg>`;

async function run() {
  const publicDir = path.resolve("public");
  const appDir = path.resolve("app");

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const svgBuffer = Buffer.from(faviconSvg);

  // 1. Write SVG favicon & logo
  fs.writeFileSync(path.join(publicDir, "favicon.svg"), faviconSvg);
  fs.writeFileSync(path.join(publicDir, "logo.svg"), logoSvg);
  console.log("Created public/favicon.svg and public/logo.svg");

  // 2. Generate Favicon PNG sizes
  const sizes = [
    { size: 16, name: "favicon-16x16.png" },
    { size: 32, name: "favicon-32x32.png" },
    { size: 48, name: "favicon-48x48.png" },
    { size: 180, name: "apple-touch-icon.png" },
    { size: 192, name: "android-chrome-192x192.png" },
    { size: 512, name: "android-chrome-512x512.png" },
  ];

  for (const s of sizes) {
    await sharp(svgBuffer)
      .resize(s.size, s.size)
      .png()
      .toFile(path.join(publicDir, s.name));
    console.log(`Created public/${s.name} (${s.size}x${s.size})`);
  }

  // 3. Write .ico files
  const ico32Buffer = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), ico32Buffer);
  fs.writeFileSync(path.join(appDir, "favicon.ico"), ico32Buffer);
  console.log("Created public/favicon.ico and app/favicon.ico");

  // 4. Web App Manifest
  const manifestContent = {
    name: "AURELIN & CO. — Maison de l'Homme",
    short_name: "AURELIN",
    description: "Quiet luxury menswear and pure European linen garments.",
    start_url: "/",
    display: "standalone",
    background_color: "#101C32",
    theme_color: "#101C32",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
  fs.writeFileSync(path.join(publicDir, "site.webmanifest"), JSON.stringify(manifestContent, null, 2));
  console.log("Created public/site.webmanifest");

  // 5. OpenGraph & Twitter Sharing Banners (1200x630)
  const ogBuffer = Buffer.from(ogBannerSvg);
  await sharp(ogBuffer).png().toFile(path.join(publicDir, "og-image.png"));
  await sharp(ogBuffer).jpeg({ quality: 92 }).toFile(path.join(publicDir, "og-image.jpg"));
  console.log("Created public/og-image.png and public/og-image.jpg (1200x630)");
}

run().catch(console.error);
