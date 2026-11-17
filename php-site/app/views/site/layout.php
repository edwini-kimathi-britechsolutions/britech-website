<?php
defined('BRITECH') || exit;
/**
 * Public site layout.
 * @var string $content  page HTML
 * @var array  $meta     title, description, og (array), canonical
 */
$s = settings();
$company = data('company');
$siteName = 'Britech Solutions';
$fullTitle = isset($meta['title']) && $meta['title'] !== ''
    ? $meta['title'] . ' | ' . $siteName
    : 'Britech Solutions | Driven by Innovation. Powered by Technology';
$description = $meta['description'] ?? 'Britech Solutions builds smart, secure, and scalable digital systems for businesses, governments, and organizations in Tanzania, Africa and beyond.';
$path = request_path();
$canonical = site_url() . ($path === '/' ? '' : $path);
$og = $meta['og'] ?? [];
$ogImage = $og['image'] ?? '/images/og.png';
if ($ogImage[0] === '/') {
    $ogImage = site_url() . $ogImage;
}

// Organization details for search engines.
$jsonLd = [
    '@context' => 'https://schema.org',
    '@type' => 'Organization',
    'name' => $company['name'],
    'url' => site_url(),
    'logo' => site_url() . '/images/logo.png',
    'slogan' => $company['tagline'],
    'email' => $s['email'],
    'telephone' => array_values(array_filter([$s['phone1'], $s['phone2']])),
    'address' => ['@type' => 'PostalAddress', 'streetAddress' => $s['address'], 'addressLocality' => 'Arusha', 'addressCountry' => 'TZ'],
    'sameAs' => array_values(array_filter([$s['linkedin'], $s['twitter'], $s['facebook'], $s['instagram'], $s['youtube']])),
];

