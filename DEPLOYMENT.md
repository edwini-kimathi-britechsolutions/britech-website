# Deploying the Britech Solutions website

The website comes in two editions with the same design, pages, admin portal and database:

| Edition | Runs on | Guide |
|---|---|---|
| **PHP edition** (`php-site/`) | **Any cPanel / shared hosting** with PHP 8 and MySQL. No Node.js, npm or terminal needed. | [Shared hosting (PHP edition)](#shared-hosting-php-edition--no-nodejs-needed) |
| Node.js edition (Next.js) | A VPS, or cPanel plans with “Setup Node.js App” | Sections 1–7 below, and [Deploying on cPanel](#deploying-on-cpanel) |

Pick **one**. Both use the same database tables, so you can switch later without losing content.

---

The Node.js edition is a Next.js app with a MySQL database, an admin portal and file uploads.
It needs a **Node.js server** (not static hosting). Recommended: a small Ubuntu VPS (1 vCPU / 1–2 GB RAM is enough).

## 1. Server prerequisites (Ubuntu 22.04/24.04)

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx mysql-server
sudo npm install -g pm2
```

## 2. Database

```bash
sudo mysql
```
```sql
CREATE DATABASE britech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'britech'@'localhost' IDENTIFIED BY 'a-long-random-password';
GRANT ALL PRIVILEGES ON britech.* TO 'britech'@'localhost';
FLUSH PRIVILEGES;
```

## 3. App

```bash
sudo mkdir -p /var/www /var/britech/uploads && sudo chown -R $USER /var/www /var/britech
cd /var/www && git clone <your-repo-url> britech-website && cd britech-website

cp .env.example .env
nano .env                      # set DATABASE_URL, NEXT_PUBLIC_SITE_URL, APP_SECRET, UPLOAD_DIR
openssl rand -hex 32           # paste the result as APP_SECRET

npm ci                         # installs packages + generates the Prisma client
npm run db:migrate             # creates the tables
npm run db:seed                # partners, projects, contact details (only adds missing items)
npm run admin:create -- --email you@britechsolutions.co.tz --name "Your Name"   # prints a one-time password
npm run build

pm2 start ecosystem.config.cjs
pm2 save && pm2 startup        # follow the printed command so the site starts on reboot
```

Check: `curl http://127.0.0.1:3000/api/health` → `{"ok":true,"db":"up"}`

## 4. Nginx + HTTPS

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/britechsolutions.co.tz
sudo ln -s /etc/nginx/sites-available/britechsolutions.co.tz /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d britechsolutions.co.tz -d www.britechsolutions.co.tz
```

Point the domain’s **A records** (`@` and `www`) to the server’s IP first.
HTTPS is required: admin sign-in cookies are `Secure` in production.

## 5. After going live

1. Sign in at `https://britechsolutions.co.tz/admin/login` and **change the password** (My account).
2. **Site settings** → contact details, WhatsApp number, social links, announcement bar.
3. **Site settings → Email notifications (SMTP)** → enter your mail server, then **Send test**.
4. Add team accounts, testimonials, and publish the first blog posts.
5. Submit `https://britechsolutions.co.tz/sitemap.xml` in Google Search Console.

## 6. Backups

```bash
crontab -e
# 02:30 every night — database + uploads, keeps 14 days in /var/backups/britech
30 2 * * * /var/www/britech-website/scripts/backup.sh >> /var/log/britech-backup.log 2>&1
```
Copy `/var/backups/britech` off the server regularly (e.g. to cloud storage).

Restore: `gunzip < db_YYYY-MM-DD_HHMM.sql.gz | mysql -u britech -p britech` and
`tar -xzf uploads_….tar.gz -C /var/britech`.

## 7. Updating the site

```bash
cd /var/www/britech-website
git pull
npm ci
npm run db:migrate
npm run build
pm2 reload britech-website
```

## Notes

- **Uploads** live in `UPLOAD_DIR`, outside the code folder, so redeploys never delete them.
- **Rate limits** (sign-in, contact form) use the `X-Real-IP` header set by Nginx — keep that line in the Nginx config.
- **Monitoring:** point an uptime checker (e.g. UptimeRobot) at `/api/health`.

---

## Deploying on cPanel

Works on cPanel hosting that has **“Setup Node.js App”** (CloudLinux / Passenger) and **MySQL Databases**.
Ask your host to confirm: Node.js **20 or newer**, **SSH or Terminal** access, and at least **1 GB RAM** for the app.

### 1. Database (cPanel → MySQL® Databases)
1. Create a database, e.g. `cpuser_britech`.
2. Create a user with a strong password and add it to the database with **ALL PRIVILEGES**.
3. Your `DATABASE_URL` will be `mysql://cpuser_dbuser:PASSWORD@localhost:3306/cpuser_britech`
   (URL-encode special characters in the password, e.g. `@` → `%40`).

### 2. Upload the code
Upload the project to a folder **outside** `public_html`, e.g. `/home/cpuser/britech-website`
(Git Version Control in cPanel, or zip → File Manager → Extract). Don’t upload `node_modules`, `.next` or `.env`.

Create the uploads folder, also outside `public_html`: `/home/cpuser/britech-uploads`.

### 3. Create the Node.js app (cPanel → Setup Node.js App → Create Application)
| Field | Value |
|---|---|
| Node.js version | 20.x (or newer) |
| Application mode | Production |
| Application root | `britech-website` |
| Application URL | your domain |
| Application startup file | `server.js` |

Settings go in a **`.env` file** in the application root (File Manager → copy `.env.example` to `.env` → Edit).
Use a file rather than the “Environment variables” boxes in this screen: those only reach the running site, while the
Terminal commands below (migrations, admin account) and the backup cron job also need them.

| Name | Value |
|---|---|
| `DATABASE_URL` | from step 1 |
| `NEXT_PUBLIC_SITE_URL` | `https://britechsolutions.co.tz` |
| `APP_SECRET` | 64 random hex characters (`openssl rand -hex 32` in Terminal) |
| `UPLOAD_DIR` | `/home/cpuser/britech-uploads` |

Click **Create**, then **Stop App** while you finish setup.

### 4. Install, set up the database, build (cPanel → Terminal)
The Node.js app screen shows a command to enter the app’s environment — copy it, e.g.:
```bash
source /home/cpuser/nodevenv/britech-website/20/bin/activate && cd /home/cpuser/britech-website
npm ci
npm run db:migrate
npm run db:seed
npm run admin:create -- --email you@britechsolutions.co.tz --name "Your Name"
npm run build
```
Then **Start App** (or **Restart**) in Setup Node.js App, and open `https://yourdomain/api/health`.

**If `npm run build` is killed for using too much memory** (common on small plans): build on your own computer instead —
run `npm ci && npm run build` locally, then upload the `.next` folder as well and only run `npm ci`, `db:migrate`, `db:seed`
and `admin:create` on the server. The project already includes the Linux database engines needed for this.

### 5. HTTPS
cPanel → **SSL/TLS Status** → run **AutoSSL** for the domain (free). HTTPS is required for the admin sign-in.

### 6. Email notifications
Use a cPanel mailbox: create e.g. `noreply@britechsolutions.co.tz` in **Email Accounts**, then in the website admin
(**Site settings → Email notifications**) enter host `mail.britechsolutions.co.tz`, port **465**, **SSL/TLS**,
the full mailbox address as username, its password, and send a test.

### 7. Backups (cPanel → Cron Jobs)
```
30 2 * * * BACKUP_DIR=/home/cpuser/backups /home/cpuser/britech-website/scripts/backup.sh >> /home/cpuser/backup.log 2>&1
```
cPanel’s own **Backup** tool also covers the database and home folder.

### 8. Updating
Upload/pull the new code, then in the Terminal (inside the app environment):
`npm ci && npm run db:migrate && npm run build`, and **Restart** the app.

### cPanel notes
- After editing environment variables, always **Restart** the app.
- Logs: the app’s `stderr.log` / `passenger.log` in the application root (or the host’s Node.js app log viewer).
- Keep `UPLOAD_DIR` outside the app folder so uploads survive updates.

---

## Shared hosting (PHP edition) — no Node.js needed

`php-site/` is the same website rebuilt in plain PHP 8 + MySQL. It runs on ordinary cPanel / shared hosting
(Apache or LiteSpeed) with nothing to install on the server: you upload the files and open an installer page.

### What the host needs
- **PHP 8.0 or newer** (8.2+ recommended) with the extensions `pdo_mysql`, `openssl`, `mbstring`, `dom` — standard on cPanel.
- **MySQL 5.7+ or MariaDB 10.3+** (cPanel → MySQL® Databases).
- The site must be at the **root of a domain or subdomain** (e.g. `britechsolutions.co.tz`, not `example.com/britech`).

### 1. Build the upload package (on your computer)
```bash
npm run php:package        # creates dist/britech-website-php.zip
```

### 2. Create the database (cPanel → MySQL® Databases)
1. Create a database, e.g. `cpuser_britech`.
2. Create a user with a strong password and **add it to the database with ALL PRIVILEGES**.

### 3. Upload and extract (cPanel → File Manager)
1. Open `public_html` (or the subdomain’s folder) and upload `britech-website-php.zip`.
2. Right-click → **Extract**, then delete the zip.
3. Check that `.htaccess` is there (File Manager → Settings → **Show Hidden Files**).

### 4. Pick the PHP version (cPanel → Select PHP Version / MultiPHP Manager)
Choose **PHP 8.2** (or 8.1+) for the domain.

### 5. Run the installer
Open **`https://yourdomain/install.php`**. It checks the server, then asks for:
- the website address,
- the database name, user and password from step 2,
- your admin name, email and password.

It creates the tables, loads the clients/partners, projects/products and contact details, creates your admin
account and saves the settings to `app/config.php`. After that it locks itself (you may delete `install.php`).

### 6. HTTPS
1. cPanel → **SSL/TLS Status** → **Run AutoSSL**.
2. In `.htaccess`, remove the `#` from the three “Force HTTPS” lines.

HTTPS is required for safe admin sign-in.

### 7. Email notifications
Create a mailbox such as `noreply@britechsolutions.co.tz` in cPanel → **Email Accounts**. Then in the admin, open
**Site settings → Email notifications** and enter:
- host `mail.britechsolutions.co.tz`
- port **465**, security **SSL/TLS**
- the full mailbox address as the username, and its password

Then click **Send test**.

### Updating the website later
1. Run `npm run php:package` again.
2. Upload the zip and extract it over the existing files.

The zip never contains `app/config.php` or uploaded images, so your settings and uploads are kept. Text such as
services and industries lives in `src/lib/data.ts`; edit it there, then rebuild the package.

### Backups
- cPanel → **Backup** (download the home directory and the MySQL database), or
- phpMyAdmin → Export, plus a copy of `storage/uploads/`.

### Moving from the Node.js edition
- Run the installer with the **existing database**. It keeps all tables and content; the starter content never overwrites anything.
- Copy the old uploads folder (`UPLOAD_DIR`) into `storage/uploads/`.
- Existing team passwords keep working.
- To keep the saved SMTP password, put the old `APP_SECRET` value into `'app_secret'` in `app/config.php`. Otherwise just re-enter the SMTP password in the admin.

### Notes & troubleshooting
| Problem | Fix |
|---|---|
| Home page works but other pages show “Not Found” | `.htaccess` wasn’t uploaded (it’s a hidden file) or mod_rewrite is off — re-extract the zip with hidden files shown. |
| White page / “500” error | Check the PHP version and extensions (step 4), then the `error_log` file in the site folder. For details, set `'debug' => true` in `app/config.php` temporarily. |
| Image upload fails | Folder `storage/uploads` must be writable (permissions 755). Images are limited to 5 MB. |
| Emails don’t arrive | Use port 465 + SSL/TLS with the full mailbox address and password; check the error shown on the inquiry. |
| Site is behind Cloudflare | Set `'ip_header' => 'HTTP_CF_CONNECTING_IP'` in `app/config.php` so spam limits see real visitor IPs. |

Security is the same as the Node.js edition:
- bcrypt passwords and hashed session tokens; sign-in rate limits;
- a CSRF token on every admin form;
- role checks on every admin page;
- an allow-list HTML cleaner for blog posts;
- uploads checked by file contents and served with `nosniff`;
- a Content-Security-Policy and other security headers.

`app/` and `storage/` are blocked from the web.
