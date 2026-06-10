/**
 * Renders public/trifluenz-logo.svg to high-resolution PNGs for team distribution.
 * Run: node scripts/export-logo-png.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgPath = join(root, 'public', 'trifluenz-logo.svg');
const outDir = join(root, 'public', 'brand');

mkdirSync(outDir, { recursive: true });

const svg = readFileSync(svgPath, 'utf8');

const sizes = [
  { name: 'trifluenz-logo-512.png', size: 512 },
  { name: 'trifluenz-logo-1024.png', size: 1024 },
  { name: 'trifluenz-logo-2048.png', size: 2048 },
];

for (const { name, size } of sizes) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: 'transparent',
  });
  const png = resvg.render().asPng();
  const outPath = join(outDir, name);
  writeFileSync(outPath, png);
  console.log(`Wrote ${outPath}`);
}

// Also refresh root PNG used by older references
writeFileSync(join(root, 'public', 'trifluenz-logo.png'), readFileSync(join(outDir, 'trifluenz-logo-1024.png')));
console.log('Updated public/trifluenz-logo.png');
