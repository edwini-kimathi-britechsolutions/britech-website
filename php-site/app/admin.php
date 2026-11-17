<?php
defined('BRITECH') || exit;

/*
 * Admin portal (/admin). Every page and every action checks the signed-in user's role on the server.
 * Forms post back to the same URL; on success they redirect (?saved=1 …), on error the form is shown
 * again with what the user typed.
 */

require APP . '/views/admin/components.php';

const EDITORS = ['ADMIN', 'EDITOR'];

function admin_page(string $title, string $content, array $user, bool $withEditor = false): void
{
    $newInquiries = can_manage_content($user) ? (int) val("SELECT COUNT(*) FROM `Inquiry` WHERE status = 'NEW'") : 0;
    echo render('admin/layout', compact('title', 'content', 'user', 'newInquiries', 'withEditor'));
}

function route_admin(string $path): bool
{
    header('X-Robots-Tag: noindex, nofollow');
    header('Cache-Control: no-store');

    if ($path === '/admin/login') {
        admin_login();
        return true;
    }
    if ($path === '/admin/logout') {
        if (is_post()) {
            verify_csrf();
            destroy_session();
        }
        redirect('/admin/login');
    }

    // Everything below needs a signed-in user; POSTs need a valid CSRF token.
    $user = require_user();
    if (is_post()) {
        verify_csrf();
    }

    $routes = [
        '#^/admin$#' => 'admin_dashboard',
        '#^/admin/upload$#' => 'admin_upload',
        '#^/admin/inquiries$#' => 'admin_inquiries',
        '#^/admin/inquiries/(c?[a-z0-9]+)$#' => 'admin_inquiry',
        '#^/admin/posts$#' => 'admin_posts',
        '#^/admin/posts/delete$#' => 'admin_post_delete',
        '#^/admin/posts/(new|c?[a-z0-9]+)$#' => 'admin_post_edit',
        '#^/admin/projects$#' => 'admin_projects',
        '#^/admin/projects/(new|c?[a-z0-9]+)$#' => 'admin_project_edit',
        '#^/admin/partners$#' => 'admin_partners',
        '#^/admin/partners/(new|c?[a-z0-9]+)$#' => 'admin_partner_edit',
        '#^/admin/testimonials$#' => 'admin_testimonials',
        '#^/admin/testimonials/(new|c?[a-z0-9]+)$#' => 'admin_testimonial_edit',
        '#^/admin/users$#' => 'admin_users',
        '#^/admin/settings$#' => 'admin_settings',
        '#^/admin/account$#' => 'admin_account',
    ];
    foreach ($routes as $pattern => $fn) {
        if (preg_match($pattern, $path, $m)) {
            $fn($user, $m[1] ?? null);
            return true;
        }
    }
    return false;
}

/* ================================== sign in ================================== */

function admin_login(): void
{
    if (current_user()) {
        redirect('/admin');
    }
    $error = null;
    $email = '';
    if (is_post()) {
        $email = mb_strtolower(input_trim('email', 191));
        $password = input('password', 200);
        $age = form_token_age(input('_login', 200));
        if (!same_origin() || $age === null || $age > 86400) {
            $error = 'The sign-in form expired. Please try again.';
        } elseif ($email === '' || $password === '') {
            $error = 'Enter your email and password.';
        } else {
            $ip = client_ip();
            if (is_login_rate_limited($email, $ip)) {
                $error = 'Too many sign-in attempts. Please wait 15 minutes and try again.';
            } else {
                $u = row('SELECT * FROM `User` WHERE email = ?', [$email]);
                $ok = $u && (int) $u['active'] ? verify_password($password, $u['passwordHash']) : burn_password_check($password);
                if (!$ok || !$u) {
                    record_failed_login($email, $ip);
                    $error = 'Incorrect email or password.';
                } else {
                    clear_failed_logins($email);
                    q('DELETE FROM `Session` WHERE userId = ? AND expiresAt < ?', [$u['id'], now_utc()]);
                    if (password_needs_rehash($u['passwordHash'], PASSWORD_BCRYPT, ['cost' => 12])) {
                        q('UPDATE `User` SET passwordHash = ?, updatedAt = ? WHERE id = ?', [hash_password($password), now_utc(), $u['id']]);
                    }
                    create_session($u['id']);
                    redirect('/admin');
                }
            }
        }
    }
    echo render('admin/login', compact('error', 'email'));
}

/* ================================= dashboard ================================= */

function admin_dashboard(array $user): void
{
    $editor = can_manage_content($user);
    $mine = $editor ? '' : ' AND authorId = ' . db()->quote($user['id']);
    $count = fn (string $status) => (int) val("SELECT COUNT(*) FROM `Post` WHERE status = ?{$mine}", [$status]);
    $recent = rows('SELECT p.id, p.title, p.status, p.updatedAt, u.name AS authorName FROM `Post` p JOIN `User` u ON u.id = p.authorId WHERE 1=1'
        . str_replace('authorId', 'p.authorId', $mine) . ' ORDER BY p.updatedAt DESC LIMIT 6');

    $cards = [
        ['Published posts', $count('PUBLISHED'), '/admin/posts?status=PUBLISHED', 'FileText'],
        ['Awaiting review', $count('REVIEW'), '/admin/posts?status=REVIEW', 'PenLine'],
        ['Drafts', $count('DRAFT'), '/admin/posts?status=DRAFT', 'FileText'],
    ];
    if ($editor) {
        $cards[] = ['New inquiries', (int) val("SELECT COUNT(*) FROM `Inquiry` WHERE status = 'NEW'"), '/admin/inquiries?status=NEW', 'Inbox'];
        $cards[] = ['Projects', (int) val('SELECT COUNT(*) FROM `Project`'), '/admin/projects', 'Briefcase'];
        $cards[] = ['Clients & partners', (int) val('SELECT COUNT(*) FROM `Partner` WHERE active = 1'), '/admin/partners', 'Handshake'];
    }

    $h = isset($_GET['denied']) ? '<p class="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">You don’t have permission to open that page.</p>' : '';
    $h .= '<div class="flex flex-wrap items-end justify-between gap-4"><div><h1 class="text-2xl font-bold text-navy-900">Welcome, ' . e(explode(' ', $user['name'])[0]) . '</h1>'
        . '<p class="text-navy-500">Manage the Britech Solutions website.</p></div>' . add_button('/admin/posts/new', 'Write a post', 'PenLine') . '</div>';
    $h .= '<div class="mt-8 grid gap-4 sm:grid-cols-3 xl:grid-cols-6">';
    foreach ($cards as [$label, $value, $href, $ic]) {
        $h .= '<a href="' . e($href) . '" class="rounded-xl border border-navy-100 bg-white p-5 transition hover:border-mint-300">' . icon($ic, 'h-5 w-5 text-mint-700')
            . '<p class="mt-3 text-3xl font-bold text-navy-900">' . $value . '</p><p class="text-sm text-navy-500">' . e($label) . '</p></a>';
    }
    $h .= '</div><section class="mt-10"><div class="flex items-center justify-between"><h2 class="font-semibold text-navy-900">Recently updated posts</h2>'
        . '<a href="/admin/posts" class="inline-flex items-center gap-1 text-sm font-medium text-mint-700">All posts ' . icon('ArrowRight', 'h-4 w-4') . '</a></div>'
        . '<div class="mt-4 divide-y divide-navy-100 overflow-hidden rounded-xl border border-navy-100 bg-white">';
    if (!$recent) {
        $h .= '<p class="p-6 text-sm text-navy-500">No posts yet. Write the first one!</p>';
    }
    foreach ($recent as $p) {
        $h .= '<a href="/admin/posts/' . e($p['id']) . '" class="flex items-center gap-4 px-5 py-3.5 hover:bg-navy-50/60">'
            . '<span class="min-w-0 flex-1 truncate font-medium text-navy-900">' . e($p['title']) . '</span>'
            . '<span class="hidden text-sm text-navy-400 sm:block">' . e($p['authorName']) . '</span>'
            . '<span class="hidden text-sm text-navy-400 md:block">' . e(format_date($p['updatedAt'])) . '</span>' . status_badge($p['status']) . '</a>';
    }
    $h .= '</div></section>';
    admin_page('Dashboard', $h, $user);
}

