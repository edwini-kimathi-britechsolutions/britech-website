<?php
/**
 * Britech Solutions website — one-time web installer.
 * Open https://yourdomain/install.php after uploading the files. It checks the server, creates the
 * database tables, loads the starter content, creates the first admin account and writes app/config.php.
 * Once installed it refuses to run again (delete app/config.php to reinstall).
 */
declare(strict_types=1);

if (PHP_VERSION_ID < 80000) {
    http_response_code(500);
    exit('This website needs PHP 8.0 or newer. Change it in cPanel → Select PHP Version (or MultiPHP Manager), then reload this page.');
}

require __DIR__ . '/app/bootstrap.php';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
header('X-Frame-Options: DENY');

$installed = is_installed();

/* ------------------------------- server checks ------------------------------ */

$uploadDirDefault = ROOT . '/storage/uploads';
$checks = [
    ['PHP 8.0 or newer', PHP_VERSION_ID >= 80000, 'You have PHP ' . PHP_VERSION . '.'],
    ['PDO MySQL extension', extension_loaded('pdo_mysql'), 'Enable “pdo_mysql” in Select PHP Version → Extensions.'],
    ['OpenSSL extension', extension_loaded('openssl'), 'Enable “openssl”.'],
    ['mbstring extension', extension_loaded('mbstring'), 'Enable “mbstring”.'],
    ['DOM extension', extension_loaded('dom'), 'Enable “dom” (used to clean blog HTML).'],
    ['“app” folder is writable', is_writable(APP), 'Set permissions of the app folder to 755 so the installer can save config.php.'],
    ['Uploads folder is writable', is_dir($uploadDirDefault) ? is_writable($uploadDirDefault) : is_writable(ROOT . '/storage'), 'Set permissions of storage/uploads to 755.'],
];
$checksOk = !in_array(false, array_column($checks, 1), true);

/* ---------------------------------- install --------------------------------- */

$error = null;
$done = null;
$scheme = is_https() ? 'https' : 'http';
$f = [
    'site_url' => $scheme . '://' . preg_replace('/[^a-zA-Z0-9.:-]/', '', $_SERVER['HTTP_HOST'] ?? 'localhost'),
    'db_host' => 'localhost', 'db_port' => '3306', 'db_name' => '', 'db_user' => '', 'db_pass' => '',
    'admin_name' => '', 'admin_email' => '', 'admin_pass' => '', 'upload_dir' => '',
];

