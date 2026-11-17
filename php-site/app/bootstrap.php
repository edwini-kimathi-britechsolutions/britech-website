<?php
/**
 * Britech Solutions website — PHP edition.
 * Loads configuration and shared helpers. Everything in /app is blocked from direct web access.
 */
declare(strict_types=1);

define('BRITECH', true);
define('ROOT', dirname(__DIR__));
define('APP', __DIR__);
define('APP_VERSION', '1.0.0');

date_default_timezone_set('Africa/Dar_es_Salaam');
mb_internal_encoding('UTF-8');

/* ------------------------------ configuration ------------------------------ */

function config_path(): string
{
    return APP . '/config.php';
}

function is_installed(): bool
{
    return is_file(config_path());
}

/** Reads a config value, e.g. cfg('db.name'). */
function cfg(string $key, $default = null)
{
    static $config = null;
    if ($config === null) {
        $config = is_installed() ? (require config_path()) : [];
    }
    $value = $config;
    foreach (explode('.', $key) as $part) {
        if (!is_array($value) || !array_key_exists($part, $value)) {
            return $default;
        }
        $value = $value[$part];
    }
    return $value;
}

function site_url(): string
{
    return rtrim((string) cfg('site_url', 'https://britechsolutions.co.tz'), '/');
}

function upload_dir(): string
{
    $dir = (string) cfg('upload_dir', '');
    return $dir !== '' ? rtrim($dir, '/') : ROOT . '/storage/uploads';
}

if (cfg('debug')) {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
}

require APP . '/lib/db.php';
require APP . '/lib/helpers.php';
require APP . '/lib/auth.php';
require APP . '/lib/content.php';
require APP . '/lib/sanitize.php';
require APP . '/lib/mail.php';
require APP . '/lib/uploads.php';
require APP . '/views/components.php';
