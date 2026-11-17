<?php
// Local development only: php -S localhost:8080 router.php
// (Apache/LiteSpeed on the server use .htaccess instead.)
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (preg_match('#^/(app|storage)(/|$)#', $path) || preg_match('#/\.#', $path)) {
    http_response_code(403);
    exit('Forbidden');
}
if ($path !== '/' && is_file(__DIR__ . $path) && !str_ends_with($path, '.php')) {
    return false;
}
if ($path === '/install.php') {
    require __DIR__ . '/install.php';
    return true;
}
require __DIR__ . '/index.php';