$nav = [
    ['/', 'Home', false],
    ['/about', 'About', false],
    ['/solutions', 'Solutions', true],
    ['/industries', 'Industries', false],
    ['/products', 'Products', false],
    ['/our-work', 'Our Work', false],
    ['/blog', 'Blog', false],
    ['/contact', 'Contact', false],
];
$isActive = fn (string $href) => $path === $href || str_starts_with($path, $href . '/');
$navCls = fn (string $href) => $isActive($href) ? 'bg-navy-50 text-navy-900 ring-1 ring-navy-100' : 'text-navy-700 hover:text-navy-900';
?><!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($fullTitle) ?></title>
<meta name="description" content="<?= e($description) ?>">
<link rel="canonical" href="<?= e($canonical) ?>">
<link rel="icon" href="/images/mark.png">
<link rel="apple-touch-icon" href="/images/mark.png">
<meta property="og:site_name" content="Britech Solutions">
<meta property="og:locale" content="en_TZ">
<meta property="og:type" content="<?= e($og['type'] ?? 'website') ?>">
<meta property="og:title" content="<?= e($og['title'] ?? ($meta['title'] ?? 'Britech Solutions')) ?>">
<meta property="og:description" content="<?= e($og['description'] ?? 'Innovative technology solutions for businesses, governments, and organizations in Africa and beyond.') ?>">
<meta property="og:url" content="<?= e($canonical) ?>">
<meta property="og:image" content="<?= e($ogImage) ?>">
<?php if (!empty($og['publishedTime'])): ?><meta property="article:published_time" content="<?= e($og['publishedTime']) ?>">
<?php endif; ?>
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="<?= e(asset('app.css')) ?>">
<script src="<?= e(asset('site.js')) ?>" defer></script>
<script type="application/ld+json"><?= json_encode($jsonLd, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?></script>
</head>
<body class="font-sans">
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white">Skip to content</a>

<?php if ($s['announcement_text'] !== ''): ?>
<div class="bg-navy-950 text-white">
  <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
    <p class="flex min-w-0 items-center gap-2 text-sm text-navy-200"><?= icon('Sparkles', 'h-4 w-4 shrink-0 text-white') ?><span class="truncate"><?= e($s['announcement_text']) ?></span></p>
    <?php if ($s['announcement_link'] !== ''): ?>
    <a href="<?= e($s['announcement_link']) ?>" class="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-mint-400 transition hover:text-mint-300">Learn more <?= icon('ArrowRight', 'h-3.5 w-3.5') ?></a>
    <?php endif; ?>
  </div>
</div>
<?php endif; ?>

<header data-header class="sticky top-0 z-50 border-b border-transparent bg-white transition-all">
  <div class="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
    <a href="/" class="flex shrink-0 items-center" aria-label="Britech Solutions home">
      <img src="/images/logo.png" alt="Britech Solutions" width="140" height="53" class="h-10 w-auto" fetchpriority="high">
    </a>

    <nav class="hidden items-center gap-1 lg:flex" aria-label="Main">
      <?php foreach ($nav as [$href, $label, $mega]): ?>
        <?php if ($mega): ?>
        <div class="group relative">
          <a href="<?= $href ?>" class="flex items-center gap-1 rounded-full px-2.5 py-2 text-[15px] font-medium transition xl:px-4 <?= $navCls($href) ?>"><?= e($label) ?><?= icon('ChevronDown', 'h-4 w-4 transition group-hover:rotate-180') ?></a>
          <div class="invisible absolute left-1/2 top-full w-[640px] -translate-x-1/2 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
            <div class="grid grid-cols-2 gap-1 rounded-2xl border border-navy-100 bg-white p-3 shadow-xl shadow-navy-900/10">
              <?php foreach (data('services') as $sv): ?>
              <a href="/solutions/<?= e($sv['slug']) ?>" class="flex gap-3 rounded-xl p-3 transition hover:bg-navy-50">
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-900"><?= icon($sv['icon'], 'h-5 w-5') ?></span>
                <span><span class="block text-sm font-semibold text-navy-900"><?= e($sv['title']) ?></span><span class="line-clamp-1 text-xs text-navy-400"><?= e($sv['short']) ?></span></span>
              </a>
              <?php endforeach; ?>
              <a href="/solutions" class="flex items-center justify-center gap-2 rounded-xl bg-navy-900 p-3 text-sm font-semibold text-white transition hover:bg-navy-800">View all solutions <?= icon('ArrowRight', 'h-4 w-4') ?></a>
            </div>
          </div>
        </div>
        <?php else: ?>
        <a href="<?= $href ?>" class="rounded-full px-2.5 py-2 text-[15px] font-medium transition xl:px-4 <?= $navCls($href) ?>"><?= e($label) ?></a>
        <?php endif; ?>
      <?php endforeach; ?>
    </nav>

    <div class="hidden items-center gap-4 lg:flex">
      <a href="/contact" class="rounded-lg bg-navy-900 px-5 py-2.5 text-[15px] font-medium text-white shadow-md shadow-navy-900/20 ring-1 ring-navy-700 transition hover:bg-navy-800">Get a Quote</a>
    </div>

    <button type="button" data-menu-toggle class="rounded-lg p-2 text-navy-900 ring-1 ring-navy-100 lg:hidden" aria-label="Toggle menu" aria-expanded="false" aria-controls="mobile-menu">
      <span data-icon-open><?= icon('Menu', 'h-5 w-5') ?></span><span data-icon-close class="hidden"><?= icon('X', 'h-5 w-5') ?></span>
    </button>
  </div>

  <div id="mobile-menu" class="hidden border-t border-navy-100 bg-white px-4 pb-6 pt-2 lg:hidden">
    <?php foreach ($nav as [$href, $label]): ?>
    <a href="<?= $href ?>" class="block rounded-lg px-3 py-3 font-medium <?= $isActive($href) ? 'bg-navy-50 text-navy-900' : 'text-navy-700' ?>"><?= e($label) ?></a>
    <?php endforeach; ?>
    <div class="mt-2 border-t border-navy-100 pt-3">
      <p class="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-navy-400">Solutions</p>
      <?php foreach (data('services') as $sv): ?>
      <a href="/solutions/<?= e($sv['slug']) ?>" class="block px-3 py-2 text-sm text-navy-700"><?= e($sv['title']) ?></a>
      <?php endforeach; ?>
    </div>
    <a href="<?= e(tel_href($s['phone1'])) ?>" class="mt-4 flex items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-3 font-medium text-white"><?= icon('Phone', 'h-4 w-4') ?> <?= e($s['phone1']) ?></a>
  </div>
</header>

<main id="main"><?= $content ?></main>

<?php
$socials = array_filter([
    ['linkedin', $s['linkedin'], 'LinkedIn'],
    ['x', $s['twitter'], 'X'],
    ['facebook', $s['facebook'], 'Facebook'],
    ['instagram', $s['instagram'], 'Instagram'],
    ['youtube', $s['youtube'], 'YouTube'],
], fn ($x) => $x[1] !== '');
$phones = array_filter([$s['phone1'], $s['phone2']]);
?>
<footer class="relative overflow-hidden bg-navy-950 text-navy-200">
  <div class="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
    <div class="grid gap-12 lg:grid-cols-12">
      <div class="lg:col-span-3">
        <img src="/images/logo-white.png" alt="Britech Solutions" width="150" height="58" loading="lazy" class="h-11 w-auto">
        <p class="mt-6 max-w-sm leading-relaxed text-navy-300">Simplifying IT for a complex world. Innovative technology solutions for businesses, governments, and organizations in Africa and beyond.</p>
        <?php if ($socials): ?>
        <div class="mt-6 flex gap-3">
          <?php foreach ($socials as [$key, $href, $label]): ?>
          <a href="<?= e($href) ?>" target="_blank" rel="noreferrer" aria-label="<?= e($label) ?>" class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 transition hover:bg-white hover:text-navy-950"><?= social_svg($key) ?></a>
          <?php endforeach; ?>
        </div>
        <?php endif; ?>
      </div>

      <div class="lg:col-span-4">
        <h3 class="text-sm font-semibold uppercase tracking-wider text-white">Solutions</h3>
        <ul class="mt-5 space-y-3">
          <?php foreach (data('services') as $sv): ?>
          <li><a href="/solutions/<?= e($sv['slug']) ?>" class="transition hover:text-mint-400"><?= e($sv['title']) ?></a></li>
          <?php endforeach; ?>
        </ul>
      </div>

      <div class="lg:col-span-2">
        <h3 class="text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
        <ul class="mt-5 space-y-3">
          <?php foreach ([['/about', 'About Britech'], ['/products', 'Products'], ['/industries', 'Industries'], ['/our-work', 'Our Work'], ['/clients', 'Clients & Partners'], ['/blog', 'Blog'], ['/contact', 'Contact']] as [$href, $label]): ?>
          <li><a href="<?= $href ?>" class="transition hover:text-mint-400"><?= e($label) ?></a></li>
          <?php endforeach; ?>
        </ul>
      </div>

      <div class="lg:col-span-3">
        <h3 class="text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
        <ul class="mt-5 space-y-4 text-sm">
          <li class="flex gap-3"><?= icon('MapPin', 'mt-0.5 h-4 w-4 shrink-0 text-white') ?><?= e($s['address']) ?></li>
          <li class="flex gap-3"><?= icon('Mail', 'mt-0.5 h-4 w-4 shrink-0 text-white') ?><a href="mailto:<?= e($s['email']) ?>" class="hover:text-mint-400"><?= e($s['email']) ?></a></li>
          <?php foreach ($phones as $p): ?>
          <li class="flex gap-3"><?= icon('Phone', 'mt-0.5 h-4 w-4 shrink-0 text-white') ?><a href="<?= e(tel_href($p)) ?>" class="hover:text-mint-400"><?= e($p) ?></a></li>
          <?php endforeach; ?>
        </ul>
      </div>
    </div>

    <div class="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-navy-400 sm:flex-row">
      <p>© <?= date('Y') ?> Britech Solutions. All rights reserved.</p>
      <p class="font-medium text-navy-300"><?= e($company['tagline']) ?></p>
    </div>
  </div>
</footer>

<?php $wa = preg_replace('/\D/', '', $s['whatsapp']); if (strlen($wa) >= 9): ?>
<a href="https://wa.me/<?= e($wa) ?>?text=<?= rawurlencode('Hello Britech Solutions, I’d like to ask about your services.') ?>" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" class="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-xl shadow-navy-900/20 transition hover:scale-105 sm:bottom-6 sm:right-6">
  <svg viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.43 9.43 0 0 1-4.8-1.31l-.35-.2-3.57.93.96-3.48-.23-.36a9.4 9.4 0 0 1-1.44-5.03c0-5.2 4.24-9.44 9.45-9.44a9.4 9.4 0 0 1 6.68 2.77 9.38 9.38 0 0 1 2.76 6.68c0 5.21-4.24 9.44-9.45 9.44m8.04-17.48A11.3 11.3 0 0 0 12.05.69C5.78.69.68 5.79.68 12.05c0 2 .52 3.96 1.52 5.68L.58 23.62l6.03-1.58a11.33 11.33 0 0 0 5.43 1.38h.01c6.26 0 11.36-5.1 11.37-11.36a11.3 11.3 0 0 0-3.33-8.04"/></svg>
  <span class="hidden pr-1 text-sm font-semibold lg:group-hover:inline">Chat with us</span>
</a>
<?php endif; ?>
</body>
</html>
