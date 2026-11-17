<?php
/**
 * Britech Solutions website — single entry point.
 * Apache sends every request that isn't a real file here (see .htaccess).
 */
declare(strict_types=1);

if (PHP_VERSION_ID < 80000) {
    http_response_code(500);
    exit('This website needs PHP 8.0 or newer. Change the PHP version in cPanel → Select PHP Version (or MultiPHP Manager).');
}

require __DIR__ . '/app/bootstrap.php';

if (!is_installed()) {
    header('Location: /install.php', true, 302);
    exit;
}

send_security_headers();

$path = request_path();

// Canonical URLs: no trailing slash, no /index.php.
$uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
if (request_method() === 'GET' && ($uriPath !== '/' && str_ends_with($uriPath, '/') || $uriPath === '/index.php')) {
    $query = $_SERVER['QUERY_STRING'] ?? '';
    redirect(($path === '/index.php' ? '/' : $path) . ($query !== '' ? '?' . $query : ''), 301);
}

try {
    if ($path === '/admin' || str_starts_with($path, '/admin/')) {
        require APP . '/admin.php';
        if (!route_admin($path)) {
            not_found();
        }
        exit;
    }

    require APP . '/site.php';
    if (!route_site($path)) {
        not_found();
    }
} catch (Throwable $e) {
    error_log('Britech website error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    if (!headers_sent()) {
        http_response_code(500);
    }
    if (cfg('debug')) {
        echo '<pre>' . e((string) $e) . '</pre>';
    } else {
        echo render('site/error');
    }
}
