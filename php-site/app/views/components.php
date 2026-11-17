<?php
defined('BRITECH') || exit;

/*
 * Shared UI pieces — ported one-to-one from the React components (ui.tsx, site-cards.tsx,
 * listing.tsx, ProductPanel.tsx, CTA.tsx), with the same Tailwind classes.
 */

const CONTAINER = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

function eyebrow(string $text): string
{
    return '<span class="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-navy-500"><span class="h-px w-8 bg-navy-300"></span>' . e($text) . '</span>';
}

/** $titleHtml is trusted HTML (code-defined). */
function section_heading(string $eyebrow, string $titleHtml, string $text = '', bool $center = true): string
{
    $h = '<div class="' . ($center ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl') . '">';
    if ($eyebrow !== '') {
        $h .= eyebrow($eyebrow);
    }
    $h .= '<h2 class="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl lg:text-[44px] lg:leading-tight">' . $titleHtml . '</h2>';
    if ($text !== '') {
        $h .= '<p class="mt-4 text-lg leading-relaxed text-navy-500">' . e($text) . '</p>';
    }
    return $h . '</div>';
}

function button_link(string $href, string $label, string $variant = 'primary'): string
{
    $styles = [
        'primary' => 'bg-navy-900 text-white shadow-lg shadow-navy-900/20 hover:bg-navy-800',
        'secondary' => 'bg-white text-navy-900 ring-1 ring-navy-200 hover:ring-navy-300 hover:bg-navy-50',
        'mint' => 'bg-mint-500 text-navy-950 shadow-lg shadow-mint-500/30 hover:bg-mint-400',
    ];
    return '<a href="' . e($href) . '" class="group inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition ' . $styles[$variant] . '">'
        . e($label) . icon('ArrowRight', 'h-4 w-4 transition group-hover:translate-x-0.5') . '</a>';
}

/** Technology partner logos scrolling sideways. */
function partner_marquee(): string
{
    $items = '';
    foreach (array_merge(data('partners'), data('partners')) as $i => $p) {
        $items .= '<img src="/images/partners/' . e($p['file']) . '.png" alt="' . ($i >= count(data('partners')) ? '' : e($p['name'])) . '" width="180" height="60" loading="lazy" decoding="async"'
            . ' class="h-10 w-auto object-contain opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0 sm:h-12">';
    }
    return '<div class="mask-fade-x overflow-hidden"><div class="flex w-max animate-marquee items-center gap-14 hover:[animation-play-state:paused]">' . $items . '</div></div>';
}

function page_hero(string $eyebrow, string $title, string $text): string
{
    return '<section class="relative overflow-hidden border-b border-navy-100 bg-navy-50/50">'
        . '<div class="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_left,black,transparent_70%)]"></div>'
        . '<div class="' . CONTAINER . ' relative py-16 sm:py-20"><div class="max-w-3xl animate-fade-up">' . eyebrow($eyebrow)
        . '<h1 class="mt-5 text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl lg:text-[56px] lg:leading-[1.1]">' . e($title) . '</h1>'
        . '<p class="mt-5 max-w-2xl text-lg leading-relaxed text-navy-500">' . e($text) . '</p>'
        . '</div></div></section>';
}

function cta(): string
{
    $phone = settings()['phone1'];
    return '<section class="py-20 sm:py-24"><div class="' . CONTAINER . '">'
        . '<div class="relative overflow-hidden rounded-3xl bg-navy-900 px-6 py-12 sm:px-12 lg:px-16 lg:py-14">'
        . '<div class="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">'
        . '<div class="max-w-2xl"><h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Let’s build something brilliant together.</h2>'
        . '<p class="mt-4 text-lg text-navy-200">Partner with us to design and deliver the digital solutions your organization needs to thrive in a fast-changing world.</p></div>'
        . '<div class="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end">'
        . button_link('/contact', 'Get in Touch', 'mint')
        . '<a href="' . e(tel_href($phone)) . '" class="inline-flex items-center gap-2 font-medium text-white/80 hover:text-white">' . icon('Phone', 'h-4 w-4 text-white') . ' ' . e($phone) . '</a>'
        . '</div></div></div></div></section>';
}

/* ---------------------------------- logos ---------------------------------- */

function partner_logos(array $partners, bool $showNames = false, ?int $mobileLimit = null): string
{
    if (!$partners) {
        return '';
    }
    $h = '<ul class="flex flex-wrap justify-center gap-3">';
    foreach ($partners as $i => $p) {
        $img = '<img src="' . e($p['logo']) . '" alt="' . e($p['name']) . '" width="200" height="90" loading="lazy" decoding="async"'
            . ' class="h-auto max-h-20 w-auto max-w-[85%] object-contain transition duration-300 group-hover:scale-105">';
        $logo = $showNames
            ? '<span class="flex h-full w-full flex-col items-center justify-center gap-2"><span class="flex min-h-0 flex-1 items-center justify-center">' . $img . '</span>'
                . '<span class="line-clamp-1 text-center text-xs font-medium text-navy-500">' . e($p['name']) . '</span></span>'
            : $img;
        $hide = ($mobileLimit !== null && $i >= $mobileLimit) ? 'max-sm:hidden' : '';
        $height = $showNames ? 'h-36' : 'h-28';
        $h .= '<li title="' . e($p['name']) . '" class="group ' . $hide . ' flex ' . $height . ' w-[calc(50%-0.375rem)] items-center justify-center rounded-xl border border-navy-100 bg-white p-4 transition hover:border-navy-300 hover:shadow-md hover:shadow-navy-900/5 sm:w-[calc(33.333%-0.5rem)] lg:w-[calc(20%-0.6rem)]">';
        $h .= $p['url']
            ? '<a href="' . e($p['url']) . '" target="_blank" rel="noopener noreferrer" class="flex h-full w-full items-center justify-center">' . $logo . '</a>'
            : $logo;
        $h .= '</li>';
    }
    return $h . '</ul>';
}

/* --------------------------------- projects -------------------------------- */

function project_card(array $p): string
{
    $h = '<article id="' . e($p['slug']) . '" class="flex h-full scroll-mt-28 flex-col rounded-2xl border border-navy-100 bg-white p-7 transition hover:border-navy-300 hover:shadow-lg hover:shadow-navy-900/5">';
    $h .= '<div class="flex h-16 items-center">';
    $h .= $p['logo']
        ? '<img src="' . e($p['logo']) . '" alt="' . e($p['name']) . '" width="240" height="96" loading="lazy" decoding="async" class="h-14 w-auto max-w-[220px] object-contain object-left">'
        : '<span class="text-2xl font-bold text-navy-900">' . e($p['name']) . '</span>';
    $h .= '</div><div class="mt-5 flex flex-wrap gap-2 text-xs font-medium">';
    if ($p['sector']) {
        $h .= '<span class="rounded-full bg-navy-50 px-2.5 py-1 text-navy-900">' . e($p['sector']) . '</span>';
    }
    if ($p['client']) {
        $h .= '<span class="rounded-full bg-navy-50 px-2.5 py-1 text-navy-600">Client: ' . e($p['client']) . '</span>';
    }
    $h .= '</div><h3 class="mt-4 text-xl font-semibold text-navy-900">' . e($p['name']) . '</h3>';
    $h .= '<p class="mt-1 font-medium text-navy-600">' . e($p['tagline']) . '</p>';
    $h .= '<p class="mt-3 leading-relaxed text-navy-500">' . e($p['description']) . '</p>';
    $highlights = lines($p['highlights']);
    if ($highlights) {
        $h .= '<ul class="mt-5 space-y-2">';
        foreach ($highlights as $hl) {
            $h .= '<li class="flex items-start gap-2 text-sm text-navy-700">' . icon('Check', 'mt-0.5 h-4 w-4 shrink-0 text-navy-900') . ' ' . e($hl) . '</li>';
        }
        $h .= '</ul>';
    }
    $h .= '<div class="mt-auto pt-6">';
    if ($p['url']) {
        $h .= '<a href="' . e($p['url']) . '" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-sm font-semibold text-navy-900 underline-offset-4 hover:underline">Visit ' . e($p['name']) . ' ' . icon('ArrowUpRight', 'h-4 w-4') . '</a>';
    }
    return $h . '</div></article>';
}

/** Visual summary of a Britech product: logo + its real feature list. */
function product_panel(array $p): string
{
    $h = '<div class="relative overflow-hidden rounded-2xl bg-navy-900 p-6 sm:p-8">'
        . '<div class="bg-grid-dark absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]"></div>'
        . '<div class="relative flex h-28 items-center justify-center rounded-xl bg-white p-4">';
    $h .= $p['logo']
        ? '<img src="' . e($p['logo']) . '" alt="' . e($p['name']) . '" width="280" height="110" loading="lazy" decoding="async" class="h-auto max-h-20 w-auto max-w-[80%] object-contain">'
        : '<span class="text-2xl font-bold text-navy-900">' . e($p['name']) . '</span>';
    $h .= '</div>';
    $highlights = array_slice(lines($p["highlights"]), 0, 8);
    if ($highlights) {
        $h .= '<ul class="relative mt-5 grid gap-3 sm:grid-cols-2">';
        foreach ($highlights as $hl) {
            $h .= '<li class="flex items-center gap-3 rounded-xl bg-white/[0.06] px-4 py-3 text-sm font-medium text-white ring-1 ring-white/10">' . icon('CheckCircle2', 'h-4 w-4 shrink-0 text-white') . ' ' . e($hl) . '</li>';
        }
        $h .= '</ul>';
    }
    $h .= '<p class="relative mt-5 text-xs uppercase tracking-[0.18em] text-navy-300">' . ($p['sector'] ? e($p['sector']) . ' · ' : '') . 'Built by Britech Solutions</p>';
    return $h . '</div>';
}

/* ----------------------------------- posts --------------------------------- */

function post_cover(?string $src, string $alt, string $class): string
{
    if (!$src) {
        return '<div class="flex items-center justify-center bg-navy-900 ' . $class . '"><img src="/images/mark.png" alt="" width="64" height="64" loading="lazy" class="h-14 w-14 opacity-90"></div>';
    }
    return '<div class="relative overflow-hidden bg-navy-50 ' . $class . '"><img src="' . e($src) . '" alt="' . e($alt) . '" loading="lazy" decoding="async" class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"></div>';
}

function post_meta(array $post): string
{
    return '<p class="text-sm text-navy-400">' . ($post['publishedAt'] ? e(format_date($post['publishedAt'])) : '') . ' · ' . reading_time($post['content']) . ' min read</p>';
}

function post_card(array $post): string
{
    return '<a href="/blog/' . e($post['slug']) . '" class="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white transition hover:border-navy-300 hover:shadow-lg hover:shadow-navy-900/5">'
        . post_cover($post['coverImage'], $post['title'], 'aspect-[16/9]')
        . '<div class="flex flex-1 flex-col p-6">'
        . '<span class="text-xs font-semibold uppercase tracking-[0.15em] text-navy-500">' . e($post['category']) . '</span>'
        . '<h3 class="mt-2 text-lg font-semibold leading-snug text-navy-900 group-hover:text-navy-700">' . e($post['title']) . '</h3>'
        . '<p class="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-navy-500">' . e($post['excerpt']) . '</p>'
        . '<div class="mt-5 flex items-center justify-between">' . post_meta($post) . icon('ArrowRight', 'h-4 w-4 text-navy-900 transition group-hover:translate-x-1') . '</div>'
        . '</div></a>';
}

function featured_post(array $post): string
{
    return '<a href="/blog/' . e($post['slug']) . '" class="group grid overflow-hidden rounded-3xl border border-navy-100 bg-white transition hover:border-navy-300 hover:shadow-xl hover:shadow-navy-900/5 lg:grid-cols-2">'
        . post_cover($post['coverImage'], $post['title'], 'aspect-[16/10] lg:aspect-auto lg:min-h-[340px]')
        . '<div class="flex flex-col justify-center p-8 lg:p-10">'
        . '<span class="text-xs font-semibold uppercase tracking-[0.15em] text-navy-500">Featured · ' . e($post['category']) . '</span>'
        . '<h2 class="mt-3 text-2xl font-bold leading-tight text-navy-900 sm:text-3xl">' . e($post['title']) . '</h2>'
        . '<p class="mt-4 leading-relaxed text-navy-500">' . e($post['excerpt']) . '</p>'
        . '<div class="mt-6 flex items-center gap-3"><span class="font-medium text-navy-800">' . e($post['authorName']) . '</span>' . post_meta($post) . '</div>'
        . '</div></a>';
}

/* --------------------------- listing controls ------------------------------ */
// Plain links and GET forms — no JavaScript needed. Used on public and admin pages.

function page_list(int $page, int $pages): array
{
    $set = array_unique(array_filter([1, $pages, $page - 1, $page, $page + 1], fn ($n) => $n >= 1 && $n <= $pages));
    sort($set);
    $out = [];
    foreach ($set as $i => $n) {
        if ($i > 0 && $n - $set[$i - 1] > 1) {
            $out[] = '…';
        }
        $out[] = $n;
    }
    return $out;
}

function pagination(string $path, array $params, int $page, int $pages, int $total, int $pageSize, string $noun = 'items'): string
{
    if ($total === 0) {
        return '';
    }
    $from = ($page - 1) * $pageSize + 1;
    $to = min($total, $page * $pageSize);
    $link = fn (int $p) => e(build_href($path, array_merge($params, ['page' => $p])));
    $btn = 'flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition';

    $h = '<nav aria-label="Pagination" class="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row">'
        . '<p class="text-sm text-navy-400">Showing <span class="font-medium text-navy-700">' . $from . '</span>–<span class="font-medium text-navy-700">' . $to
        . '</span> of <span class="font-medium text-navy-700">' . $total . '</span> ' . e($noun) . '</p>';
    if ($pages > 1) {
        $h .= '<ul class="flex items-center gap-1"><li>';
        $h .= $page > 1
            ? '<a href="' . $link($page - 1) . '" aria-label="Previous page" class="' . $btn . ' text-navy-600 ring-1 ring-navy-200 hover:bg-navy-50">' . icon('ChevronLeft', 'h-4 w-4') . '</a>'
            : '<span class="' . $btn . ' text-navy-300 ring-1 ring-navy-100">' . icon('ChevronLeft', 'h-4 w-4') . '</span>';
        $h .= '</li>';
        foreach (page_list($page, $pages) as $p) {
            if ($p === '…') {
                $h .= '<li class="px-1 text-navy-300">…</li>';
                continue;
            }
            $h .= '<li><a href="' . $link($p) . '"' . ($p === $page ? ' aria-current="page"' : '') . ' class="' . $btn . ' '
                . ($p === $page ? 'bg-navy-900 text-white' : 'text-navy-600 hover:bg-navy-50') . '">' . $p . '</a></li>';
        }
        $h .= '<li>';
        $h .= $page < $pages
            ? '<a href="' . $link($page + 1) . '" aria-label="Next page" class="' . $btn . ' text-navy-600 ring-1 ring-navy-200 hover:bg-navy-50">' . icon('ChevronRight', 'h-4 w-4') . '</a>'
            : '<span class="' . $btn . ' text-navy-300 ring-1 ring-navy-100">' . icon('ChevronRight', 'h-4 w-4') . '</span>';
        $h .= '</li></ul>';
    }
    return $h . '</nav>';
}

/** GET search form; keeps other filters as hidden fields and resets to page 1. */
function search_form(string $path, string $q, array $keep = [], string $placeholder = 'Search…'): string
{
    $h = '<form action="' . e($path) . '" method="get" role="search" class="relative w-full sm:max-w-xs">';
    foreach ($keep as $k => $v) {
        if ($v !== null && $v !== '') {
            $h .= '<input type="hidden" name="' . e($k) . '" value="' . e($v) . '">';
        }
    }
    $h .= icon('Search', 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400');
    $h .= '<input type="search" name="q" value="' . e($q) . '" placeholder="' . e($placeholder) . '" maxlength="100" aria-label="' . e($placeholder) . '"'
        . ' class="w-full rounded-lg border border-navy-200 bg-white py-2.5 pl-9 pr-9 text-sm text-navy-900 placeholder:text-navy-400 outline-none transition focus:border-mint-500 focus:ring-4 focus:ring-mint-500/15">';
    if ($q !== '') {
        $h .= '<a href="' . e(build_href($path, $keep)) . '" aria-label="Clear search" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700">' . icon('X', 'h-4 w-4') . '</a>';
    }
    return $h . '</form>';
}

/** @param array<int, array{label:string, value?:?string, count?:?int}> $options */
function filter_chips(string $path, string $param, ?string $value, array $options, array $keep = []): string
{
    $h = '<div class="flex flex-wrap gap-2">';
    foreach ($options as $o) {
        $v = $o['value'] ?? null;
        $active = (string) $v === (string) $value;
        $h .= '<a href="' . e(build_href($path, array_merge($keep, [$param => $v]))) . '"' . ($active ? ' aria-current="true"' : '')
            . ' class="rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition ' . ($active ? 'bg-navy-900 text-white ring-navy-900' : 'bg-white text-navy-600 ring-navy-200 hover:bg-navy-50') . '">'
            . e($o['label']) . (isset($o['count']) ? '<span class="ml-1 opacity-60">' . (int) $o['count'] . '</span>' : '') . '</a>';
    }
    return $h . '</div>';
}

function empty_state(string $title, string $text = '', string $resetHref = ''): string
{
    return '<div class="rounded-2xl border border-dashed border-navy-200 bg-navy-50/50 px-6 py-14 text-center">'
        . '<p class="font-semibold text-navy-900">' . e($title) . '</p>'
        . ($text !== '' ? '<p class="mt-1 text-sm text-navy-500">' . e($text) . '</p>' : '')
        . ($resetHref !== '' ? '<a href="' . e($resetHref) . '" class="mt-4 inline-block text-sm font-semibold text-navy-900 underline-offset-4 hover:underline">Clear filters</a>' : '')
        . '</div>';
}

/* --------------------------------- social --------------------------------- */

function social_svg(string $name, string $class = 'h-4 w-4'): string
{
    $paths = [
        'linkedin' => '<path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>',
        'x' => '<path fill="currentColor" d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z"/>',
        'facebook' => '<path fill="currentColor" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.62 23.1 24 18.1 24 12.07z"/>',
        'instagram' => '<rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>',
        'youtube' => '<path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/>',
    ];
    return '<svg viewBox="0 0 24 24" class="' . e($class) . '" aria-hidden="true">' . $paths[$name] . '</svg>';
}

/** Number that counts up when scrolled into view, e.g. "300+" counts 0 → 300 and keeps the "+". Shows the real value without JS. */
function count_up(string $value, string $class): string
{
    if (!preg_match('/^(\D*)([\d,.]+)(.*)$/u', $value, $m)) {
        return '<span class="' . $class . '">' . e($value) . '</span>';
    }
    $target = (float) str_replace(',', '', $m[2]);
    return '<span class="tabular-nums ' . $class . '" data-count="' . e((string) $target) . '" data-prefix="' . e($m[1]) . '" data-suffix="' . e($m[3]) . '">'
        . e($m[1]) . number_format($target) . e($m[3]) . '</span>';
}
