import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Uptime check for monitoring / load balancers. Reports whether the database is reachable. */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ ok: true, db: "up" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ ok: false, db: "down" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