if (!$installed && $_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach ($f as $k => $_) {
        $f[$k] = is_string($_POST[$k] ?? null) ? trim($_POST[$k]) : '';
    }
    $f['admin_pass'] = is_string($_POST['admin_pass'] ?? null) ? $_POST['admin_pass'] : '';
    $f['db_pass'] = is_string($_POST['db_pass'] ?? null) ? $_POST['db_pass'] : '';
    $f['site_url'] = rtrim($f['site_url'], '/');
    $email = mb_strtolower($f['admin_email']);
    $uploadDir = $f['upload_dir'] !== '' ? rtrim($f['upload_dir'], '/') : $uploadDirDefault;

    if (!$checksOk) {
        $error = 'Fix the server checks above first.';
    } elseif (!preg_match('#^https?://[^/\s]+$#', $f['site_url'])) {
        $error = 'Website address must look like https://britechsolutions.co.tz (no path at the end).';
    } elseif ($f['db_name'] === '' || $f['db_user'] === '') {
        $error = 'Enter the database name and user from cPanel → MySQL Databases.';
    } elseif (mb_strlen($f['admin_name']) < 2) {
        $error = 'Enter your name for the admin account.';
    } elseif (!is_email($email)) {
        $error = 'Enter a valid admin email.';
    } elseif ($p = password_problem($f['admin_pass'])) {
        $error = $p;
    } elseif (!is_dir($uploadDir) && !@mkdir($uploadDir, 0755, true)) {
        $error = 'The uploads folder can’t be created: ' . $uploadDir;
    } elseif (!is_writable($uploadDir)) {
        $error = 'The uploads folder is not writable: ' . $uploadDir;
    } else {
        try {
            $pdo = db_connect($f['db_host'], (int) $f['db_port'] ?: 3306, $f['db_name'], $f['db_user'], $f['db_pass']);
        } catch (Throwable $e) {
            $pdo = null;
            $error = 'Couldn’t connect to the database: ' . $e->getMessage() . ' — check the name, user and password, and that the user was added to the database with ALL PRIVILEGES.';
        }
        if ($pdo) {
            try {
                $hasTables = (bool) $pdo->query("SHOW TABLES LIKE 'User'")->fetchColumn();
                if (!$hasTables) {
                    run_sql_file($pdo, APP . '/sql/schema.sql');
                }
                run_sql_file($pdo, APP . '/sql/seed.sql'); // INSERT IGNORE: never overwrites existing content

                $now = gmdate('Y-m-d H:i:s') . '.000';
                $existing = $pdo->prepare('SELECT id FROM `User` WHERE email = ?');
                $existing->execute([$email]);
                $hash = password_hash($f['admin_pass'], PASSWORD_BCRYPT, ['cost' => 12]);
                if ($id = $existing->fetchColumn()) {
                    $pdo->prepare("UPDATE `User` SET name = ?, passwordHash = ?, role = 'ADMIN', active = 1, updatedAt = ? WHERE id = ?")
                        ->execute([$f['admin_name'], $hash, $now, $id]);
                } else {
                    $pdo->prepare("INSERT INTO `User` (id, name, email, passwordHash, role, active, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'ADMIN', 1, ?, ?)")
                        ->execute(['c' . bin2hex(random_bytes(12)), $f['admin_name'], $email, $hash, $now, $now]);
                }

                $config = [
                    'site_url' => $f['site_url'],
                    'db' => ['host' => $f['db_host'], 'port' => (int) $f['db_port'] ?: 3306, 'name' => $f['db_name'], 'user' => $f['db_user'], 'pass' => $f['db_pass']],
                    // Encrypts the SMTP password stored in the database. Keep it if you move servers.
                    'app_secret' => bin2hex(random_bytes(32)),
                    'upload_dir' => $uploadDir,
                    // Behind Cloudflare, set to 'HTTP_CF_CONNECTING_IP' so rate limits see the real visitor IP.
                    'ip_header' => '',
                    'debug' => false,
                ];
                $php = "<?php\n// Britech website settings — created by install.php on " . gmdate('Y-m-d H:i') . " UTC. Keep this file private.\ndefined('BRITECH') || exit;\n\nreturn " . var_export($config, true) . ";\n";
                if (file_put_contents(config_path(), $php, LOCK_EX) === false) {
                    throw new RuntimeException('Couldn’t write app/config.php — check the app folder permissions.');
                }
                @chmod(config_path(), 0640);
                $done = $f['site_url'];
            } catch (Throwable $e) {
                $error = 'Installation failed: ' . $e->getMessage();
            }
        }
    }
}

/** Runs a .sql file statement by statement (files contain no semicolons inside values). */
function run_sql_file(PDO $pdo, string $file): void
{
    $sql = (string) file_get_contents($file);
    $sql = preg_replace('/^--.*$/m', '', $sql) ?? '';
    foreach (preg_split('/;\s*(\r?\n|$)/', $sql) ?: [] as $stmt) {
        if (trim($stmt) !== '') {
            $pdo->exec($stmt);
        }
    }
}

