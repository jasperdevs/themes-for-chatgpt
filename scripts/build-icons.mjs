import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const svg = readFileSync(join(root, 'icons', 'icon.svg'));

const sizes = [16, 32, 48, 128];

for (const size of sizes) {
  const out = join(root, 'icons', `icon-${size}.png`);
  await sharp(svg, { density: Math.max(72, size * 4) })
    .resize(size, size)
    .png()
    .toFile(out);
  console.log(`wrote ${out}`);
}
