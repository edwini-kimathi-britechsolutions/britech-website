# Britech Solutions website

Next.js 15 site with a MySQL-backed admin portal (`/admin`) for the blog, projects, client/partner logos, team accounts and site settings.

> **Deploying?** See [DEPLOYMENT.md](DEPLOYMENT.md).
> - **Shared / cPanel hosting without Node.js:** use the PHP edition in `php-site/` — `npm run php:package`, upload the zip, open `/install.php`.
> - **VPS or cPanel with Node.js:** the Next.js app below (Nginx, HTTPS, PM2, backups).

## Requirements

- Node.js 20+
- MySQL 8
- A persistent folder for uploaded images (`UPLOAD_DIR`)

## Environment

Create `.env` (never commit it):

```bash
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/britech"
UPLOAD_DIR="./storage/uploads"   # must survive redeploys in production
NEXT_PUBLIC_SITE_URL="https://britechsolutions.co.tz"
APP_SECRET="<64 random hex chars>" # encrypts the SMTP password in the DB — generate with: openssl rand -hex 32
# Development only (used by `prisma migrate dev`):
SHADOW_DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/britech_shadow"
```

Keep `APP_SECRET` the same across deploys; if it changes, re-enter the SMTP password in the admin.

## First-time setup

```bash
npm install                 # also runs `prisma generate`
npx prisma migrate deploy   # create tables
npm run db:seed             # partners, projects, contact settings (safe to re-run)
npm run admin:create -- --email you@britechsolutions.co.tz --name "Your Name"
```

`admin:create` prints a one-time password. Sign in at `/admin/login` and change it under **My account**.
Run it again for the same email to reset a forgotten admin password.

## Development

```bash
npm run dev   # http://localhost:3000  (admin: /admin)
```

Locally, MySQL can be started with `brew services run mysql@8.4`.
After changing `prisma/schema.prisma` (new migration), restart `npm run dev` so it loads the regenerated Prisma client.

## Production

```bash
npm run build
npm start
```

- Serve over **HTTPS** — session cookies are `Secure` in production.
- Run on a Node host (VPS, cPanel Node app, Railway, etc.); the site needs a server and database, it is not a static export.
- Back up the MySQL database **and** `UPLOAD_DIR`.

## Contact form & email notifications

- Every contact-form submission is saved and appears in **Admin → Inquiries** (new / read / archived, search, paging).
- To be emailed about new inquiries, an admin fills in **Site settings → Email notifications (SMTP)** and clicks **Send test**.
  Typical values: Gmail/Google Workspace `smtp.gmail.com`, port 587, STARTTLS, with an app password; cPanel mail `mail.yourdomain`, port 465, SSL/TLS.
- If email fails, the inquiry is still saved and the error is shown on it.
- Spam protection: hidden honeypot field, minimum fill time, max 5 submissions per IP per hour.

## Admin roles

| Role   | Can do |
| ------ | ------ |
| Author | Write own posts and submit them for review |
| Editor | Publish/unpublish any post; manage projects/products, client/partner logos; read inquiries |
| Admin  | Everything, plus team accounts, site settings (contact, social links, SMTP) and deleting inquiries |

## Security notes

- Passwords hashed with bcrypt (cost 12); sessions are random tokens stored as SHA-256 hashes, `httpOnly` + `SameSite=Lax`, 7-day sliding expiry.
- Sign-in is rate-limited (5 failures per account / 20 per IP per 15 minutes).
- Every admin page and server action checks the user’s role on the server.
- Blog HTML is sanitized with an allow-list on save and again on render.
- Uploads: PNG/JPG/GIF/WebP only (checked by file contents), max 5 MB, random filenames, served with `nosniff`.
- Production security headers: Content-Security-Policy, HSTS, X-Frame-Options, nosniff, Referrer- and Permissions-Policy.
- Health check: `GET /api/health` returns 200 when the database is reachable, 503 otherwise.
