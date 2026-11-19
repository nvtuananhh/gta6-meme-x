// gta6-meme-x-01 entry: hands the house the address of the X post that
// carries this entry's meme.
//
// What this program does, and nothing else:
//   1. Reads POST.json from the repository root and checks it is a JSON
//      object whose "url" names an X post
//      (https://x.com/<handle>/status/<digits> or the twitter.com form),
//      or the placeholder the repository ships with before the post
//      exists. The URL host must be x.com or twitter.com, so a lookalike
//      domain can never pass as the post address.
//   2. Checks meme.png is really a PNG (or JPEG) by its magic bytes and
//      is no bigger than 8 MB, so a broken or missing picture can never
//      slip through silently. For a PNG it also reads the IHDR width and
//      height and requires the short side to be at least 480 px, because
//      the judge views the meme at 480x480 and a smaller picture would
//      arrive blurry.
//   3. Copies POST.json into the output directory, where the gate reads it.
//
// Node 22, standard library only. No network, no clock, no randomness:
// the same repository always produces the same bytes.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and
// MAKEFUN_OUTPUT_DIR stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const POST_FILE = 'POST.json';
const MEME_FILE = 'meme.png';
const MAX_MEME_BYTES = 8 * 1024 * 1024;

// A real post address, or the placeholder this repository ships with
// until the post is made and its address is filled in. Only the two
// genuine X hosts count; anything else is rejected even if the path
// looks like a status link.
const POST_PATH = /^\/[A-Za-z0-9_]+\/status\/\d+$/;
const POST_HOSTS = new Set(['x.com', 'twitter.com']);
const MIN_SHORT_SIDE_PX = 480;
const PLACEHOLDER_URL = 'https://x.com/nvtuananhh/status/PLACEHOLDER';

// PNG signature (8 bytes) and JPEG start-of-image marker (3 bytes).
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_MAGIC = [0xff, 0xd8, 0xff];

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

function startsWith(bytes: Buffer, magic: number[]): boolean {
  return magic.every((byte, i) => bytes[i] === byte);
}

function checkPost(): void {
  const path = join(BOT_DIR, POST_FILE);
  let raw: string;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (err) {
    fail(`cannot read ${path}: ${(err as Error).message}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw!);
  } catch (err) {
    fail(`${POST_FILE} is not valid JSON: ${(err as Error).message}`);
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    fail(`${POST_FILE} must be a JSON object, got ${Array.isArray(parsed) ? 'an array' : typeof parsed}`);
  }
  const keys = Object.keys(parsed);
  if (keys.length !== 1 || keys[0] !== 'url') {
    fail(`${POST_FILE} must hold exactly one key, "url"`);
  }
  const url = (parsed as { url: unknown }).url;
  if (typeof url !== 'string') {
    fail(`${POST_FILE} "url" must be a string`);
  }
  if (url !== PLACEHOLDER_URL) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      fail(`${POST_FILE} "url" is not a valid URL: ${url}`);
    }
    if (!POST_HOSTS.has(parsedUrl!.hostname)) {
      fail(`${POST_FILE} "url" host must be x.com or twitter.com, got ${parsedUrl!.hostname}`);
    }
    if (!POST_PATH.test(parsedUrl!.pathname)) {
      fail(`${POST_FILE} "url" is not an X post address: ${url}`);
    }
  }
}

function checkMeme(): void {
  const path = join(BOT_DIR, MEME_FILE);
  let size: number;
  try {
    size = statSync(path).size;
  } catch (err) {
    fail(`cannot stat ${path}: ${(err as Error).message}`);
  }
  if (size! > MAX_MEME_BYTES) {
    fail(`${MEME_FILE} is ${size} bytes, over the 8 MB limit`);
  }
  if (size === 0) {
    fail(`${MEME_FILE} is empty`);
  }
  let head: Buffer;
  try {
    head = readFileSync(path).subarray(0, 29);
  } catch (err) {
    fail(`cannot read ${path}: ${(err as Error).message}`);
  }
  const isPng = startsWith(head!, PNG_MAGIC);
  const isJpeg = startsWith(head!, JPEG_MAGIC);
  if (!isPng && !isJpeg) {
    fail(`${MEME_FILE} is neither PNG nor JPEG (magic bytes do not match)`);
  }
  if (isPng) {
    // PNG layout: 8-byte signature, 4-byte chunk length, 4-byte chunk
    // type ("IHDR"), then width and height as big-endian uint32s.
    if (head!.length < 24 || head!.subarray(12, 16).toString('ascii') !== 'IHDR') {
      fail(`${MEME_FILE} is a truncated PNG (no IHDR header)`);
    }
    const width = head!.readUInt32BE(16);
    const height = head!.readUInt32BE(20);
    if (width === 0 || height === 0) {
      fail(`${MEME_FILE} has a zero PNG dimension (${width}x${height})`);
    }
    if (Math.min(width, height) < MIN_SHORT_SIDE_PX) {
      fail(`${MEME_FILE} is ${width}x${height}, short side under ${MIN_SHORT_SIDE_PX} px`);
    }
  }
}

checkPost();
checkMeme();

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(join(BOT_DIR, POST_FILE), join(OUTPUT_DIR, POST_FILE));
} catch (err) {
  fail(`could not copy ${POST_FILE} to ${OUTPUT_DIR}: ${(err as Error).message}`);
}