/* ================================== uploads ================================== */

function admin_upload(array $user): void
{
    if (!is_post()) {
        json_response(['error' => 'Method not allowed.'], 405);
    }
    if (!isset($_FILES['file'])) {
        json_response(['error' => 'No file received (it may be larger than the server allows).'], 400);
    }
    try {
        json_response(['url' => save_uploaded_image($_FILES['file'], $user['id'])]);
    } catch (Throwable $e) {
        json_response(['error' => $e instanceof RuntimeException ? $e->getMessage() : 'Upload failed.'], 400);
    }
}

/* ================================= inquiries ================================= */

function admin_inquiries(array $user): void
{
    require_user(EDITORS);
    $statuses = ['NEW', 'READ', 'ARCHIVED'];
    $status = in_array(qs('status'), $statuses, true) ? qs('status') : null;
    $q = qs('q');
    $page = parse_page();
    $size = 25;

    $search = '1=1';
    $params = [];
    if ($q !== '') {
        $search = '(firstName LIKE :q1 OR lastName LIKE :q2 OR email LIKE :q3 OR company LIKE :q4 OR message LIKE :q5)';
        $params = ['q1' => like($q), 'q2' => like($q), 'q3' => like($q), 'q4' => like($q), 'q5' => like($q)];
    }
    // Default view hides archived messages.
    $where = $search . ($status ? ' AND status = :status' : " AND status <> 'ARCHIVED'");
    $wp = $params + ($status ? ['status' => $status] : []);
    $total = (int) val("SELECT COUNT(*) FROM `Inquiry` WHERE {$where}", $wp);
    $offset = ($page - 1) * $size;
    $list = rows("SELECT * FROM `Inquiry` WHERE {$where} ORDER BY createdAt DESC LIMIT {$offset}, {$size}", $wp);
    $counts = array_column(rows("SELECT status, COUNT(*) AS n FROM `Inquiry` WHERE {$search} GROUP BY status", $params), 'n', 'status');
    $c = fn (string $s) => (int) ($counts[$s] ?? 0);
    $smtp = smtp_config();

    $h = page_title('Inquiries', 'Messages sent through the website contact form.');
    if (isset($_GET['archived'])) {
        $h .= notice('Inquiry archived.');
    }
    if (isset($_GET['deleted'])) {
        $h .= notice('Inquiry deleted.');
    }
    if ($smtp['host'] === '') {
        $h .= notice('Email notifications are off. ' . ($user['role'] === 'ADMIN'
            ? '<a href="/admin/settings" class="font-semibold underline">Set up SMTP in Site settings</a>'
            : 'Ask an admin to set up SMTP in Site settings.') . ' — inquiries are still saved here.', 'warn');
    }
    $h .= '<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">'
        . filter_chips('/admin/inquiries', 'status', $status, [
            ['label' => 'Inbox', 'count' => $c('NEW') + $c('READ')],
            ['label' => 'New', 'value' => 'NEW', 'count' => $c('NEW')],
            ['label' => 'Read', 'value' => 'READ', 'count' => $c('READ')],
            ['label' => 'Archived', 'value' => 'ARCHIVED', 'count' => $c('ARCHIVED')],
        ], ['q' => $q])
        . search_form('/admin/inquiries', $q, ['status' => $status], 'Search name, email, message') . '</div>';

    if (!$list) {
        $h .= empty_state($q !== '' || $status ? 'No inquiries match' : 'No inquiries yet', '', $q !== '' || $status ? '/admin/inquiries' : '');
    } else {
        $h .= '<div class="divide-y divide-navy-100 overflow-hidden rounded-xl border border-navy-100 bg-white">';
        foreach ($list as $r) {
            $new = $r['status'] === 'NEW';
            $h .= '<a href="/admin/inquiries/' . e($r['id']) . '" class="flex items-start gap-4 px-5 py-4 hover:bg-navy-50/60">'
                . '<span class="mt-2 h-2 w-2 shrink-0 rounded-full ' . ($new ? 'bg-mint-500' : 'bg-transparent') . '"></span>'
                . '<div class="min-w-0 flex-1"><div class="flex flex-wrap items-baseline gap-x-2"><span class="text-navy-900 ' . ($new ? 'font-semibold' : 'font-medium') . '">' . e($r['firstName'] . ' ' . $r['lastName']) . '</span>'
                . ($r['company'] ? '<span class="text-sm text-navy-500">· ' . e($r['company']) . '</span>' : '') . '</div>'
                . '<p class="mt-0.5 truncate text-sm text-navy-500"><span class="font-medium text-navy-700">' . e($r['service']) . '</span> — ' . e($r['message']) . '</p></div>'
                . '<div class="flex shrink-0 flex-col items-end gap-1"><span class="text-xs text-navy-400">' . e(format_date($r['createdAt'])) . '</span>'
                . ($r['emailError'] ? '<span title="' . e($r['emailError']) . '" class="inline-flex items-center gap-1 text-xs text-amber-700">' . icon('AlertTriangle', 'h-3 w-3') . ' not emailed</span>' : '')
                . '</div></a>';
        }
        $h .= '</div>';
    }
    $h .= pagination('/admin/inquiries', ['status' => $status, 'q' => $q], $page, page_count($total, $size), $total, $size, 'inquiries');
    admin_page('Inquiries', $h, $user);
}

function admin_inquiry(array $user, string $id): void
{
    require_user(EDITORS);
    if (is_post()) {
        $action = input('action', 20);
        if ($action === 'delete') {
            require_user(['ADMIN']);
            q('DELETE FROM `Inquiry` WHERE id = ?', [$id]);
            redirect('/admin/inquiries?deleted=1');
        }
        $status = input('status', 20);
        if (in_array($status, ['NEW', 'READ', 'ARCHIVED'], true)) {
            q('UPDATE `Inquiry` SET status = ? WHERE id = ?', [$status, $id]);
        }
        redirect($status === 'ARCHIVED' ? '/admin/inquiries?archived=1' : '/admin/inquiries/' . $id . ($status === 'NEW' ? '?unread=1' : ''));
    }

    $inq = row('SELECT * FROM `Inquiry` WHERE id = ?', [$id]);
    if (!$inq) {
        not_found();
    }
    // Opening a new inquiry marks it as read (unless it was just marked unread).
    if ($inq['status'] === 'NEW' && !isset($_GET['unread'])) {
        q("UPDATE `Inquiry` SET status = 'READ' WHERE id = ?", [$id]);
        $inq['status'] = 'READ';
    }
    admin_page('Inquiry', render('admin/inquiry', ['inq' => $inq, 'user' => $user]), $user);
}

/* =================================== posts =================================== */

