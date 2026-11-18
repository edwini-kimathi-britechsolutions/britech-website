<?php
defined('BRITECH') || exit;

/** Renders a public page inside the site layout. */
function site_page(string $view, array $vars = [], array $meta = []): void
{
    $content = render('site/' . $view, $vars);
    echo render('site/layout', ['content' => $content, 'meta' => $meta]);
}

/** @return bool true if the path was handled */
function route_site(string $path): bool
{
    if ($path === '/') {
        $preview = partner_preview(15);
        site_page('home', [
            'partners' => $preview['partners'],
            'partnerTotal' => $preview['total'],
            'products' => products(1, 12)['products'],
            'testimonials' => testimonials(6),
            'posts' => latest_posts(3),
        ]);
        return true;
    }

    if ($path === '/about') {
        site_page('about', [], ['title' => 'About Britech', 'description' => 'Britech Solutions Limited is a Tanzania-based multidisciplinary professional services and technology company: engineering, digital transformation and business consultancy.']);
        return true;
    }

    if ($path === '/solutions') {
        site_page('solutions', [], ['title' => 'Solutions', 'description' => 'Engineering consultancy, digital transformation and technology, and business and management consultancy from Britech Solutions.']);
        return true;
    }
    if (preg_match('#^/solutions/([a-z0-9-]+)$#', $path, $m)) {
        $s = find_by_slug(data('services'), $m[1]);
        if (!$s) {
            not_found();
        }
        site_page('solution', ['service' => $s], ['title' => $s['title'], 'description' => $s['short']]);
        return true;
    }

    if ($path === '/industries') {
        site_page('industries', [], ['title' => 'Industries', 'description' => 'Sectors Britech Solutions supports with engineering, technology and business consultancy, from hospitality and real estate to government, finance and natural resources.']);
        return true;
    }
    if (preg_match('#^/industries/([a-z0-9-]+)$#', $path, $m)) {
        $ind = find_by_slug(data('industries'), $m[1]);
        if (!$ind) {
            not_found();
        }
        site_page('industry', ['industry' => $ind], ['title' => $ind['title'], 'description' => $ind['short']]);
        return true;
    }

    if ($path === '/products') {
        $page = parse_page();
        $r = products($page);
        site_page('products', $r + ['page' => $page], ['title' => 'Products', 'description' => 'Platforms built and run by Britech Solutions, including RASIFlow, Resulynx, Trans-iT and Njiwa.']);
        return true;
    }

    if ($path === '/our-work') {
        $q = qs('q');
        $page = parse_page();
        $sectors = project_sectors();
        $sector = qs('sector', 80);
        $sector = in_array($sector, array_column($sectors, 'name'), true) ? $sector : null;
        $r = projects_page($q ?: null, $sector, $page);
        site_page('our-work', $r + compact('q', 'page', 'sector', 'sectors'), ['title' => 'Our Work', 'description' => 'Client projects designed and delivered by Britech Solutions.']);
        return true;
    }

    if ($path === '/clients') {
        $q = qs('q');
        $page = parse_page();
        $t = qs('type');
        $kind = $t === 'clients' ? 'CLIENT' : ($t === 'partners' ? 'PARTNER' : null);
        $type = $kind ? $t : null;
        $r = partners_page($q ?: null, $kind, $page);
        site_page('clients', $r + compact('q', 'page', 'type'), ['title' => 'Clients & Partners', 'description' => 'Organizations across Tanzania and East Africa that work with Britech Solutions.']);
        return true;
    }

    if ($path === '/blog') {
        $q = qs('q');
        $page = parse_page();
        $categories = post_categories();
        $category = qs('category', 60);
        $category = in_array($category, array_column($categories, 'name'), true) ? $category : null;
        $r = published_posts($category, $q ?: null, $page);
        site_page('blog', $r + compact('q', 'page', 'category', 'categories'), ['title' => 'Blog', 'description' => 'News, insights and practical guidance on software, data, AI and cybersecurity from the Britech Solutions team.']);
        return true;
    }
    if (preg_match('#^/blog/([a-z0-9-]+)$#', $path, $m)) {
        $post = post_by_slug($m[1]);
        if (!$post) {
            not_found();
        }
        site_page('post', ['post' => $post, 'related' => related_posts($post['category'], $post['id'])], [
            'title' => $post['title'],
            'description' => $post['excerpt'],
            'og' => [
                'type' => 'article',
                'title' => $post['title'],
                'description' => $post['excerpt'],
                'publishedTime' => iso_date($post['publishedAt']),
                'image' => $post['coverImage'] ?: '/images/og.png',
            ],
        ]);
        return true;
    }

    if ($path === '/contact') {
        contact_page();
        return true;
    }

    if ($path === '/sitemap.xml') {
        sitemap();
        return true;
    }
    if ($path === '/robots.txt') {
        header('Content-Type: text/plain; charset=utf-8');
        echo "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nHost: " . site_url() . "\nSitemap: " . site_url() . "/sitemap.xml\n";
        return true;
    }
    if ($path === '/api/health') {
        try {
            val('SELECT 1');
            json_response(['ok' => true, 'db' => 'up']);
        } catch (Throwable $e) {
            json_response(['ok' => false, 'db' => 'down'], 503);
        }
    }
    if (preg_match('#^/media/([^/]+)$#', $path, $m)) {
        serve_media($m[1]);
    }
    return false;
}

/* --------------------------------- contact ---------------------------------- */

const INQUIRY_WINDOW = 3600;
const INQUIRY_MAX_PER_HOUR = 5;
const INQUIRY_MIN_FILL_SECONDS = 3;

