// Deal Beacon's hand-in program (Node 22, standard library only).
//
// It takes this repository's site and screenshots and lays them out for the
// grader: app/ and screenshots/ copied into the output directory, plus a
// dossier.json the judge reads, built by the vendored make.fun library so
// the gate can rebuild it byte for byte and compare.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The program runs twice in grading and both runs must write the same bytes,
// so it writes nothing time-dependent and never touches the network.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the directory holding this file; every path below
// is resolved from it, never from the working directory, so the program
// behaves the same launched from anywhere.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The dossier caps are the competition's own: at most 4 screenshots of
// 256 KiB, app/ within 993 files and 16 MiB, and the judge text at 160 KiB.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};

function fail(message) {
  throw new Error('main.ts: ' + message);
}

function countFiles(dir) {
  let total = 0;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    total += statSync(path).isDirectory() ? countFiles(path) : 1;
  }
  return total;
}

const appDir = join(repoRoot, 'app');
const shotsDir = join(repoRoot, 'screenshots');
if (!existsSync(join(appDir, 'index.html'))) fail('app/index.html is missing');
if (!existsSync(shotsDir)) fail('screenshots/ is missing');

mkdirSync(outputDir, { recursive: true });
cpSync(appDir, join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outputDir, DOSSIER_CAPS);
writeFileSync(join(outputDir, 'dossier.json'), dossier);

const shotCount = readdirSync(shotsDir).filter((name) => !name.startsWith('.')).length;
console.log(
  'Deal Beacon handed in: ' + countFiles(appDir) + ' app files, ' +
  shotCount + ' screenshots, dossier ' + dossier.length + ' bytes.',
);