function admin_posts(array $user): void
{
    $editor = can_manage_content($user);
    $statuses = ['PUBLISHED', 'REVIEW', 'DRAFT'];
    $status = in_array(qs('status'), $statuses, true) ? qs('status') : null;
    $q = qs('q');
    $page = parse_page();
    $size = 20;

    $base = '1=1';
    $params = [];
    if (!$editor) {
        $base .= ' AND p.authorId = :me';
        $params['me'] = $user['id'];
    }
    if ($q !== '') {
        $base .= ' AND (p.title LIKE :q1 OR p.excerpt LIKE :q2 OR p.tags LIKE :q3)';
        $params += ['q1' => like($q), 'q2' => like($q), 'q3' => like($q)];
    }
    $where = $base . ($status ? ' AND p.status = :status' : '');
    $wp = $params + ($status ? ['status' => $status] : []);
    $total = (int) val("SELECT COUNT(*) FROM `Post` p WHERE {$where}", $wp);
    $offset = ($page - 1) * $size;
    $posts = rows("SELECT p.id, p.title, p.status, p.category, p.updatedAt, u.name AS authorName FROM `Post` p JOIN `User` u ON u.id = p.authorId
        WHERE {$where} ORDER BY p.updatedAt DESC LIMIT {$offset}, {$size}", $wp);
    $counts = array_column(rows("SELECT p.status, COUNT(*) AS n FROM `Post` p WHERE {$base} GROUP BY p.status", $params), 'n', 'status');
    $c = fn (?string $s) => $s ? (int) ($counts[$s] ?? 0) : (int) array_sum($counts);

    $h = page_title('Blog posts', $editor ? 'Write, review and publish articles.' : 'Write articles and submit them for review.', add_button('/admin/posts/new', 'New post', 'PenLine'));
    if (isset($_GET['deleted'])) {
        $h .= notice('Post deleted.');
    }
    $h .= '<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">'
        . filter_chips('/admin/posts', 'status', $status, [
            ['label' => 'All', 'count' => $c(null)],
            ['label' => 'Published', 'value' => 'PUBLISHED', 'count' => $c('PUBLISHED')],
            ['label' => 'In review', 'value' => 'REVIEW', 'count' => $c('REVIEW')],
            ['label' => 'Drafts', 'value' => 'DRAFT', 'count' => $c('DRAFT')],
        ], ['q' => $q])
        . search_form('/admin/posts', $q, ['status' => $status], 'Search posts') . '</div>';
    if (!$posts) {
        $filtered = $q !== '' || $status;
        $h .= empty_state($filtered ? 'No posts match' : 'No posts yet', '', $filtered ? '/admin/posts' : '');
    } else {
        $h .= '<div class="divide-y divide-navy-100 overflow-hidden rounded-xl border border-navy-100 bg-white">';
        foreach ($posts as $p) {
            $h .= '<a href="/admin/posts/' . e($p['id']) . '" class="flex items-center gap-4 px-5 py-4 hover:bg-navy-50/60"><div class="min-w-0 flex-1">'
                . '<p class="truncate font-medium text-navy-900">' . e($p['title']) . '</p>'
                . '<p class="truncate text-xs text-navy-400">' . e($p['category']) . ' · ' . e($p['authorName']) . ' · updated ' . e(format_date($p['updatedAt'])) . '</p></div>'
                . status_badge($p['status']) . '</a>';
        }
        $h .= '</div>';
    }
    $h .= pagination('/admin/posts', ['status' => $status, 'q' => $q], $page, page_count($total, $size), $total, $size, 'posts');
    admin_page('Blog posts', $h, $user);
}

function unique_post_slug(string $base, ?string $excludeId): string
{
    $root = slugify($base) ?: 'post';
    $slug = $root;
    for ($i = 2; ; $i++) {
        $hit = val('SELECT id FROM `Post` WHERE slug = ? AND id <> ?', [$slug, $excludeId ?? '']);
        if (!$hit) {
            return $slug;
        }
        $slug = "{$root}-{$i}";
    }
}

function admin_post_edit(array $user, string $id): void
{
    $editor = can_manage_content($user);
    $post = null;
    if ($id !== 'new') {
        $post = row('SELECT p.*, u.name AS authorName FROM `Post` p JOIN `User` u ON u.id = p.authorId WHERE p.id = ?', [$id]);
        if (!$post || (!$editor && $post['authorId'] !== $user['id'])) {
            not_found();
        }
    }
    $error = null;
    $old = [];

    if (is_post()) {
        $old = array_map(fn ($v) => is_string($v) ? $v : '', $_POST);
        $error = save_post($user, $post);
        // save_post redirects on success.
    }

    $locked = $post && !$editor && $post['status'] === 'PUBLISHED';
    $canDelete = $post && ($editor || ($post['authorId'] === $user['id'] && $post['status'] !== 'PUBLISHED'));
    $saved = ['published' => 'Published — the post is live on the website.', 'review' => 'Submitted for review. An editor will publish it.', 'draft' => 'Draft saved.'];

    $actions = '';
    if ($post) {
        $actions = '<div class="flex items-center gap-3">';
        if ($post['status'] === 'PUBLISHED') {
            $actions .= '<a href="/blog/' . e($post['slug']) . '" target="_blank" class="inline-flex items-center gap-1 text-sm font-medium text-navy-600 hover:text-navy-900">View live ' . icon('ExternalLink', 'h-4 w-4') . '</a>';
        }
        if ($canDelete) {
            $actions .= delete_form('/admin/posts/delete', $post['id'], 'Delete this post permanently?');
        }
        $actions .= '</div>';
    }
    $h = page_title($post ? 'Edit post' : 'New post', $post ? 'By ' . $post['authorName'] : '', $actions);
    if ($post && isset($saved[qs('saved')])) {
        $h .= notice(e($saved[qs('saved')]));
    }
    if (qs('error') === 'delete') {
        $h .= notice('You can’t delete this post.', 'warn');
    }
    $h .= $locked
        ? notice('This post is published. Ask an editor if it needs changes.', 'warn')
        : render('admin/post-form', ['post' => $post, 'old' => $old, 'error' => $error, 'canPublish' => $editor]);
    admin_page($post ? 'Edit post' : 'New post', $h, $user, !$locked);
}

/** Returns an error message, or redirects on success. */
function save_post(array $user, ?array $existing): ?string
{
    $editor = can_manage_content($user);
    if ($existing && !$editor) {
        if ($existing['authorId'] !== $user['id']) {
            return 'You can only edit your own posts.';
        }
        if ($existing['status'] === 'PUBLISHED') {
            return 'This post is published. Ask an editor to make changes.';
        }
    }
    $title = input_trim('title', 400);
    $excerpt = input_trim('excerpt', 800);
    $category = input_trim('category', 120);
    $cover = input_trim('coverImage', 400);
    $intent = input('intent', 20);
    if (mb_strlen($title) < 3) {
        return 'Title is too short.';
    }
    if (mb_strlen($title) > 200) {
        return 'Title is too long (200 characters max).';
    }
    if (mb_strlen($excerpt) < 10) {
        return 'Write a short summary (at least 10 characters).';
    }
    if (mb_strlen($excerpt) > 400) {
        return 'The summary is too long (400 characters max).';
    }
    if (mb_strlen($category) < 2 || mb_strlen($category) > 60) {
        return 'Choose a category.';
    }
    if ($cover !== '' && !preg_match('#^/(media|images)/[\w./-]+$#', $cover)) {
        return 'Cover image must be an uploaded image.';
    }
    if (!in_array($intent, ['draft', 'review', 'publish'], true)) {
        return 'Choose whether to save or publish.';
    }
    $content = sanitize_post_html(input('content', 500000));
    if ($intent !== 'draft' && mb_strlen(trim(strip_all_tags($content))) < 50) {
        return 'Add more content before submitting (at least a short paragraph).';
    }

    // Authors can’t publish — “publish” from an author becomes “submit for review”.
    $status = $intent === 'draft' ? 'DRAFT' : ($intent === 'publish' && $editor ? 'PUBLISHED' : 'REVIEW');
    $tags = implode(', ', array_slice(array_values(array_filter(array_map('trim', explode(',', input('tags', 600))))), 0, 10));
    $data = [
        'title' => $title,
        'slug' => unique_post_slug(input_trim('slug', 191) ?: $title, $existing['id'] ?? null),
        'excerpt' => $excerpt,
        'category' => $category,
        'tags' => mb_substr($tags, 0, 300),
        'coverImage' => $cover ?: null,
        'content' => $content,
        'status' => $status,
        'featured' => $editor ? checked('featured') : (bool) (int) ($existing['featured'] ?? 0),
        'publishedAt' => $status === 'PUBLISHED' ? ($existing['publishedAt'] ?? now_utc()) : ($existing['publishedAt'] ?? null),
        'updatedAt' => now_utc(),
    ];
    if ($existing) {
        db_update('Post', $data, $existing['id']);
        $id = $existing['id'];
    } else {
        $id = new_id();
        db_insert('Post', $data + ['id' => $id, 'authorId' => $user['id'], 'createdAt' => now_utc()]);
    }
    redirect('/admin/posts/' . $id . '?saved=' . strtolower($status));
    return null;
}

function admin_post_delete(array $user): void
{
    if (!is_post()) {
        redirect('/admin/posts');
    }
    $id = input('id', 64);
    $post = row('SELECT * FROM `Post` WHERE id = ?', [$id]);
    if (!$post) {
        redirect('/admin/posts');
    }
    $allowed = can_manage_content($user) || ($post['authorId'] === $user['id'] && $post['status'] !== 'PUBLISHED');
    if (!$allowed) {
        redirect('/admin/posts/' . $id . '?error=delete');
    }
    q('DELETE FROM `Post` WHERE id = ?', [$id]);
    redirect('/admin/posts?deleted=1');
}

/* ================================== projects ================================= */

function admin_projects(array $user): void
{
    require_user(EDITORS);
    $q = qs('q');
    $type = in_array(qs('type'), ['products', 'clients'], true) ? qs('type') : null;
    $page = parse_page();
    $size = 25;
    $where = '1=1';
    $params = [];
    if ($q !== '') {
        $where .= ' AND (name LIKE :q1 OR tagline LIKE :q2 OR client LIKE :q3)';
        $params = ['q1' => like($q), 'q2' => like($q), 'q3' => like($q)];
    }
    if ($type) {
        $where .= ' AND isProduct = ' . ($type === 'products' ? 1 : 0);
    }
    $total = (int) val("SELECT COUNT(*) FROM `Project` WHERE {$where}", $params);
    $offset = ($page - 1) * $size;
    $list = rows("SELECT * FROM `Project` WHERE {$where} ORDER BY sortOrder ASC, name ASC LIMIT {$offset}, {$size}", $params);

    $h = page_title('Projects & products', 'Projects appear on Our Work. Turn on “Show as a Britech product” to also list one on Products.', add_button('/admin/projects/new', 'Add project'));
    if (isset($_GET['saved'])) {
        $h .= notice('Project saved.');
    }
    if (isset($_GET['deleted'])) {
        $h .= notice('Project deleted.');
    }
    $h .= '<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">'
        . filter_chips('/admin/projects', 'type', $type, [['label' => 'All'], ['label' => 'Products', 'value' => 'products'], ['label' => 'Client work', 'value' => 'clients']], ['q' => $q])
        . search_form('/admin/projects', $q, ['type' => $type], 'Search projects') . '</div>';
    if (!$list) {
        $h .= empty_state('No projects match', '', '/admin/projects');
    } else {
        $h .= '<div class="overflow-x-auto rounded-xl border border-navy-100 bg-white"><table class="w-full min-w-[640px] text-left text-sm">'
            . '<thead class="border-b border-navy-100 bg-navy-50/60 text-xs uppercase tracking-wider text-navy-500"><tr>'
            . '<th class="px-5 py-3 font-semibold">Project</th><th class="px-5 py-3 font-semibold">Client</th><th class="px-5 py-3 font-semibold">Type</th><th class="px-5 py-3 font-semibold">Status</th><th class="px-5 py-3 font-semibold">Order</th>'
            . '</tr></thead><tbody class="divide-y divide-navy-100">';
        foreach ($list as $p) {
            $prod = (int) $p['isProduct'];
            $h .= '<tr class="hover:bg-navy-50/60"><td class="px-5 py-3"><a href="/admin/projects/' . e($p['id']) . '" class="flex items-center gap-3">'
                . '<span class="flex h-10 w-16 shrink-0 items-center justify-center">' . ($p['logo'] ? '<img src="' . e($p['logo']) . '" alt="" class="max-h-10 max-w-16 object-contain">' : '') . '</span>'
                . '<span><span class="block font-medium text-navy-900">' . e($p['name']) . '</span><span class="block text-xs text-navy-400">' . e($p['tagline']) . '</span></span></a></td>'
                . '<td class="px-5 py-3 text-navy-600">' . e($p['client'] ?? '—') . '</td>'
                . '<td class="px-5 py-3"><span class="rounded-full px-2.5 py-0.5 text-xs font-semibold ' . ($prod ? 'bg-mint-50 text-mint-700' : 'bg-navy-50 text-navy-600') . '">' . ($prod ? 'Product' : 'Client work') . '</span></td>'
                . '<td class="px-5 py-3 text-navy-600">' . ((int) $p['published'] ? 'Visible' : 'Hidden') . '</td>'
                . '<td class="px-5 py-3 text-navy-600">' . (int) $p['sortOrder'] . '</td></tr>';
        }
        $h .= '</tbody></table></div>';
    }
    $h .= pagination('/admin/projects', ['q' => $q, 'type' => $type], $page, page_count($total, $size), $total, $size, 'projects');
    admin_page('Projects', $h, $user);
}

function image_path_ok(string $v): bool
{
    return $v === '' || (bool) preg_match('#^/(media|images)/[\w./-]+$#', $v);
}

function url_ok(string $v): bool
{
    return $v === '' || safe_url($v) !== null;
}

function sort_order(): ?int
{
    $v = input_trim('sortOrder', 10);
    if ($v === '') {
        return 0;
    }
    return ctype_digit($v) && (int) $v <= 999 ? (int) $v : null;
}

function admin_project_edit(array $user, string $id): void
{
    require_user(EDITORS);
    $project = $id === 'new' ? null : row('SELECT * FROM `Project` WHERE id = ?', [$id]);
    if ($id !== 'new' && !$project) {
        not_found();
    }
    if (is_post() && input('action', 20) === 'delete' && $project) {
        q('DELETE FROM `Project` WHERE id = ?', [$project['id']]);
        redirect('/admin/projects?deleted=1');
    }
    $error = null;
    $old = [];
    if (is_post()) {
        $old = array_map(fn ($v) => is_string($v) ? $v : '', $_POST);
        $name = input_trim('name', 240);
        $tagline = input_trim('tagline', 400);
        $description = input_trim('description', 10000);
        $url = input_trim('url', 600);
        $logo = input_trim('logo', 400);
        $slug = slugify(input_trim('slug', 191) ?: $name);
        $order = sort_order();
        if (mb_strlen($name) < 2 || mb_strlen($name) > 120) {
            $error = 'Project name must be 2–120 characters.';
        } elseif (mb_strlen($tagline) < 3 || mb_strlen($tagline) > 200) {
            $error = 'Add a short tagline.';
        } elseif (mb_strlen($description) < 20) {
            $error = 'Description is too short.';
        } elseif (mb_strlen($description) > 5000) {
            $error = 'Description is too long (5,000 characters max).';
        } elseif (!url_ok($url) || mb_strlen($url) > 300) {
            $error = 'Enter a full web address starting with https://';
        } elseif (!image_path_ok($logo)) {
            $error = 'Logo must be an uploaded image.';
        } elseif ($order === null) {
            $error = 'Display order must be a number from 0 to 999.';
        } elseif (val('SELECT id FROM `Project` WHERE slug = ? AND id <> ?', [$slug, $project['id'] ?? ''])) {
            $error = "Another project already uses the address “{$slug}”.";
        } else {
            $data = [
                'name' => $name,
                'slug' => $slug,
                'client' => mb_substr(input_trim('client', 160), 0, 160) ?: null,
                'tagline' => $tagline,
                'description' => $description,
                'url' => safe_url($url),
                'logo' => $logo ?: null,
                'sector' => mb_substr(input_trim('sector', 80), 0, 80) ?: null,
                'highlights' => mb_substr(implode("\n", lines(input('highlights', 3000))), 0, 3000),
                'sortOrder' => $order,
                'published' => checked('published'),
                'isProduct' => checked('isProduct'),
                'updatedAt' => now_utc(),
            ];
            if ($project) {
                db_update('Project', $data, $project['id']);
            } else {
                db_insert('Project', $data + ['id' => new_id(), 'createdAt' => now_utc()]);
            }
            redirect('/admin/projects?saved=1');
        }
    }
    $p = $project;
    $form = '<form method="post" data-pending-form class="max-w-3xl space-y-5 rounded-xl border border-navy-100 bg-white p-6">' . csrf_field() . form_message($error)
        . '<div class="grid gap-5 sm:grid-cols-2">'
        . field('Project name', text_input('name', old($old, $p, 'name'), ['required' => true, 'maxlength' => '120']))
        . field('Client', text_input('client', old($old, $p, 'client')), 'Optional — leave empty for Britech’s own platforms.')
        . '</div>'
        . field('Tagline', text_input('tagline', old($old, $p, 'tagline'), ['required' => true, 'maxlength' => '200', 'placeholder' => 'e.g. Poultry health monitoring system']))
        . field('Description', textarea('description', old($old, $p, 'description'), 5, ['required' => true]))
        . field('Highlights', textarea('highlights', old($old, $p, 'highlights'), 4), 'One per line (features, outcomes).')
        . '<div class="grid gap-5 sm:grid-cols-2">'
        . field('Website', text_input('url', old($old, $p, 'url'), ['placeholder' => 'https://']))
        . field('Sector', text_input('sector', old($old, $p, 'sector'), ['placeholder' => 'e.g. Agriculture']))
        . '</div>'
        . field('Web address', text_input('slug', old($old, $p, 'slug')), 'Used for links like /our-work#address. Leave empty to create it from the name.')
        . image_field('logo', 'Logo', old($old, $p, 'logo'), 'PNG with transparent background works best.')
        . '<div class="grid gap-5 sm:grid-cols-2">'
        . field('Display order', text_input('sortOrder', (string) old($old, $p, 'sortOrder', 0), ['type' => 'number', 'min' => '0', 'max' => '999']), 'Lower numbers show first.')
        . '<div class="self-end pb-3">' . checkbox('published', old_checked($old, $p, 'published', true), 'Show on website') . '</div>'
        . '</div>'
        . '<label class="flex items-start gap-2 rounded-lg bg-navy-50/70 p-3 text-sm text-navy-700"><input type="checkbox" name="isProduct"' . (old_checked($old, $p, 'isProduct', false) ? ' checked' : '') . ' class="mt-0.5 h-4 w-4 accent-mint-600">'
        . '<span><span class="font-medium text-navy-900">Show as a Britech product</span><span class="block text-xs text-navy-500">Lists it on the Products page and the home page product tabs. Leave off for client work.</span></span></label>'
        . submit_button('Save project') . '</form>';

    $del = $project ? '<form method="post">' . csrf_field() . '<input type="hidden" name="action" value="delete">' . confirm_submit('Delete ' . $project['name'] . '?', icon('Trash2', 'h-4 w-4') . ' Delete') . '</form>' : '';
    admin_page($project ? 'Edit project' : 'Add project', page_title($project ? 'Edit ' . $project['name'] : 'Add project', '', $del) . $form, $user);
}

/* ================================== partners ================================= */

const PARTNER_KINDS = ['PARTNER' => 'Partner', 'CLIENT' => 'Client', 'BOTH' => 'Client & partner'];

function admin_partners(array $user): void
{
    require_user(EDITORS);
    $q = qs('q');
    $kind = array_key_exists(qs('kind'), PARTNER_KINDS) ? qs('kind') : null;
    $show = qs('show') === 'hidden' ? 'hidden' : null;
    $page = parse_page();
    $size = 40;
    $where = '1=1';
    $params = [];
    if ($q !== '') {
        $where .= ' AND name LIKE :q';
        $params['q'] = like($q);
    }
    if ($kind) {
        $where .= ' AND kind = :kind';
        $params['kind'] = $kind;
    }
    if ($show) {
        $where .= ' AND active = 0';
    }
    $total = (int) val("SELECT COUNT(*) FROM `Partner` WHERE {$where}", $params);
    $offset = ($page - 1) * $size;
    $list = rows("SELECT * FROM `Partner` WHERE {$where} ORDER BY sortOrder ASC, name ASC LIMIT {$offset}, {$size}", $params);
    $hidden = (int) val('SELECT COUNT(*) FROM `Partner` WHERE active = 0');

    $h = page_title('Clients & partners', 'Logos shown on the home page (first 15) and the Clients & Partners page.', add_button('/admin/partners/new', 'Add logo'));
    if (isset($_GET['saved'])) {
        $h .= notice('Saved.');
    }
    if (isset($_GET['deleted'])) {
        $h .= notice('Removed.');
    }
    if ($hidden > 0 && !$show) {
        $h .= notice($hidden . ' logo' . ($hidden > 1 ? 's are' : ' is') . ' hidden from the website. <a href="/admin/partners?show=hidden" class="font-semibold underline">Review</a>', 'warn');
    }
    $h .= '<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">'
        . filter_chips('/admin/partners', 'kind', $kind, [['label' => 'All'], ['label' => 'Clients', 'value' => 'CLIENT'], ['label' => 'Partners', 'value' => 'PARTNER'], ['label' => 'Both', 'value' => 'BOTH']], ['q' => $q, 'show' => $show])
        . search_form('/admin/partners', $q, ['kind' => $kind, 'show' => $show], 'Search organizations') . '</div>';
    if (!$list) {
        $h .= empty_state('Nothing matches', '', '/admin/partners');
    } else {
        $h .= '<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">';
        foreach ($list as $p) {
            $active = (int) $p['active'];
            $h .= '<a href="/admin/partners/' . e($p['id']) . '" class="rounded-xl border border-navy-100 bg-white p-4 transition hover:border-mint-300">'
                . '<div class="flex h-14 items-center justify-center"><img src="' . e($p['logo']) . '" alt="" loading="lazy" class="max-h-12 max-w-[140px] object-contain ' . ($active ? '' : 'opacity-40') . '"></div>'
                . '<p class="mt-3 truncate text-sm font-semibold text-navy-900">' . e($p['name']) . '</p>'
                . '<p class="text-xs text-navy-400">' . e(PARTNER_KINDS[$p['kind']]) . ' · ' . ($active ? 'visible' : 'hidden') . ' · #' . (int) $p['sortOrder'] . '</p></a>';
        }
        $h .= '</div>';
    }
    $h .= pagination('/admin/partners', ['q' => $q, 'kind' => $kind, 'show' => $show], $page, page_count($total, $size), $total, $size, 'logos');
    admin_page('Clients & partners', $h, $user);
}

function admin_partner_edit(array $user, string $id): void
{
    require_user(EDITORS);
    $partner = $id === 'new' ? null : row('SELECT * FROM `Partner` WHERE id = ?', [$id]);
    if ($id !== 'new' && !$partner) {
        not_found();
    }
    if (is_post() && input('action', 20) === 'delete' && $partner) {
        q('DELETE FROM `Partner` WHERE id = ?', [$partner['id']]);
        redirect('/admin/partners?deleted=1');
    }
    $error = null;
    $old = [];
    if (is_post()) {
        $old = array_map(fn ($v) => is_string($v) ? $v : '', $_POST);
        $name = input_trim('name', 320);
        $logo = input_trim('logo', 400);
        $url = input_trim('url', 600);
        $kind = input('kind', 20);
        $order = sort_order();
        if (mb_strlen($name) < 2 || mb_strlen($name) > 160) {
            $error = 'Organization name must be 2–160 characters.';
        } elseif ($logo === '') {
            $error = 'Upload a logo.';
        } elseif (!image_path_ok($logo)) {
            $error = 'Logo must be an uploaded image.';
        } elseif (!url_ok($url) || mb_strlen($url) > 300) {
            $error = 'Enter a full web address starting with https://';
        } elseif (!array_key_exists($kind, PARTNER_KINDS)) {
            $error = 'Choose the relationship.';
        } elseif ($order === null) {
            $error = 'Display order must be a number from 0 to 999.';
        } else {
            $data = ['name' => $name, 'logo' => $logo, 'url' => safe_url($url), 'kind' => $kind, 'sortOrder' => $order, 'active' => checked('active'), 'updatedAt' => now_utc()];
            if ($partner) {
                db_update('Partner', $data, $partner['id']);
            } else {
                db_insert('Partner', $data + ['id' => new_id(), 'createdAt' => now_utc()]);
            }
            redirect('/admin/partners?saved=1');
        }
    }
    $p = $partner;
    $form = '<form method="post" data-pending-form class="max-w-2xl space-y-5 rounded-xl border border-navy-100 bg-white p-6">' . csrf_field() . form_message($error)
        . field('Organization name', text_input('name', old($old, $p, 'name'), ['required' => true, 'maxlength' => '160']))
        . image_field('logo', 'Logo', old($old, $p, 'logo'), 'PNG with transparent background works best.')
        . '<div class="grid gap-5 sm:grid-cols-2">'
        . field('Relationship', select('kind', PARTNER_KINDS, old($old, $p, 'kind', 'PARTNER')))
        . field('Website', text_input('url', old($old, $p, 'url'), ['placeholder' => 'https://']), 'Optional')
        . '</div><div class="grid gap-5 sm:grid-cols-2">'
        . field('Display order', text_input('sortOrder', (string) old($old, $p, 'sortOrder', 0), ['type' => 'number', 'min' => '0', 'max' => '999']))
        . '<div class="self-end pb-3">' . checkbox('active', old_checked($old, $p, 'active', true), 'Show on website') . '</div>'
        . '</div>' . submit_button('Save') . '</form>';
    $del = $partner ? '<form method="post">' . csrf_field() . '<input type="hidden" name="action" value="delete">' . confirm_submit('Remove ' . $partner['name'] . '?', icon('Trash2', 'h-4 w-4') . ' Delete') . '</form>' : '';
    admin_page($partner ? 'Edit logo' : 'Add logo', page_title($partner ? 'Edit ' . $partner['name'] : 'Add client or partner', '', $del) . $form, $user);
}

/* ================================ testimonials =============================== */

function admin_testimonials(array $user): void
{
    require_user(EDITORS);
    $q = qs('q');
    $page = parse_page();
    $size = 20;
    $where = '1=1';
    $params = [];
    if ($q !== '') {
        $where = '(name LIKE :q1 OR organization LIKE :q2 OR quote LIKE :q3)';
        $params = ['q1' => like($q), 'q2' => like($q), 'q3' => like($q)];
    }
    $total = (int) val("SELECT COUNT(*) FROM `Testimonial` WHERE {$where}", $params);
    $offset = ($page - 1) * $size;
    $list = rows("SELECT * FROM `Testimonial` WHERE {$where} ORDER BY sortOrder ASC, createdAt DESC LIMIT {$offset}, {$size}", $params);

    $h = page_title('Testimonials', 'Client quotes on the home page. The section stays hidden until at least one is visible.', add_button('/admin/testimonials/new', 'Add testimonial'));
    if (isset($_GET['saved'])) {
        $h .= notice('Saved.');
    }
    if (isset($_GET['deleted'])) {
        $h .= notice('Deleted.');
    }
    $h .= '<div class="mb-4 flex justify-end">' . search_form('/admin/testimonials', $q, [], 'Search testimonials') . '</div>';
    if (!$list) {
        $h .= empty_state($q !== '' ? 'No testimonials match' : 'No testimonials yet', $q !== '' ? '' : 'Ask a happy client for a short quote and add it here.', $q !== '' ? '/admin/testimonials' : '');
    } else {
        $h .= '<div class="grid gap-4 md:grid-cols-2">';
        foreach ($list as $t) {
            $h .= '<a href="/admin/testimonials/' . e($t['id']) . '" class="rounded-xl border border-navy-100 bg-white p-5 transition hover:border-mint-300">' . icon('Quote', 'h-5 w-5 text-mint-500')
                . '<p class="mt-2 line-clamp-3 text-navy-700">' . e($t['quote']) . '</p><p class="mt-3 text-sm font-semibold text-navy-900">' . e($t['name']) . '</p>'
                . '<p class="text-xs text-navy-400">' . e(implode(', ', array_filter([$t['role'], $t['organization']]))) . ' · ' . ((int) $t['active'] ? 'visible' : 'hidden') . '</p></a>';
        }
        $h .= '</div>';
    }
    $h .= pagination('/admin/testimonials', ['q' => $q], $page, page_count($total, $size), $total, $size, 'testimonials');
    admin_page('Testimonials', $h, $user);
}

function admin_testimonial_edit(array $user, string $id): void
{
    require_user(EDITORS);
    $t = $id === 'new' ? null : row('SELECT * FROM `Testimonial` WHERE id = ?', [$id]);
    if ($id !== 'new' && !$t) {
        not_found();
    }
    if (is_post() && input('action', 20) === 'delete' && $t) {
        q('DELETE FROM `Testimonial` WHERE id = ?', [$t['id']]);
        redirect('/admin/testimonials?deleted=1');
    }
    $error = null;
    $old = [];
    if (is_post()) {
        $old = array_map(fn ($v) => is_string($v) ? $v : '', $_POST);
        $quote = input_trim('quote', 1200);
        $name = input_trim('name', 240);
        $photo = input_trim('photo', 400);
        $order = sort_order();
        if (mb_strlen($quote) < 10) {
            $error = 'The quote is too short.';
        } elseif (mb_strlen($quote) > 600) {
            $error = 'Keep quotes under 600 characters.';
        } elseif (mb_strlen($name) < 2 || mb_strlen($name) > 120) {
            $error = 'Enter the person’s name.';
        } elseif (!image_path_ok($photo)) {
            $error = 'Photo must be an uploaded image.';
        } elseif ($order === null) {
            $error = 'Display order must be a number from 0 to 999.';
        } else {
            $data = [
                'quote' => $quote,
                'name' => $name,
                'role' => mb_substr(input_trim('role', 160), 0, 160) ?: null,
                'organization' => mb_substr(input_trim('organization', 160), 0, 160) ?: null,
                'photo' => $photo ?: null,
                'sortOrder' => $order,
                'active' => checked('active'),
                'updatedAt' => now_utc(),
            ];
            if ($t) {
                db_update('Testimonial', $data, $t['id']);
            } else {
                db_insert('Testimonial', $data + ['id' => new_id(), 'createdAt' => now_utc()]);
            }
            redirect('/admin/testimonials?saved=1');
        }
    }
    $form = '<form method="post" data-pending-form class="max-w-2xl space-y-5 rounded-xl border border-navy-100 bg-white p-6">' . csrf_field()
        . '<p class="rounded-lg bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">Only publish real quotes, with the person’s permission.</p>' . form_message($error)
        . field('Quote', textarea('quote', old($old, $t, 'quote'), 4, ['required' => true, 'maxlength' => '600']), 'Their words, 1–3 sentences. Max 600 characters.')
        . '<div class="grid gap-5 sm:grid-cols-2">'
        . field('Name', text_input('name', old($old, $t, 'name'), ['required' => true]))
        . field('Role / title', text_input('role', old($old, $t, 'role'), ['placeholder' => 'e.g. Programme Manager']))
        . '</div>'
        . field('Organization', text_input('organization', old($old, $t, 'organization')))
        . image_field('photo', 'Photo (optional)', old($old, $t, 'photo'), 'Square headshot works best.')
        . '<div class="grid gap-5 sm:grid-cols-2">'
        . field('Display order', text_input('sortOrder', (string) old($old, $t, 'sortOrder', 0), ['type' => 'number', 'min' => '0', 'max' => '999']))
        . '<div class="self-end pb-3">' . checkbox('active', old_checked($old, $t, 'active', true), 'Show on website') . '</div>'
        . '</div>' . submit_button('Save testimonial') . '</form>';
    $del = $t ? '<form method="post">' . csrf_field() . '<input type="hidden" name="action" value="delete">' . confirm_submit('Delete this testimonial?', icon('Trash2', 'h-4 w-4') . ' Delete') . '</form>' : '';
    admin_page($t ? 'Edit testimonial' : 'Add testimonial', page_title($t ? 'Edit testimonial' : 'Add testimonial', '', $del) . $form, $user);
}

/* ==================================== users ================================== */

const ROLES = ['AUTHOR' => 'Author', 'EDITOR' => 'Editor', 'ADMIN' => 'Admin'];

function admin_users(array $me): void
{
    require_user(['ADMIN']);
    $msg = ['create' => [null, null, null]];
    $rowMsg = [];
    if (is_post()) {
        $action = input('action', 20);
        $id = input('id', 64);
        if ($action === 'create') {
            $msg['create'] = create_user();
        } elseif ($action === 'update') {
            $rowMsg[$id] = update_user($me, $id);
        } elseif ($action === 'reset') {
            $rowMsg[$id] = reset_user_password($id);
        }
    }

    $q = qs('q');
    $page = parse_page();
    $size = 25;
    $where = '1=1';
    $params = [];
    if ($q !== '') {
        $where = '(name LIKE :q1 OR email LIKE :q2)';
        $params = ['q1' => like($q), 'q2' => like($q)];
    }
    $total = (int) val("SELECT COUNT(*) FROM `User` WHERE {$where}", $params);
    $offset = ($page - 1) * $size;
    $users = rows("SELECT id, name, email, role, active FROM `User` WHERE {$where} ORDER BY active DESC, name ASC LIMIT {$offset}, {$size}", $params);

    [$cErr, $cOk, $cSecret] = $msg['create'];
    $createOld = $cErr ? $_POST : [];
    $h = '<div class="space-y-6">' . page_title('Team accounts', 'Authors write posts, editors publish and manage content, admins manage everything.');
    $h .= '<form method="post" data-pending-form class="space-y-4 rounded-xl border border-navy-100 bg-white p-6">' . csrf_field() . '<input type="hidden" name="action" value="create">'
        . '<h2 class="font-semibold text-navy-900">Add a team member</h2>' . form_message($cErr, $cOk, $cSecret)
        . '<div class="grid gap-4 sm:grid-cols-3">'
        . field('Name', text_input('name', $createOld['name'] ?? '', ['required' => true]))
        . field('Email', text_input('email', $createOld['email'] ?? '', ['type' => 'email', 'required' => true]))
        . field('Role', select('role', ['AUTHOR' => 'Author — writes own posts', 'EDITOR' => 'Editor — publishes & manages content', 'ADMIN' => 'Admin — full access'], $createOld['role'] ?? 'AUTHOR'))
        . '</div>' . submit_button('Create account') . '</form>';
    $h .= '<div class="flex justify-end">' . search_form('/admin/users', $q, [], 'Search name or email') . '</div>';

    if (!$users) {
        $h .= empty_state('No accounts match', '', '/admin/users');
    } else {
        $h .= '<div class="space-y-3">';
        foreach ($users as $u) {
            $isMe = $u['id'] === $me['id'];
            $h .= '<div class="rounded-xl border border-navy-100 bg-white p-5"><div class="flex flex-wrap items-center gap-4">'
                . '<div class="min-w-0 flex-1"><p class="font-semibold text-navy-900">' . e($u['name']) . ($isMe ? ' <span class="text-xs font-normal text-navy-400">(you)</span>' : '') . '</p>'
                . '<p class="truncate text-sm text-navy-500">' . e($u['email']) . '</p></div>'
                . '<form method="post" class="flex flex-wrap items-center gap-3">' . csrf_field() . '<input type="hidden" name="action" value="update"><input type="hidden" name="id" value="' . e($u['id']) . '">'
                . select('role', ROLES, $u['role'], 'w-auto py-2', $isMe)
                . checkbox('active', (bool) (int) $u['active'], 'Active', $isMe)
                . ($isMe ? '' : submit_button('Save', 'secondary')) . '</form>';
            if (!$isMe) {
                $h .= '<form method="post" data-confirm-form="' . e('Reset the password for ' . $u['email'] . '? They will be signed out.') . '">' . csrf_field()
                    . '<input type="hidden" name="action" value="reset"><input type="hidden" name="id" value="' . e($u['id']) . '">' . submit_button('Reset password', 'danger') . '</form>';
            }
            $h .= '</div>';
            if (isset($rowMsg[$u['id']])) {
                $h .= '<div class="mt-3 space-y-2">' . form_message(...$rowMsg[$u['id']]) . '</div>';
            }
            $h .= '</div>';
        }
        $h .= '</div>';
    }
    $h .= pagination('/admin/users', ['q' => $q], $page, page_count($total, $size), $total, $size, 'accounts') . '</div>';
    admin_page('Team accounts', $h, $me);
}

/** @return array{0:?string,1:?string,2:?string} [error, ok, secret] */
function create_user(): array
{
    $name = input_trim('name', 240);
    $email = mb_strtolower(input_trim('email', 400));
    $role = input('role', 20);
    if (mb_strlen($name) < 2 || mb_strlen($name) > 120) {
        return ['Enter a name.', null, null];
    }
    if (!is_email($email) || mb_strlen($email) > 191) {
        return ['Enter a valid email.', null, null];
    }
    if (!array_key_exists($role, ROLES)) {
        return ['Choose a role.', null, null];
    }
    if (val('SELECT id FROM `User` WHERE email = ?', [$email])) {
        return ['That email already has an account.', null, null];
    }
    $password = temp_password();
    db_insert('User', ['id' => new_id(), 'name' => $name, 'email' => $email, 'role' => $role, 'passwordHash' => hash_password($password), 'active' => true, 'createdAt' => now_utc(), 'updatedAt' => now_utc()]);
    return [null, "Account created for {$email}. Share this temporary password securely — it won’t be shown again:", $password];
}

function update_user(array $me, string $id): array
{
    $role = input('role', 20);
    $active = checked('active');
    if ($id === $me['id']) {
        return ['You can’t remove your own admin access.', null, null];
    }
    if (!array_key_exists($role, ROLES) || !val('SELECT id FROM `User` WHERE id = ?', [$id])) {
        return ['User not found.', null, null];
    }
    q('UPDATE `User` SET role = ?, active = ?, updatedAt = ? WHERE id = ?', [$role, $active, now_utc(), $id]);
    if (!$active) {
        q('DELETE FROM `Session` WHERE userId = ?', [$id]);
    }
    return [null, 'User updated.', null];
}

function reset_user_password(string $id): array
{
    $u = row('SELECT email FROM `User` WHERE id = ?', [$id]);
    if (!$u) {
        return ['User not found.', null, null];
    }
    $password = temp_password();
    q('UPDATE `User` SET passwordHash = ?, updatedAt = ? WHERE id = ?', [hash_password($password), now_utc(), $id]);
    q('DELETE FROM `Session` WHERE userId = ?', [$id]);
    return [null, "New temporary password for {$u['email']} (shown once):", $password];
}

/* =================================== settings ================================ */

function admin_settings(array $user): void
{
    require_user(['ADMIN']);
    $msgs = ['settings' => [null, null], 'smtp' => [null, null], 'test' => [null, null]];
    $form = is_post() ? input('form', 20) : '';
    if ($form === 'settings') {
        $msgs['settings'] = save_settings();
    } elseif ($form === 'smtp') {
        $msgs['smtp'] = save_smtp();
    } elseif ($form === 'test') {
        $to = input_trim('to', 191) ?: $user['email'];
        if (!is_email($to)) {
            $msgs['test'] = ['Enter a valid email address.', null];
        } else {
            try {
                send_test_email($to);
                $msgs['test'] = [null, "Test email sent to {$to}. Check the inbox (and spam folder)."];
            } catch (Throwable $e) {
                $msgs['test'] = ['Couldn’t send: ' . mail_error($e), null];
            }
        }
    }
    $values = settings();
    if ($form === 'settings' && $msgs['settings'][0]) {
        foreach (SETTING_KEYS as $k) {
            $values[$k] = input($k, 300);
        }
    }
    $smtp = smtp_config();
    $h = page_title('Site settings', 'Contact details and social links used across the website.')
        . render('admin/settings', compact('values', 'smtp', 'msgs', 'user', 'form'));
    admin_page('Site settings', $h, $user);
}

function save_settings(): array
{
    $values = [];
    $social = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'];
    foreach (SETTING_KEYS as $key) {
        $v = mb_substr(input_trim($key, 600), 0, 300);
        if (in_array($key, $social, true) && $v !== '' && !str_starts_with((string) safe_url($v), 'http')) {
            return ["The {$key} link must be a full address starting with https://", null];
        }
        if ($key === 'email' && $v !== '' && !is_email($v)) {
            return ['Enter a valid email address.', null];
        }
        if ($key === 'whatsapp' && $v !== '' && !preg_match('/^\+?[\d\s]{9,20}$/', $v)) {
            return ['WhatsApp number must be digits, e.g. +255 795 005 903', null];
        }
        if ($key === 'announcement_link' && $v !== '' && !safe_url($v)) {
            return ['Announcement link must start with / or https://', null];
        }
        $values[$key] = $v;
    }
    db()->beginTransaction();
    foreach ($values as $k => $v) {
        set_setting($k, $v);
    }
    db()->commit();
    return [null, 'Settings saved.'];
}

function save_smtp(): array
{
    $host = input_trim('smtp_host', 200);
    $port = input_trim('smtp_port', 6);
    $secure = input('smtp_secure', 6);
    $userName = input_trim('smtp_user', 200);
    $pass = input('smtp_pass', 500);
    $from = input_trim('smtp_from', 200);
    $notify = input_trim('notify_to', 500);

    if (!preg_match('/^[a-zA-Z0-9.-]*$/', $host)) {
        return ['Enter a valid SMTP host, e.g. mail.britechsolutions.co.tz', null];
    }
    if (!ctype_digit($port) || (int) $port < 1 || (int) $port > 65535) {
        return ['Enter a valid port number.', null];
    }
    if (!in_array($secure, ['true', 'false'], true)) {
        return ['Choose the security type.', null];
    }
    foreach (email_list($notify) as $addr) {
        if (!is_email($addr)) {
            return ['Notification recipients must be valid emails, separated by commas.', null];
        }
    }
    if ($host !== '' && $from === '') {
        return ['Add a “From” address, e.g. Britech Website <noreply@britechsolutions.co.tz>', null];
    }
    if ($from !== '' && !is_email(parse_address($from)[0])) {
        return ['The “From” address must contain a valid email.', null];
    }
    if ($host !== '' && $notify === '') {
        return ['Add at least one email address to notify.', null];
    }
    $values = ['smtp_host' => $host, 'smtp_port' => (string) (int) $port, 'smtp_secure' => $secure, 'smtp_user' => $userName, 'smtp_from' => $from, 'notify_to' => $notify];
    // Password is write-only: blank keeps the saved one; "clear" box removes it.
    if (checked('smtp_pass_clear')) {
        $values['smtp_pass'] = '';
    } elseif ($pass !== '') {
        $values['smtp_pass'] = encrypt_secret($pass);
    }
    db()->beginTransaction();
    foreach ($values as $k => $v) {
        set_setting($k, $v);
    }
    db()->commit();
    return [null, 'Email settings saved. Send a test email to check them.'];
}

/* =================================== account ================================= */

function admin_account(array $user): void
{
    $profile = [null, null];
    $password = [null, null];
    if (is_post()) {
        if (input('form', 20) === 'profile') {
            $name = input_trim('name', 240);
            if (mb_strlen($name) < 2 || mb_strlen($name) > 120) {
                $profile = ['Name must be 2–120 characters.', null];
            } else {
                q('UPDATE `User` SET name = ?, updatedAt = ? WHERE id = ?', [$name, now_utc(), $user['id']]);
                $user['name'] = $name;
                $profile = [null, 'Profile updated.'];
            }
        } else {
            $row = row('SELECT passwordHash FROM `User` WHERE id = ?', [$user['id']]);
            $next = input('next', 200);
            $problem = password_problem($next);
            if (!verify_password(input('current', 200), $row['passwordHash'])) {
                $password = ['Your current password is incorrect.', null];
            } elseif ($next !== input('confirm', 200)) {
                $password = ['The new passwords don’t match.', null];
            } elseif ($problem) {
                $password = [$problem, null];
            } else {
                q('UPDATE `User` SET passwordHash = ?, updatedAt = ? WHERE id = ?', [hash_password($next), now_utc(), $user['id']]);
                // Sign out every session (including this one), then sign back in fresh.
                q('DELETE FROM `Session` WHERE userId = ?', [$user['id']]);
                create_session($user['id']);
                $password = [null, 'Password changed. Other devices have been signed out.'];
            }
        }
    }
    $logout = '<form method="post" action="/admin/logout">' . csrf_field() . '<button class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy-600 ring-1 ring-navy-200 hover:bg-white">' . icon('LogOut', 'h-4 w-4') . ' Sign out</button></form>';
    $pw = fn (string $name, string $label, string $ac, string $hint = '') => field($label, '<input name="' . $name . '" type="password" autocomplete="' . $ac . '" required' . ($name !== 'current' ? ' minlength="10"' : '') . ' class="' . INPUT_CLS . '">', $hint);
    $h = '<div class="max-w-2xl space-y-6">' . page_title('My account', $user['email'] . ' · ' . strtolower($user['role']), $logout)
        . '<form method="post" data-pending-form class="space-y-4 rounded-xl border border-navy-100 bg-white p-6">' . csrf_field() . '<input type="hidden" name="form" value="profile">'
        . '<h2 class="font-semibold text-navy-900">Profile</h2>' . form_message(...$profile)
        . field('Display name', text_input('name', $user['name'], ['required' => true]), 'Shown as the author on your blog posts.')
        . submit_button('Save') . '</form>'
        . '<form method="post" data-pending-form class="space-y-4 rounded-xl border border-navy-100 bg-white p-6">' . csrf_field() . '<input type="hidden" name="form" value="password">'
        . '<h2 class="font-semibold text-navy-900">Change password</h2>' . form_message(...$password)
        . $pw('current', 'Current password', 'current-password')
        . $pw('next', 'New password', 'new-password', 'At least 10 characters, with letters and numbers.')
        . $pw('confirm', 'Confirm new password', 'new-password')
        . submit_button('Change password') . '</form></div>';
    admin_page('My account', $h, $user);
}
