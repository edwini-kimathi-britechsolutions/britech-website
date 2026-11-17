<?php
defined('BRITECH') || exit;

/*
 * Admin sign-in. Same model as the Node.js version (and the same database tables):
 * - passwords hashed with bcrypt (cost 12) — existing hashes keep working;
 * - sessions are random tokens; only their SHA-256 hash is stored in the `Session` table;
 * - httpOnly + SameSite=Lax cookie, Secure on HTTPS, 7-day sliding expiry;
 * - failed sign-ins are rate limited per account and per IP.
 */

const SESSION_COOKIE = 'britech_session';
const SESSION_TTL = 60 * 60 * 24 * 7;          // 7 days
const SESSION_REFRESH_WHEN_LEFT = 60 * 60 * 84; // extend when under half the lifetime remains
const LOGIN_WINDOW = 15 * 60;
const LOGIN_MAX_PER_ACCOUNT = 5;
const LOGIN_MAX_PER_IP = 20;

function hash_password(string $pw): string
{
    return password_hash($pw, PASSWORD_BCRYPT, ['cost' => 12]);
}

function verify_password(string $pw, string $hash): bool
{
    return password_verify($pw, $hash);
}

/** Keeps sign-in timing the same whether or not the email exists. */
function burn_password_check(string $pw): bool
{
    password_verify($pw, '$2y$12$59HYg853KAm.3ArkpsNo4ujb/nFHLJpUdX4ex2Jnx4gurWaKHdEbe');
    return false;
}

function password_problem(string $pw): ?string
{
    if (mb_strlen($pw) < 10) {
        return 'Password must be at least 10 characters.';
    }
    if (!preg_match('/[A-Za-z]/', $pw) || !preg_match('/\d/', $pw)) {
        return 'Password must contain letters and numbers.';
    }
    return null;
}

function temp_password(): string
{
    return rtrim(strtr(base64_encode(random_bytes(9)), '+/', '-_'), '=') . '4k';
}

/* ---------------------------------- sessions --------------------------------- */

function set_session_cookie(string $token, int $expires): void
{
    setcookie(SESSION_COOKIE, $token, [
        'expires' => $expires,
        'path' => '/',
        'secure' => is_https(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    $_COOKIE[SESSION_COOKIE] = $token;
}

function create_session(string $userId): void
{
    $token = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    db_insert('Session', ['id' => hash('sha256', $token), 'userId' => $userId, 'expiresAt' => now_utc(SESSION_TTL)]);
    set_session_cookie($token, time() + SESSION_TTL);
}

function destroy_session(): void
{
    $token = $_COOKIE[SESSION_COOKIE] ?? '';
    if ($token !== '') {
        q('DELETE FROM `Session` WHERE id = ?', [hash('sha256', $token)]);
    }
    setcookie(SESSION_COOKIE, '', ['expires' => time() - 3600, 'path' => '/', 'secure' => is_https(), 'httponly' => true, 'samesite' => 'Lax']);
    unset($_COOKIE[SESSION_COOKIE]);
}

/** The signed-in user, or null. Validated against the database once per request. */
function current_user(): ?array
{
    static $loaded = false;
    static $user = null;
    if ($loaded) {
        return $user;
    }
    $loaded = true;

    $token = $_COOKIE[SESSION_COOKIE] ?? '';
    if (!is_string($token) || $token === '' || strlen($token) > 100) {
        return null;
    }
    $id = hash('sha256', $token);
    $s = row(
        'SELECT s.id AS sid, s.expiresAt, u.id, u.name, u.email, u.role, u.active
           FROM `Session` s JOIN `User` u ON u.id = s.userId WHERE s.id = ?',
        [$id]
    );
    if (!$s) {
        return null;
    }
    $expires = dt($s['expiresAt'])->getTimestamp();
    if ($expires <= time() || !(int) $s['active']) {
        q('DELETE FROM `Session` WHERE id = ?', [$id]);
        return null;
    }
    // Sliding expiry.
    if ($expires - time() < SESSION_REFRESH_WHEN_LEFT) {
        q('UPDATE `Session` SET expiresAt = ? WHERE id = ?', [now_utc(SESSION_TTL), $id]);
        if (request_method() === 'GET') {
            set_session_cookie($token, time() + SESSION_TTL);
        }
    }
    $user = ['id' => $s['id'], 'name' => $s['name'], 'email' => $s['email'], 'role' => $s['role']];
    return $user;
}

/** Use on every admin page and action. Redirects to sign-in (or the dashboard) if not allowed. */
function require_user(array $roles = []): array
{
    $user = current_user();
    if (!$user) {
        redirect('/admin/login');
    }
    if ($roles && !in_array($user['role'], $roles, true)) {
        redirect('/admin?denied=1');
    }
    return $user;
}

function can_manage_content(array $user): bool
{
    return $user['role'] === 'ADMIN' || $user['role'] === 'EDITOR';
}

/* --------------------------------- rate limits -------------------------------- */

function attempts_since(string $key, int $seconds): int
{
    return (int) val('SELECT COUNT(*) FROM `LoginAttempt` WHERE `key` = ? AND createdAt > ?', [$key, now_utc(-$seconds)]);
}

function record_attempt(string $key): void
{
    q('INSERT INTO `LoginAttempt` (`key`, createdAt) VALUES (?, ?)', [mb_substr($key, 0, 255), now_utc()]);
}

function is_login_rate_limited(string $email, string $ip): bool
{
    return attempts_since("acct:{$email}", LOGIN_WINDOW) >= LOGIN_MAX_PER_ACCOUNT
        || attempts_since("ip:{$ip}", LOGIN_WINDOW) >= LOGIN_MAX_PER_IP;
}

function record_failed_login(string $email, string $ip): void
{
    record_attempt("acct:{$email}");
    record_attempt("ip:{$ip}");
    // Housekeeping: drop old sign-in attempts (contact-form entries are kept for an hour).
    q("DELETE FROM `LoginAttempt` WHERE createdAt < ? AND `key` NOT LIKE 'inq:%'", [now_utc(-LOGIN_WINDOW * 4)]);
}

function clear_failed_logins(string $email): void
{
    q('DELETE FROM `LoginAttempt` WHERE `key` = ?', ["acct:{$email}"]);
}
