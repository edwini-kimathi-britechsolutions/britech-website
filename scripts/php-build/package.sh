#!/usr/bin/env bash
# Builds the PHP edition and zips it for upload: dist/britech-website-php.zip
# Upload the zip to public_html in cPanel File Manager, extract it, then open https://yourdomain/install.php
set -euo pipefail
cd "$(dirname "$0")/../.."
node scripts/php-build/build.mjs
mkdir -p dist
rm -f dist/britech-website-php.zip
(cd php-site && zip -qr ../dist/britech-website-php.zip . \
  -x "router.php" -x "app/config.php" -x "storage/uploads/*" -x ".DS_Store" -x "*/.DS_Store")
# keep the (empty) uploads folder and its protection
(cd php-site && zip -q ../dist/britech-website-php.zip storage/uploads/.gitkeep storage/.htaccess)
echo "Created dist/britech-website-php.zip ($(du -h dist/britech-website-php.zip | cut -f1))"
