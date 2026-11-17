import { readFile } from "node:fs/promises";
import path from "node:path";
import { MIME_BY_EXT, SAFE_FILENAME, UPLOAD_DIR } from "@/lib/uploads";

/** Serves uploaded images. Filenames are server-generated, so anything else is rejected. */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!SAFE_FILENAME.test(file)) return new Response("Not found", { status: 404 });

  try {
    const data = await readFile(path.join(UPLOAD_DIR, file));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": MIME_BY_EXT[file.split(".").pop()!],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
