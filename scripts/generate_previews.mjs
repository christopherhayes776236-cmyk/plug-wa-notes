/**
 * generate_previews.mjs
 *
 * Extracts real preview images from existing PDF notes and MP4 videos.
 * Outputs to public/previews/{unit}-{type}.jpg
 *
 * Run: node scripts/generate_previews.mjs
 *
 * Requirements:
 *   - ffmpeg must be on PATH
 *   - pdf2pic installed: npm install --save-dev pdf2pic
 */

import { fromPath } from 'pdf2pic';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, renameSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public');
const UNITS_DIR = join(PUBLIC, 'units');
const OUT_DIR = join(PUBLIC, 'previews');

// Ensure output directory exists
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// ─── Unit definitions ─────────────────────────────────────────────────────────
const UNITS = [
  { code: 'comp102' },
  { code: 'soen201' },
  { code: 'soen202' },
  { code: 'soen203' },
  { code: 'soen220' },
  { code: 'soen240' },
];

// Special note overrides (units with split note sets)
const EXTRA_NOTES = [
  { unit: 'soen220', pdf: 'notes-w12.pdf', out: 'soen220-notes-w12.jpg' },
  { unit: 'soen220', pdf: 'notes-w3.pdf',  out: 'soen220-notes-w3.jpg'  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg) {
  console.log(`  ${msg}`);
}

function warn(msg) {
  console.warn(`  [SKIP] ${msg}`);
}

/**
 * Extract first page of a PDF as a JPG.
 * pdf2pic writes to a temp path; we move it to the target.
 */
async function pdfToJpg(pdfPath, outPath) {
  if (!existsSync(pdfPath)) {
    warn(`PDF not found: ${pdfPath}`);
    return false;
  }

  const options = {
    density: 150,        // DPI — good quality without huge file size
    saveFilename: 'page',
    savePath: OUT_DIR,
    format: 'jpg',
    width: 800,
    height: 600,
  };

  try {
    const convert = fromPath(pdfPath, options);
    const result = await convert(1, { responseType: 'image' });

    // pdf2pic names the file {saveFilename}.{page}.jpg
    const generated = join(OUT_DIR, 'page.1.jpg');
    if (existsSync(generated)) {
      renameSync(generated, outPath);
      log(`PDF -> ${outPath.replace(ROOT, '')}`);
      return true;
    }
    warn(`pdf2pic did not produce output for ${pdfPath}`);
    return false;
  } catch (err) {
    warn(`pdf2pic error for ${pdfPath}: ${err.message}`);
    return false;
  }
}

/**
 * Extract a frame from an MP4 at a given timestamp using ffmpeg.
 */
function videoFrame(videoPath, outPath, timestamp = '00:00:03') {
  if (!existsSync(videoPath)) {
    warn(`Video not found: ${videoPath}`);
    return false;
  }
  try {
    execSync(
      `ffmpeg -y -ss ${timestamp} -i "${videoPath}" -frames:v 1 -q:v 2 "${outPath}" 2>NUL`,
      { stdio: 'pipe' }
    );
    log(`Video frame -> ${outPath.replace(ROOT, '')}`);
    return true;
  } catch {
    // Try at 1 second if 3 seconds fails (very short video)
    try {
      execSync(
        `ffmpeg -y -ss 00:00:01 -i "${videoPath}" -frames:v 1 -q:v 2 "${outPath}" 2>NUL`,
        { stdio: 'pipe' }
      );
      log(`Video frame (1s) -> ${outPath.replace(ROOT, '')}`);
      return true;
    } catch (err2) {
      warn(`ffmpeg error for ${videoPath}: ${err2.message}`);
      return false;
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\nGenerating product preview images...\n');

  for (const { code } of UNITS) {
    const unitDir = join(UNITS_DIR, code);
    console.log(`── ${code.toUpperCase()} ─────────────────────`);

    // Notes (weeks 1-3)
    await pdfToJpg(
      join(unitDir, 'notes.pdf'),
      join(OUT_DIR, `${code}-notes.jpg`)
    );

    // Notes (weeks 4-5)
    await pdfToJpg(
      join(unitDir, 'notes-w45.pdf'),
      join(OUT_DIR, `${code}-w45-notes.jpg`)
    );

    // Video (weeks 1-3)
    videoFrame(
      join(unitDir, 'video.mp4'),
      join(OUT_DIR, `${code}-video.jpg`)
    );

    // Video (weeks 4-5)
    videoFrame(
      join(unitDir, 'video-w45.mp4'),
      join(OUT_DIR, `${code}-w45-video.jpg`)
    );

    // Slides frame — slightly later in the video to catch slide content
    videoFrame(
      join(unitDir, 'video.mp4'),
      join(OUT_DIR, `${code}-slides.jpg`),
      '00:00:10'
    );

    // w45 Slides frame
    videoFrame(
      join(unitDir, 'video-w45.mp4'),
      join(OUT_DIR, `${code}-w45-slides.jpg`),
      '00:00:10'
    );
  }

  // Extra notes (soen220 split)
  console.log('\n── EXTRA NOTES ─────────────────────');
  for (const { unit, pdf, out } of EXTRA_NOTES) {
    await pdfToJpg(
      join(UNITS_DIR, unit, pdf),
      join(OUT_DIR, out)
    );
  }

  // soen220 assignment notes
  await pdfToJpg(
    join(UNITS_DIR, 'soen220', 'assignment-notes.pdf'),
    join(OUT_DIR, 'soen220-asg-notes.jpg')
  );
  videoFrame(
    join(UNITS_DIR, 'soen220', 'assignment-video.mp4'),
    join(OUT_DIR, 'soen220-asg-video.jpg')
  );

  console.log('\nDone. Check public/previews/ for output files.\n');
}

run().catch(console.error);
