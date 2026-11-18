<?php
defined('BRITECH') || exit;

use PHPMailer\PHPMailer\PHPMailer;

require_once APP . '/vendor/PHPMailer/Exception.php';
require_once APP . '/vendor/PHPMailer/PHPMailer.php';
require_once APP . '/vendor/PHPMailer/SMTP.php';

const SMTP_KEYS = ['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_pass', 'smtp_from', 'notify_to'];

/* ------------------------- encrypted secrets (AES-256-GCM) ------------------------ */
// Same format as the Node.js version ("v1:iv:tag:data", key = SHA-256 of the app secret),
// so an SMTP password saved by either version can be read by the other.

function secret_key(): string
{
    return hash('sha256', app_secret(), true);
}

function encrypt_secret(string $plain): string
{
    $iv = random_bytes(12);
    $tag = '';
    $data = openssl_encrypt($plain, 'aes-256-gcm', secret_key(), OPENSSL_RAW_DATA, $iv, $tag, '', 16);
    if ($data === false) {
        throw new RuntimeException('Encryption failed.');
    }
    return implode(':', ['v1', base64_encode($iv), base64_encode($tag), base64_encode($data)]);
}

function decrypt_secret(string $stored): string
{
    $parts = explode(':', $stored);
    if (count($parts) !== 4 || $parts[0] !== 'v1') {
        throw new RuntimeException('Unrecognised secret format.');
    }
    $plain = openssl_decrypt(base64_decode($parts[3]), 'aes-256-gcm', secret_key(), OPENSSL_RAW_DATA, base64_decode($parts[1]), base64_decode($parts[2]));
    if ($plain === false) {
        throw new RuntimeException('The saved SMTP password can’t be decrypted (was app_secret changed?). Enter it again.');
    }
    return $plain;
}

/* ---------------------------------- settings --------------------------------- */

function raw_smtp(): array
{
    $out = [];
    $in = implode(',', array_fill(0, count(SMTP_KEYS), '?'));
    foreach (rows("SELECT `key`, `value` FROM `Setting` WHERE `key` IN ({$in})", SMTP_KEYS) as $r) {
        $out[$r['key']] = $r['value'];
    }
    return $out;
}

function email_list(string $v): array
{
    return array_values(array_filter(array_map('trim', explode(',', $v)), fn ($s) => $s !== ''));
}

/** SMTP settings without the password (safe to show in the admin). */
function smtp_config(): array
{
    $r = raw_smtp();
    return [
        'host' => $r['smtp_host'] ?? '',
        'port' => (int) ($r['smtp_port'] ?? 0) ?: 587,
        'secure' => ($r['smtp_secure'] ?? '') === 'true',
        'user' => $r['smtp_user'] ?? '',
        'hasPassword' => ($r['smtp_pass'] ?? '') !== '',
        'from' => $r['smtp_from'] ?? '',
        'notifyTo' => email_list($r['notify_to'] ?? ''),
    ];
}

/** Splits "Name <email@x>" into [email, name]. */
function parse_address(string $from): array
{
    if (preg_match('/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/', $from, $m)) {
        return [trim($m[2]), trim($m[1])];
    }
    return [trim($from), ''];
}

function mailer(): PHPMailer
{
    $r = raw_smtp();
    if (($r['smtp_host'] ?? '') === '' || ($r['smtp_from'] ?? '') === '') {
        throw new RuntimeException('Email is not configured. Add SMTP settings under Site settings.');
    }
    $m = new PHPMailer(true);
    $m->isSMTP();
    $m->CharSet = PHPMailer::CHARSET_UTF8;
    $m->Host = $r['smtp_host'];
    $m->Port = (int) ($r['smtp_port'] ?? 0) ?: 587;
    $secure = ($r['smtp_secure'] ?? '') === 'true';
    // SSL/TLS (465) connects encrypted; otherwise upgrade with STARTTLS when the server offers it (587).
    $m->SMTPSecure = $secure ? PHPMailer::ENCRYPTION_SMTPS : '';
    $m->SMTPAutoTLS = !$secure;
    $m->Timeout = 20;
    if (($r['smtp_user'] ?? '') !== '') {
        $m->SMTPAuth = true;
        $m->Username = $r['smtp_user'];
        $m->Password = ($r['smtp_pass'] ?? '') !== '' ? decrypt_secret($r['smtp_pass']) : '';
    }
    [$fromEmail, $fromName] = parse_address($r['smtp_from']);
    $m->setFrom($fromEmail, $fromName);
    return $m;
}

/** Strip CR/LF so user input can never inject extra email headers. */
function one_line(string $s): string
{
    return trim((string) preg_replace('/[\r\n]+/', ' ', $s));
}

function send_inquiry_notification(array $inq, string $adminUrl): void
{
    $notifyTo = email_list(raw_smtp()['notify_to'] ?? '');
    if (!$notifyTo) {
        throw new RuntimeException('No notification recipient set.');
    }
    $m = mailer();
    foreach ($notifyTo as $to) {
        $m->addAddress($to);
    }
    $name = one_line($inq['firstName'] . ' ' . $inq['lastName']);
    $m->addReplyTo($inq['email'], $name);

    $rowsData = [
        ['Name', $name],
        ['Email', $inq['email']],
        ['Phone', $inq['phone'] ?: 'Not provided'],
        ['Organization', $inq['company'] ?: 'Not provided'],
        ['Interested in', $inq['service']],
    ];
    $m->Subject = mb_substr(one_line('New website inquiry: ' . $inq['service'] . ' (' . ($inq['company'] ?: $name) . ')'), 0, 200);

    $tableRows = '';
    $text = '';
    foreach ($rowsData as [$k, $v]) {
        $tableRows .= '<tr><td style="padding:6px 12px 6px 0;color:#52566f;white-space:nowrap">' . e($k) . '</td><td style="padding:6px 0"><strong>' . e($v) . '</strong></td></tr>';
        $text .= "{$k}: {$v}\n";
    }
    $m->isHTML(true);
    $m->Body = '<div style="font-family:Arial,sans-serif;color:#191d40;max-width:600px">'
        . '<h2 style="margin:0 0 16px">New inquiry from the website</h2>'
        . '<table style="border-collapse:collapse;width:100%">' . $tableRows . '</table>'
        . '<div style="margin:20px 0;padding:16px;background:#f2f3fa;border-radius:8px;white-space:pre-wrap">' . e($inq['message']) . '</div>'
        . '<p><a href="' . e($adminUrl) . '" style="color:#01639a">Open in the admin portal</a> · Reply to this email to answer ' . e($name) . ' directly.</p>'
        . '</div>';
    $m->AltBody = $text . "\n" . $inq['message'] . "\n\nView in admin: " . $adminUrl;
    $m->send();
}

function send_test_email(string $to): void
{
    $m = mailer();
    $m->addAddress($to);
    $m->Subject = 'Britech website: test email';
    $m->Body = 'Your SMTP settings work. Contact-form notifications will be delivered to this mailbox.';
    $m->send();
}

/** Readable message from a PHPMailer/other exception. */
function mail_error(Throwable $e): string
{
    $msg = trim(preg_replace('/\s+/', ' ', $e->getMessage()) ?? '');
    return $msg !== '' ? $msg : 'Unknown email error.';
}