function contact_page(): void
{
    $meta = ['title' => 'Contact', 'description' => 'Get in touch with Britech Solutions in Arusha, Tanzania.'];
    $error = null;
    $old = [];

    if (is_post()) {
        $old = array_map(fn ($v) => is_string($v) ? $v : '', $_POST);
        $error = submit_inquiry();
        if ($error === null) {
            redirect('/contact?sent=1#form');
        }
    } else {
        // Pre-fill from links like /contact?service=Product%20demo&message=…
        $service = qs('service', 80);
        $old['service'] = in_array($service, data('inquiryServices'), true) ? $service : '';
        $old['message'] = qs('message', 300);
    }

    site_page('contact', ['sent' => isset($_GET['sent']) && !is_post(), 'error' => $error, 'old' => $old], $meta);
}

/** Validates and saves a contact-form message. Returns an error message, or null on success. */
function submit_inquiry(): ?string
{
    // Spam traps: a hidden field humans never fill, and a minimum time on the form.
    if (input('website') !== '') {
        return null;
    }
    $age = form_token_age(input('t', 200));
    if ($age === null || $age > 86400) {
        return 'This form has expired. Please send it again.';
    }
    if ($age < INQUIRY_MIN_FILL_SECONDS) {
        return 'Please take a moment to complete the form, then send it again.';
    }

    $d = [
        'firstName' => input_trim('firstName', 200),
        'lastName' => input_trim('lastName', 200),
        'company' => input_trim('company', 400),
        'email' => mb_strtolower(input_trim('email', 400)),
        'phone' => input_trim('phone', 100),
        'service' => input_trim('service', 200),
        'message' => input_trim('message', 6000),
    ];
    if ($d['firstName'] === '' || mb_strlen($d['firstName']) > 80) {
        return 'Enter your first name.';
    }
    if ($d['lastName'] === '' || mb_strlen($d['lastName']) > 80) {
        return 'Enter your last name.';
    }
    if (mb_strlen($d['company']) > 160) {
        return 'Company name is too long.';
    }
    if (!is_email($d['email']) || mb_strlen($d['email']) > 191) {
        return 'Enter a valid email address.';
    }
    if (mb_strlen($d['phone']) > 40 || !preg_match('/^[+\d\s()-]*$/', $d['phone'])) {
        return 'Phone number can only contain digits, spaces, +, ( ) and -.';
    }
    if (!in_array($d['service'], data('inquiryServices'), true)) {
        return 'Choose how we can help.';
    }
    if (mb_strlen($d['message']) < 10) {
        return 'Please write a little more about your project.';
    }
    if (mb_strlen($d['message']) > 5000) {
        return 'Your message is too long (5,000 characters max).';
    }

    $ip = client_ip();
    $key = "inq:{$ip}";
    if (attempts_since($key, INQUIRY_WINDOW) >= INQUIRY_MAX_PER_HOUR) {
        return 'You’ve sent several messages already. Please email or call us instead.';
    }
    record_attempt($key);

    $inquiry = $d + [
        'id' => new_id(),
        'status' => 'NEW',
        'ip' => $ip,
        'createdAt' => now_utc(),
    ];
    $inquiry['company'] = $d['company'] ?: null;
    $inquiry['phone'] = $d['phone'] ?: null;
    db_insert('Inquiry', $inquiry);

    // Email the team. A mail failure never loses the inquiry — it is saved and shown in the admin.
    try {
        send_inquiry_notification($inquiry, site_url() . '/admin/inquiries/' . $inquiry['id']);
        q('UPDATE `Inquiry` SET emailedAt = ? WHERE id = ?', [now_utc(), $inquiry['id']]);
    } catch (Throwable $e) {
        error_log('Inquiry email failed: ' . $e->getMessage());
        q('UPDATE `Inquiry` SET emailError = ? WHERE id = ?', [mb_substr(mail_error($e), 0, 500), $inquiry['id']]);
    }
    return null;
}

/* --------------------------------- sitemap ---------------------------------- */

function sitemap(): void
{
    $now = gmdate('Y-m-d\TH:i:s\Z');
    $urls = [];
    $add = function (string $path, float $priority, string $freq = 'monthly', ?string $lastmod = null) use (&$urls, $now) {
        $urls[] = ['loc' => site_url() . $path, 'lastmod' => $lastmod ?? $now, 'freq' => $freq, 'priority' => $priority];
    };
    $add('', 1, 'weekly');
    $add('/about', 0.8);
    $add('/solutions', 0.9);
    $add('/industries', 0.8);
    $add('/products', 0.9);
    $add('/our-work', 0.8);
    $add('/clients', 0.7);
    $add('/blog', 0.8, 'weekly');
    $add('/contact', 0.8);
    foreach (data('services') as $s) {
        $add('/solutions/' . $s['slug'], 0.8);
    }
    foreach (data('industries') as $i) {
        $add('/industries/' . $i['slug'], 0.7);
    }
    try {
        foreach (rows("SELECT slug, updatedAt FROM `Post` WHERE status = 'PUBLISHED' ORDER BY publishedAt DESC LIMIT 5000") as $p) {
            $add('/blog/' . $p['slug'], 0.6, 'monthly', dt($p['updatedAt'])->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s\Z'));
        }
    } catch (Throwable $e) {
        // skip posts if the database is unavailable
    }

    header('Content-Type: application/xml; charset=utf-8');
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    foreach ($urls as $u) {
        echo '<url><loc>' . e($u['loc']) . '</loc><lastmod>' . $u['lastmod'] . '</lastmod><changefreq>' . $u['freq'] . '</changefreq><priority>' . $u['priority'] . "</priority></url>\n";
    }
    echo '</urlset>';
}
