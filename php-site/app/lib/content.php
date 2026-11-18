<?php
defined('BRITECH') || exit;

/* --------------------------------- settings -------------------------------- */

const SETTING_KEYS = [
    'phone1', 'phone2', 'email', 'address',
    'linkedin', 'twitter', 'facebook', 'instagram', 'youtube',
    'whatsapp', 'announcement_text', 'announcement_link',
];

function setting_defaults(): array
{
    $c = data('company');
    return [
        'phone1' => $c['phones'][0],
        'phone2' => $c['phones'][1] ?? '',
        'email' => $c['email'],
        'address' => $c['address'],
        // Social links stay empty until set in the admin, so no placeholder links are shown.
        'linkedin' => '', 'twitter' => '', 'facebook' => '', 'instagram' => '', 'youtube' => '',
        // WhatsApp button stays hidden until a number is set in the admin.
        'whatsapp' => '',
        // Empty text hides the announcement bar.
        'announcement_text' => 'Meet Njiwa, Britech’s bulk SMS platform.',
        'announcement_link' => '/products#njiwa',
    ];
}

function settings(): array
{
    static $out = null;
    if ($out !== null) {
        return $out;
    }
    $out = setting_defaults();
    try {
        foreach (rows('SELECT `key`, `value` FROM `Setting`') as $r) {
            if (in_array($r['key'], SETTING_KEYS, true)) {
                $out[$r['key']] = $r['value'];
            }
        }
    } catch (Throwable $e) {
        error_log('settings() failed, using defaults: ' . $e->getMessage());
    }
    return $out;
}

/* --------------------------- partners & projects ---------------------------- */

const PARTNER_PAGE_SIZE = 30;
const PROJECT_PAGE_SIZE = 12;
const PRODUCT_PAGE_SIZE = 12;
const POST_PAGE_SIZE = 9;

function partner_preview(int $take = 15): array
{
    return [
        'partners' => rows('SELECT * FROM `Partner` WHERE active = 1 ORDER BY sortOrder ASC, name ASC LIMIT ' . $take),
        'total' => (int) val('SELECT COUNT(*) FROM `Partner` WHERE active = 1'),
    ];
}

/** Home hero "Trusted by" logos: these clients first (matched by name), then the usual order. */
function hero_logos(int $take = 5): array
{
    $first = [['eabc', 'east african business council'], ['silverland'], ['trias'], ['pastoral women', 'pwc']];
    $all = rows('SELECT id, name, logo FROM `Partner` WHERE active = 1 ORDER BY sortOrder ASC, name ASC');
    $rank = function (string $name) use ($first): int {
        $n = mb_strtolower($name);
        foreach ($first as $i => $keys) {
            foreach ($keys as $k) {
                if (str_contains($n, $k)) {
                    return $i;
                }
            }
        }
        return count($first);
    };
    // usort is stable (PHP 8+), so everyone else keeps the admin order.
    usort($all, fn ($a, $b) => $rank($a['name']) <=> $rank($b['name']));
    return array_slice($all, 0, $take);
}

/** @param ?string $kind CLIENT|PARTNER — "BOTH" counts as both. */
function partners_page(?string $q, ?string $kind, int $page): array
{
    $where = 'active = 1';
    $params = [];
    if ($q) {
        $where .= ' AND name LIKE :q';
        $params['q'] = like($q);
    }
    if ($kind) {
        $where .= " AND kind IN (:kind, 'BOTH')";
        $params['kind'] = $kind;
    }
    $total = (int) val("SELECT COUNT(*) FROM `Partner` WHERE {$where}", $params);
    $offset = ($page - 1) * PARTNER_PAGE_SIZE;
    $partners = rows("SELECT * FROM `Partner` WHERE {$where} ORDER BY sortOrder ASC, name ASC LIMIT {$offset}, " . PARTNER_PAGE_SIZE, $params);
    return ['partners' => $partners, 'total' => $total, 'pages' => page_count($total, PARTNER_PAGE_SIZE)];
}

