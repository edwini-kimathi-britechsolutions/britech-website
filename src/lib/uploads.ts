import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { db } from "./db";

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? "./storage/uploads");
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Detect type from file contents (magic bytes), never from the client-supplied name/type.
// SVG is intentionally not allowed (it can carry scripts).
const SIGNATURES: { mime: string; ext: string; test: (b: Buffer) => boolean }[] = [
  { mime: "image/png", ext: "png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/gif", ext: "gif", test: (b) => b.subarray(0, 4).toString("ascii") === "GIF8" },
  { mime: "image/webp", ext: "webp", test: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP" },
];

export const MIME_BY_EXT: Record<string, string> = Object.fromEntries(SIGNATURES.map((s) => [s.ext, s.mime]));
export const SAFE_FILENAME = /^[a-z0-9]{24}\.(png|jpg|gif|webp)$/;

export async function saveImage(file: File, userId: string) {
  if (file.size === 0) throw new Error("The file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Images must be 5 MB or smaller.");

  const buf = Buffer.from(await file.arrayBuffer());
  const sig = SIGNATURES.find((s) => s.test(buf));
  if (!sig) throw new Error("Only PNG, JPG, GIF or WebP images are allowed.");

  const filename = `${randomBytes(12).toString("hex")}.${sig.ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), buf, { flag: "wx" });
  await db.media.create({
    data: { filename, original: file.name.slice(0, 250), mime: sig.mime, size: file.size, uploadedBy: userId },
  });
  return `/media/${filename}`;
}
