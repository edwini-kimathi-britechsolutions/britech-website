<?php
defined('BRITECH') || exit;
/** @var array $posts @var int $total @var int $pages @var int $page @var string $q @var ?string $category @var array $categories */
$showFeatured = $page === 1 && !$category && $q === '' && $posts;
$featured = null;
if ($showFeatured) {
    foreach ($posts as $p) {
        if ((int) $p['featured']) { $featured = $p; break; }
    }
    $featured = $featured ?? $posts[0];
}
$rest = $featured ? array_filter($posts, fn ($p) => $p['id'] !== $featured['id']) : $posts;
$chip = fn (bool $active) => 'rounded-full px-4 py-2 text-sm font-medium ring-1 transition ' . ($active ? 'bg-navy-900 text-white ring-navy-900' : 'bg-white text-navy-600 ring-navy-200 hover:bg-navy-50');
?>
<?= page_hero('Blog', 'Insights from the Britech team', 'News, lessons from our projects, and practical guidance on software, data, AI and cybersecurity.') ?>
<section class="py-16 sm:py-20">
  <div class="<?= CONTAINER ?>">
    <div class="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <?php if (count($categories) > 1): ?>
      <nav aria-label="Categories" class="flex flex-wrap gap-2">
        <a href="<?= e(build_href('/blog', ['q' => $q])) ?>" class="<?= $chip(!$category) ?>">All</a>
        <?php foreach ($categories as $c): ?>
        <a href="<?= e(build_href('/blog', ['category' => $c['name'], 'q' => $q])) ?>" class="<?= $chip($category === $c['name']) ?>"><?= e($c['name']) ?> <span class="opacity-60"><?= (int) $c['count'] ?></span></a>
        <?php endforeach; ?>
      </nav>
      <?php else: ?><span></span><?php endif; ?>
      <?php if ($total > 0 || $q !== ''): ?><?= search_form('/blog', $q, ['category' => $category], 'Search articles') ?><?php endif; ?>
    </div>

    <?php if ($total === 0 && ($q !== '' || $category)): ?>
      <?= empty_state('No articles match your search', '', '/blog') ?>
    <?php elseif ($total === 0): ?>
      <div class="rounded-3xl border border-dashed border-navy-200 bg-navy-50/50 px-6 py-20 text-center">
        <?= icon('Newspaper', 'mx-auto h-10 w-10 text-navy-300') ?>
        <h2 class="mt-4 text-xl font-semibold text-navy-900">No articles yet</h2>
        <p class="mt-2 text-navy-500">Our first articles are on the way. Check back soon.</p>
      </div>
    <?php else: ?>
      <?php if ($featured): ?><div class="mb-10"><?= featured_post($featured) ?></div><?php endif; ?>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <?php foreach ($rest as $p) { echo post_card($p); } ?>
      </div>
      <?= pagination('/blog', ['category' => $category, 'q' => $q], $page, $pages, $total, POST_PAGE_SIZE, 'articles') ?>
    <?php endif; ?>
  </div>
</section>
<?= cta() ?>
