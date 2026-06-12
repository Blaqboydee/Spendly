// Renders the SVG sources into the PNGs that @capacitor/assets expects in assets/.
// Run from project root: node assets-src/render.mjs
import sharp from "sharp";
import { readFile, mkdir } from "fs/promises";

const SVG_SIZE = 200; // viewBox size of the source SVGs

async function renderSvg(path, size) {
  const svg = await readFile(path);
  const density = (72 * size) / SVG_SIZE;
  return sharp(svg, { density }).resize(size, size).png().toBuffer();
}

async function canvas(size, background) {
  return sharp({
    create: { width: size, height: size, channels: 4, background },
  });
}

await mkdir("assets", { recursive: true });

// App icon (1024x1024): full-bleed gradient + dollar sign
await sharp(await renderSvg("assets-src/icon.svg", 1024)).toFile("assets/icon-only.png");

// Adaptive icon layers (1024x1024)
await sharp(await renderSvg("assets-src/icon-foreground.svg", 1024)).toFile("assets/icon-foreground.png");
await sharp(await renderSvg("assets-src/icon-background.svg", 1024)).toFile("assets/icon-background.png");

// Splash screens (2732x2732): circular logo centered on solid background
const splashLogo = await renderSvg("assets-src/logo.svg", 800);
for (const [file, background] of [
  ["assets/splash.png", "#ffffff"],
  ["assets/splash-dark.png", "#111827"],
]) {
  await (await canvas(2732, background))
    .composite([{ input: splashLogo, gravity: "center" }])
    .png()
    .toFile(file);
}

console.log("Rendered icon-only, icon-foreground, icon-background, splash, splash-dark into assets/");
