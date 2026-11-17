<?php
defined('BRITECH') || exit;

/** Shared PDO connection (MySQL / MariaDB). All times are stored in UTC. */
function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $pdo = db_connect(
            (string) cfg('db.host', 'localhost'),
            (int) cfg('db.port', 3306),
            (string) cfg('db.name', ''),
            (string) cfg('db.user', ''),
            (string) cfg('db.pass', '')
        );
    }
    return $pdo;
}

function db_connect(string $host, int $port, string $name, string $user, string $pass): PDO
{
    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_TIMEOUT => 10,
    ]);
    // Timestamps are UTC in the database (same as the Node.js version), converted for display.
    $pdo->exec("SET time_zone = '+00:00'");
    return $pdo;
}

function q(string $sql, array $params = []): PDOStatement
{
    $stmt = db()->prepare($sql);
    foreach ($params as $key => $value) {
        $name = is_int($key) ? $key + 1 : $key;
        if (is_int($value)) {
            $stmt->bindValue($name, $value, PDO::PARAM_INT);
        } elseif (is_bool($value)) {
            $stmt->bindValue($name, $value ? 1 : 0, PDO::PARAM_INT);
        } elseif ($value === null) {
            $stmt->bindValue($name, null, PDO::PARAM_NULL);
        } else {
            $stmt->bindValue($name, (string) $value);
        }
    }
    $stmt->execute();
    return $stmt;
}

function rows(string $sql, array $params = []): array
{
    return q($sql, $params)->fetchAll();
}

function row(string $sql, array $params = []): ?array
{
    $r = q($sql, $params)->fetch();
    return $r === false ? null : $r;
}

/** @return mixed */
function val(string $sql, array $params = [])
{
    $v = q($sql, $params)->fetchColumn();
    return $v === false ? null : $v;
}

/** Current UTC time in the DATETIME(3) format used by the database. */
function now_utc(int $plusSeconds = 0): string
{
    return gmdate('Y-m-d H:i:s', time() + $plusSeconds) . '.000';
}

/** Random primary key, compatible with the existing string IDs. */
function new_id(): string
{
    return 'c' . bin2hex(random_bytes(12));
}

/** Inserts a row; returns nothing. Column names are trusted (code-defined). */
function db_insert(string $table, array $data): void
{
    $cols = array_keys($data);
    $sql = sprintf(
        'INSERT INTO `%s` (%s) VALUES (%s)',
        $table,
        implode(', ', array_map(fn ($c) => "`{$c}`", $cols)),
        implode(', ', array_map(fn ($c) => ":{$c}", $cols))
    );
    q($sql, $data);
}

function db_update(string $table, array $data, string $id): void
{
    $sets = implode(', ', array_map(fn ($c) => "`{$c}` = :{$c}", array_keys($data)));
    $data['__id'] = $id;
    q("UPDATE `{$table}` SET {$sets} WHERE id = :__id", $data);
}

function set_setting(string $key, string $value): void
{
    q('INSERT INTO `Setting` (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)', [$key, $value]);
}