$input = 'w-full rounded-lg border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-mint-500 focus:ring-4 focus:ring-mint-500/15';
$fieldHtml = function (string $name, string $label, string $type = 'text', string $hint = '', bool $required = true) use ($f, $input): string {
    $value = $type === 'password' ? '' : $f[$name];
    return '<label class="block"><span class="mb-1.5 block text-sm font-medium text-navy-800">' . e($label) . '</span>'
        . '<input name="' . $name . '" type="' . $type . '" value="' . e($value) . '"' . ($required ? ' required' : '') . ' class="' . $input . '" autocomplete="off">'
        . ($hint ? '<span class="mt-1 block text-xs text-navy-400">' . $hint . '</span>' : '') . '</label>';
};
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Install · Britech Solutions website</title>
<link rel="icon" href="/images/mark.png">
<link rel="stylesheet" href="/assets/app.css">
</head>
<body class="font-sans">
<div class="min-h-screen bg-navy-50/60 px-4 py-12">
  <div class="mx-auto max-w-2xl">
    <img src="/images/logo.png" alt="Britech Solutions" width="150" height="58" class="h-12 w-auto">

    <?php if ($done): ?>
    <div class="mt-8 rounded-2xl border border-navy-100 bg-white p-8 shadow-xl shadow-navy-900/5">
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-mint-700">Installed</p>
      <h1 class="mt-2 text-2xl font-bold text-navy-900">Your website is ready.</h1>
      <ol class="mt-5 list-decimal space-y-2 pl-5 text-navy-600">
        <li><a class="font-semibold text-mint-700 underline" href="/">Open the website</a></li>
        <li><a class="font-semibold text-mint-700 underline" href="/admin/login">Sign in to the admin</a> with the email and password you just chose.</li>
        <li>In the admin, open <strong>Site settings</strong> to set up email notifications (SMTP), WhatsApp and social links.</li>
        <li>For extra safety, delete <code>install.php</code> from the server (it can’t run again anyway).</li>
      </ol>
    </div>
    <?php elseif ($installed): ?>
    <div class="mt-8 rounded-2xl border border-navy-100 bg-white p-8">
      <h1 class="text-2xl font-bold text-navy-900">Already installed</h1>
      <p class="mt-3 text-navy-600">This website is already set up. <a class="font-semibold text-mint-700 underline" href="/">Go to the website</a> or <a class="font-semibold text-mint-700 underline" href="/admin/login">sign in</a>.</p>
      <p class="mt-3 text-sm text-navy-400">To reinstall, delete <code>app/config.php</code> first. You can delete install.php.</p>
    </div>
    <?php else: ?>
    <div class="mt-8 rounded-2xl border border-navy-100 bg-white p-8 shadow-xl shadow-navy-900/5">
      <h1 class="text-2xl font-bold text-navy-900">Install the website</h1>
      <p class="mt-1 text-navy-500">Takes about a minute. You need the MySQL database details from cPanel → MySQL® Databases.</p>

      <ul class="mt-6 space-y-2 rounded-xl bg-navy-50/70 p-4 text-sm">
        <?php foreach ($checks as [$label, $ok, $help]): ?>
        <li class="flex items-start gap-2 <?= $ok ? 'text-navy-700' : 'text-red-700' ?>">
          <?= icon($ok ? 'CheckCircle2' : 'AlertCircle', 'mt-0.5 h-4 w-4 shrink-0 ' . ($ok ? 'text-mint-700' : 'text-red-600')) ?>
          <span><?= e($label) ?><?= $ok ? '' : ' — ' . e($help) ?></span>
        </li>
        <?php endforeach; ?>
      </ul>

      <?php if ($error): ?>
      <p role="alert" class="mt-6 flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700"><?= icon('AlertCircle', 'mt-0.5 h-4 w-4 shrink-0') ?> <?= e($error) ?></p>
      <?php endif; ?>

      <form method="post" class="mt-6 space-y-8">
        <fieldset class="space-y-4">
          <legend class="mb-2 font-semibold text-navy-900">Website</legend>
          <?= $fieldHtml('site_url', 'Website address', 'url', 'Use https:// once SSL is active (cPanel → SSL/TLS Status → Run AutoSSL).') ?>
        </fieldset>

        <fieldset class="space-y-4">
          <legend class="mb-2 font-semibold text-navy-900">Database</legend>
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="sm:col-span-2"><?= $fieldHtml('db_host', 'Host', 'text', 'Almost always <code>localhost</code> on cPanel.') ?></div>
            <?= $fieldHtml('db_port', 'Port') ?>
          </div>
          <?= $fieldHtml('db_name', 'Database name', 'text', 'Includes your cPanel username prefix, e.g. <code>cpuser_britech</code>.') ?>
          <div class="grid gap-4 sm:grid-cols-2">
            <?= $fieldHtml('db_user', 'Database user', 'text', 'e.g. <code>cpuser_britech</code>') ?>
            <?= $fieldHtml('db_pass', 'Database password', 'password', '', false) ?>
          </div>
        </fieldset>

        <fieldset class="space-y-4">
          <legend class="mb-2 font-semibold text-navy-900">Your admin account</legend>
          <div class="grid gap-4 sm:grid-cols-2">
            <?= $fieldHtml('admin_name', 'Your name') ?>
            <?= $fieldHtml('admin_email', 'Email', 'email') ?>
          </div>
          <?= $fieldHtml('admin_pass', 'Password', 'password', 'At least 10 characters, with letters and numbers.') ?>
        </fieldset>

        <details class="rounded-lg border border-navy-100 p-4 text-sm">
          <summary class="cursor-pointer font-medium text-navy-800">Advanced: uploads folder</summary>
          <div class="mt-4"><?= $fieldHtml('upload_dir', 'Folder for uploaded images', 'text', 'Leave empty to use <code>' . e($uploadDirDefault) . '</code> (protected from direct access). Or use a folder outside public_html, e.g. <code>/home/cpuser/britech-uploads</code>.', false) ?></div>
        </details>

        <button type="submit" <?= $checksOk ? '' : 'disabled' ?> class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy-900 px-5 py-3 font-semibold text-white transition hover:bg-navy-800 disabled:opacity-50">Install</button>
      </form>
    </div>
    <?php endif; ?>
  </div>
</div>
</body>
</html>
