/**
 * Create (or reset) an admin-portal account and print a one-time password.
 *   npm run admin:create -- --email you@britechsolutions.co.tz --name "Your Name" [--role ADMIN|EDITOR|AUTHOR]
 */
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient, type Role } from "@prisma/client";

const db = new PrismaClient();

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const email = arg("email")?.toLowerCase().trim();
  const name = arg("name")?.trim() || "Administrator";
  const role = (arg("role")?.toUpperCase() ?? "ADMIN") as Role;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Pass a valid --email");
  if (!["ADMIN", "EDITOR", "AUTHOR"].includes(role)) throw new Error("--role must be ADMIN, EDITOR or AUTHOR");

  const password = `${randomBytes(12).toString("base64url")}7a`;
  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.upsert({
    where: { email },
    update: { passwordHash, role, active: true, name },
    create: { email, name, role, passwordHash },
  });
  // Sign out any existing sessions for this account.
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  await db.session.deleteMany({ where: { userId: user.id } });

  console.log(`\n  ${role} account ready`);
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log("\n  Sign in at /admin/login and change this password under My account.\n");
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
