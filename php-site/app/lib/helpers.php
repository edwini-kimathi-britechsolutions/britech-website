<?php
defined('BRITECH') || exit;

/* --------------------------------- output --------------------------------- */

function e($value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Lucide icon as inline SVG (same shapes as the Node.js version). */
function icon(string $name, string $class = 'h-4 w-4'): string
{
    static $icons = null;
    if ($icons === null) {
        $icons = require APP . '/icons.php';
    }
    $inner = $icons[$name] ?? $icons['Sparkles'];
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"'
        . ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="' . e($class) . '" aria-hidden="true">' . $inner . '</svg>';
}

/** Static content from the original site (services, industries, stats …). */
function data(string $key)
{
    static $data = null;
    if ($data === null) {
        $data = require APP . '/data.php';
    }
    return $data[$key];
}

/** Services in one of Britech's three practices (engineering, digital, business). */
function services_in(string $practice): array
{
    return array_values(array_filter(data('services'), fn ($s) => $s['practice'] === $practice));
}

/** Link for a practice: its only service page, or its section on /solutions. */
function practice_href(array $practice): string
{
    $list = services_in($practice['slug']);
    return count($list) === 1 ? '/solutions/' . $list[0]['slug'] : '/solutions#' . $practice['slug'];
}

/** Versioned asset URL so browsers pick up new CSS/JS after an update. */
function asset(string $path): string
{
    $file = ROOT . '/assets/' . $path;
    $v = is_file($file) ? (string) filemtime($file) : APP_VERSION;
    return '/assets/' . $path . '?v=' . $v;
}

/** Renders a template from app/views and returns the HTML. */
function render(string $view, array $vars = []): string
{
    extract($vars, EXTR_SKIP);
    ob_start();
    require APP . '/views/' . $view . '.php';
    return (string) ob_get_clean();
}

/* --------------------------------- request -------------------------------- */

function request_method(): string
{
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

function is_post(): bool
{
    return request_method() === 'POST';
}

function request_path(): string
{
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $path = rawurldecode($path);
    return $path === '/' ? '/' : rtrim($path, '/');
}

/** Trimmed string from the query string. */
function qs(string $key, int $max = 100): string
{
    $v = $_GET[$key] ?? '';
    return is_string($v) ? mb_substr(trim($v), 0, $max) : '';
}

/** Raw string from the POST body (not trimmed). */
function input(string $key, int $max = 100000): string
{
    $v = $_POST[$key] ?? '';
    return is_string($v) ? mb_substr($v, 0, $max) : '';
}

function input_trim(string $key, int $max = 100000): string
{
    return trim(input($key, $max));
}

function checked(string $key): bool
{
    return ($_POST[$key] ?? '') === 'on';
}

function is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (int) ($_SERVER['SERVER_PORT'] ?? 0) === 443
        || strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
}

/**
 * Visitor IP for rate limiting. On shared hosting REMOTE_ADDR is the real visitor.
 * Behind Cloudflare, set 'ip_header' => 'HTTP_CF_CONNECTING_IP' in app/config.php.
 */
function client_ip(): string
{
    $header = (string) cfg('ip_header', '');
    $ip = $header !== '' ? ($_SERVER[$header] ?? '') : '';
    if ($ip === '') {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    return substr(trim(explode(',', $ip)[0]), 0, 64);
}

/* --------------------------------- response ------------------------------- */

function redirect(string $url, int $code = 303): void
{
    header('Location: ' . $url, true, $code);
    exit;
}

function json_response(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

function not_found(): void
{
    http_response_code(404);
    echo render('site/not-found');
    exit;
}

/** Security headers for every PHP response (static files get theirs from .htaccess). */
function send_security_headers(): void
{
    header_remove('X-Powered-By');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()');
    header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
        . "img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self'; "
        . "frame-src https://www.google.com https://maps.google.com; frame-ancestors 'none'; base-uri 'self'; "
        . "form-action 'self'; object-src 'none'");
    if (is_https()) {
        header('Strict-Transport-Security: max-age=63072000; includeSubDomains');
    }
}

/* ---------------------------------- CSRF ---------------------------------- */

function app_secret(): string
{
    $s = (string) cfg('app_secret', '');
    if (strlen($s) < 32) {
        throw new RuntimeException('app_secret is not configured in app/config.php.');
    }
    return $s;
}

/** Admin forms: token tied to the signed-in session. */
function csrf_token(): string
{
    return hash_hmac('sha256', 'csrf|' . ($_COOKIE[SESSION_COOKIE] ?? ''), app_secret());
}

function csrf_field(): string
{
    return '<input type="hidden" name="_csrf" value="' . e(csrf_token()) . '">';
}

function verify_csrf(): void
{
    $sent = (string) ($_POST['_csrf'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? ''));
    if (!same_origin() || !hash_equals(csrf_token(), $sent)) {
        http_response_code(403);
        exit('This form has expired. Go back, reload the page and try again.');
    }
}

/** Rejects cross-site POSTs (defence in depth alongside the tokens). */
function same_origin(): bool
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '' || $origin === 'null') {
        return $origin === '';
    }
    return strtolower((string) parse_url($origin, PHP_URL_HOST)) === strtolower(explode(':', $_SERVER['HTTP_HOST'] ?? '')[0]);
}

/** Public forms: signed timestamp — proves the form came from us and how long it took to fill in. */
function form_token(): string
{
    $t = (string) time();
    return $t . '.' . hash_hmac('sha256', 'form|' . $t, app_secret());
}