function projects_page(?string $q, ?string $sector, int $page): array
{
    $where = 'published = 1 AND isProduct = 0';
    $params = [];
    if ($sector) {
        $where .= ' AND sector = :sector';
        $params['sector'] = $sector;
    }
    if ($q) {
        $where .= ' AND (name LIKE :q1 OR tagline LIKE :q2 OR client LIKE :q3 OR description LIKE :q4)';
        $params += ['q1' => like($q), 'q2' => like($q), 'q3' => like($q), 'q4' => like($q)];
    }
    $total = (int) val("SELECT COUNT(*) FROM `Project` WHERE {$where}", $params);
    $offset = ($page - 1) * PROJECT_PAGE_SIZE;
    $projects = rows("SELECT * FROM `Project` WHERE {$where} ORDER BY sortOrder ASC, name ASC LIMIT {$offset}, " . PROJECT_PAGE_SIZE, $params);
    return ['projects' => $projects, 'total' => $total, 'pages' => page_count($total, PROJECT_PAGE_SIZE)];
}

function project_sectors(): array
{
    return rows('SELECT sector AS name, COUNT(*) AS count FROM `Project` WHERE published = 1 AND isProduct = 0 AND sector IS NOT NULL GROUP BY sector ORDER BY sector ASC');
}

/** Britech-owned platforms (projects flagged “Show as a product”). */
function products(int $page = 1, ?int $take = null): array
{
    $size = $take ?? PRODUCT_PAGE_SIZE;
    $total = (int) val('SELECT COUNT(*) FROM `Project` WHERE published = 1 AND isProduct = 1');
    $offset = ($page - 1) * $size;
    $products = rows("SELECT * FROM `Project` WHERE published = 1 AND isProduct = 1 ORDER BY sortOrder ASC, name ASC LIMIT {$offset}, {$size}");
    return ['products' => $products, 'total' => $total, 'pages' => page_count($total, $size)];
}

/* ----------------------------------- posts ---------------------------------- */

const PUBLIC_POST_COLUMNS = 'p.id, p.title, p.slug, p.excerpt, p.coverImage, p.category, p.tags, p.featured, p.publishedAt, p.updatedAt, p.content, u.name AS authorName';

function published_posts(?string $category, ?string $q, int $page): array
{
    $where = "p.status = 'PUBLISHED'";
    $params = [];
    if ($category) {
        $where .= ' AND p.category = :category';
        $params['category'] = $category;
    }
    if ($q) {
        $where .= ' AND (p.title LIKE :q1 OR p.excerpt LIKE :q2 OR p.tags LIKE :q3)';
        $params += ['q1' => like($q), 'q2' => like($q), 'q3' => like($q)];
    }
    $total = (int) val("SELECT COUNT(*) FROM `Post` p WHERE {$where}", $params);
    $offset = ($page - 1) * POST_PAGE_SIZE;
    $posts = rows(
        'SELECT ' . PUBLIC_POST_COLUMNS . " FROM `Post` p JOIN `User` u ON u.id = p.authorId WHERE {$where}
          ORDER BY p.publishedAt DESC LIMIT {$offset}, " . POST_PAGE_SIZE,
        $params
    );
    return ['posts' => $posts, 'total' => $total, 'pages' => page_count($total, POST_PAGE_SIZE)];
}

function post_categories(): array
{
    return rows("SELECT category AS name, COUNT(*) AS count FROM `Post` WHERE status = 'PUBLISHED' GROUP BY category ORDER BY count DESC, name ASC");
}

function post_by_slug(string $slug): ?array
{
    return row('SELECT ' . PUBLIC_POST_COLUMNS . " FROM `Post` p JOIN `User` u ON u.id = p.authorId WHERE p.slug = ? AND p.status = 'PUBLISHED'", [$slug]);
}

function related_posts(string $category, string $excludeId): array
{
    return rows(
        'SELECT ' . PUBLIC_POST_COLUMNS . " FROM `Post` p JOIN `User` u ON u.id = p.authorId
          WHERE p.status = 'PUBLISHED' AND p.category = ? AND p.id <> ? ORDER BY p.publishedAt DESC LIMIT 3",
        [$category, $excludeId]
    );
}

function latest_posts(int $take = 3): array
{
    try {
        return rows('SELECT ' . PUBLIC_POST_COLUMNS . " FROM `Post` p JOIN `User` u ON u.id = p.authorId WHERE p.status = 'PUBLISHED' ORDER BY p.publishedAt DESC LIMIT {$take}");
    } catch (Throwable $e) {
        return [];
    }
}

/* -------------------------------- testimonials ------------------------------ */

function testimonials(int $take = 6): array
{
    try {
        return rows("SELECT * FROM `Testimonial` WHERE active = 1 ORDER BY sortOrder ASC, createdAt DESC LIMIT {$take}");
    } catch (Throwable $e) {
        return [];
    }
}
