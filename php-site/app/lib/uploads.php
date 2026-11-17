<?php
defined('BRITECH') || exit;

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const SAFE_FILENAME = '/^[a-z0-9]{24}\.(png|jpg|gif|webp)$/';
const MIME_BY_EXT = ['png' => 'image/png', 'jpg' => 'image/jpeg', 'gif' => 'image/gif', 'webp' => 'image/webp'];

/** Detects the image type from the file contents (never from the name). SVG is not allowed. */
function sniff_image(string $head): ?string
{
    if (strncmp($head, "\x89PNG\r\n\x1a\n", 8) === 0) {
        return 'png';
    }
    if (strncmp($head, "\xFF\xD8\xFF", 3) === 0) {
        return 'jpg';
    }
    if (strncmp($head, 'GIF8', 4) === 0) {
        return 'gif';
    }
    if (strncmp($head, 'RIFF', 4) === 0 && substr($head, 8, 4) === 'WEBP') {
        return 'webp';
    }
    return null;
}

/** Saves an uploaded image and returns its public URL (/media/…). Throws with a readable message. */
function save_uploaded_image(array $file, string $userId): string
{
    $err = $file['error'] ?? UPLOAD_ERR_NO_FILE;
    if ($err === UPLOAD_ERR_INI_SIZE || $err === UPLOAD_ERR_FORM_SIZE) {
        throw new RuntimeException('Images must be 5 MB or smaller.');
    }
    if ($err !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'] ?? '')) {
        throw new RuntimeException('No file received.');
    }
    $size = (int) filesize($file['tmp_name']);
    if ($size === 0) {
        throw new RuntimeException('The file is empty.');
    }
    if ($size > MAX_UPLOAD_BYTES) {
        throw new RuntimeException('Images must be 5 MB or smaller.');
    }
    $ext = sniff_image((string) file_get_contents($file['tmp_name'], false, null, 0, 16));
    if (!$ext) {
        throw new RuntimeException('Only PNG, JPG, GIF or WebP images are allowed.');
    }

    $dir = upload_dir();
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
        throw new RuntimeException('The uploads folder can’t be created. Check its permissions.');
    }
    $filename = bin2hex(random_bytes(12)) . '.' . $ext;
    if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $filename)) {
        throw new RuntimeException('The image couldn’t be saved. Check the uploads folder permissions.');
    }
    @chmod($dir . '/' . $filename, 0644);

    db_insert('Media', [
        'id' => new_id(),
        'filename' => $filename,
        'original' => mb_substr((string) ($file['name'] ?? ''), 0, 250),
        'mime' => MIME_BY_EXT[$ext],
        'size' => $size,
        'uploadedBy' => $userId,
        'createdAt' => now_utc(),
    ]);
    return '/media/' . $filename;
}

/** Serves an uploaded image. Filenames are server-generated, so anything else is a 404. */
function serve_media(string $file): void
{
    $path = upload_dir() . '/' . $file;
    if (!preg_match(SAFE_FILENAME, $file) || !is_file($path)) {
        not_found();
    }
    $ext = pathinfo($file, PATHINFO_EXTENSION);
    header('Content-Type: ' . MIME_BY_EXT[$ext]);
    header('Content-Length: ' . filesize($path));
    header('Cache-Control: public, max-age=31536000, immutable');
    header('X-Content-Type-Options: nosniff');
    header("Content-Security-Policy: default-src 'none'");
    readfile($path);
    exit;
}