/** Returns seconds since the form was rendered, or null if the token is invalid. */
function form_token_age(string $token): ?int
{
    $parts = explode('.', $token, 2);
    if (count($parts) !== 2 || !ctype_digit($parts[0])) {
        return null;
    }
    if (!hash_equals(hash_hmac('sha256', 'form|' . $parts[0], app_secret()), $parts[1])) {
        return null;
    }
    return time() - (int) $parts[0];
}

/* -------------------------------- formatting ------------------------------ */

function slugify(string $input): string
{
    $s = mb_strtolower($input);
    if (function_exists('transliterator_transliterate')) {
        $s = (string) transliterator_transliterate('Any-Latin; Latin-ASCII', $s);
    } elseif (function_exists('iconv')) {
        $s = (string) @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $s);
    }
    $s = preg_replace('/[^a-z0-9]+/', '-', strtolower($s)) ?? '';
    return substr(trim($s, '-'), 0, 120);
}

function reading_time(string $html): int
{
    $words = preg_split('/\s+/', trim(strip_tags(str_replace('<', ' <', $html))), -1, PREG_SPLIT_NO_EMPTY) ?: [];
    return max(1, (int) round(count($words) / 220));
}

/** Database UTC timestamp → local DateTime. */
function dt(?string $utc): ?DateTimeImmutable
{
    if ($utc === null || $utc === '') {
        return null;
    }
    return (new DateTimeImmutable($utc, new DateTimeZone('UTC')))->setTimezone(new DateTimeZone(date_default_timezone_get()));
}

/** e.g. "12 Nov 2026" */
function format_date(?string $utc): string
{
    $d = dt($utc);
    return $d ? $d->format('j M Y') : '';
}

/** e.g. "12 Nov 2026, 14:05" */
function format_datetime(?string $utc): string
{
    $d = dt($utc);
    return $d ? $d->format('j M Y, H:i') : '';
}

function iso_date(?string $utc): string
{
    $d = dt($utc);
    return $d ? $d->format(DATE_ATOM) : '';
}

/** Only allow site-relative paths or http(s) URLs to be stored as links/images. */
function safe_url(?string $v): ?string
{
    $s = trim((string) $v);
    if ($s === '') {
        return null;
    }
    if ($s[0] === '/' && !str_starts_with($s, '//')) {
        return $s;
    }
    $scheme = strtolower((string) parse_url($s, PHP_URL_SCHEME));
    $host = parse_url($s, PHP_URL_HOST);
    return in_array($scheme, ['http', 'https'], true) && $host ? $s : null;
}

function is_email(string $v): bool
{
    return (bool) preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $v) && filter_var($v, FILTER_VALIDATE_EMAIL) !== false;
}

function tel_href(string $phone): string
{
    return 'tel:' . preg_replace('/\s/', '', $phone);
}

/* ------------------------------ lists & paging ---------------------------- */

function build_href(string $path, array $params): string
{
    $q = [];
    foreach ($params as $k => $v) {
        if ($v === null || $v === '' || ($k === 'page' && (int) $v <= 1)) {
            continue;
        }
        $q[$k] = (string) $v;
    }
    return $q ? $path . '?' . http_build_query($q, '', '&', PHP_QUERY_RFC3986) : $path;
}

function parse_page(): int
{
    $p = (int) ($_GET['page'] ?? 1);
    return max(1, min(10000, $p));
}

function page_count(int $total, int $size): int
{
    return max(1, (int) ceil($total / $size));
}

/** LIKE pattern with wildcards escaped. */
function like(string $q): string
{
    return '%' . addcslashes($q, '%_\\') . '%';
}

/* --------------------------- contact form links --------------------------- */

const SERVICE_FOR_SOLUTION = [
    'mobile-software-development' => 'Mobile & Software Development',
    'ai-powered-digital-transformation' => 'AI-Powered Digital Transformation',
    'training-support-capacity-building' => 'Training & Support',
    'enterprise-software-erp-development' => 'Enterprise Software & ERP',
    'business-intelligence-services' => 'Business Intelligence',
    'cybersecurity-it-audit' => 'Cybersecurity & IT Audit',
    'digital-strategy-it-consulting' => 'Digital Strategy & IT Consulting',
];

/** Link to the contact form with the “How can we help?” option (and optionally a message) pre-filled. */
function contact_href(?string $service = null, ?string $message = null): string
{
    $q = [];
    if ($service) {
        $q['service'] = $service;
    }
    if ($message) {
        $q['message'] = $message;
    }
    return ($q ? '/contact?' . http_build_query($q, '', '&', PHP_QUERY_RFC3986) : '/contact') . '#form';
}

function contact_for_solution(string $slug): string
{
    return contact_href(SERVICE_FOR_SOLUTION[$slug] ?? null);
}

function contact_for_product(array $p): string
{
    return $p['slug'] === 'njiwa'
        ? contact_href('Bulk SMS (Njiwa)', 'I’d like to learn more about Njiwa bulk SMS.')
        : contact_href('Product demo', 'I’d like a demo of ' . $p['name'] . '.');
}

function find_by_slug(array $items, string $slug): ?array
{
    foreach ($items as $item) {
        if ($item['slug'] === $slug) {
            return $item;
        }
    }
    return null;
}

function lines(?string $text): array
{
    return array_values(array_filter(array_map('trim', explode("\n", (string) $text)), fn ($l) => $l !== ''));
}
