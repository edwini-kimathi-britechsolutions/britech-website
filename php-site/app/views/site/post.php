<?php
defined('BRITECH') || exit;
/** @var array $post @var array $related */
$url = site_url() . '/blog/' . $post['slug'];
$enc = 'rawurlencode';
$share = [
    ['Share on LinkedIn', 'https://www.linkedin.com/sharing/share-offsite/?url=' . $enc($url), social_svg('linkedin')],
    ['Share on X', 'https://twitter.com/intent/tweet?url=' . $enc($url) . '&text=' . $enc($post['title']), social_svg('x')],
    ['Share on Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' . $enc($url), social_svg('facebook')],
    ['Share by email', 'mailto:?subject=' . $enc($post['title']) . '&body=' . $enc($url), icon('Mail', 'h-4 w-4')],
];
$tags = array_values(array_filter(array_map('trim', explode(',', $post['tags']))));
?>
<article>
  <header class="border-b border-navy-100 bg-navy-50/50">
    <div class="<?= CONTAINER ?> max-w-4xl py-14 sm:py-16">
      <a href="/blog" class="inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-900"><?= icon('ArrowLeft', 'h-4 w-4') ?> All articles</a>
      <p class="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-mint-700"><?= e($post['category']) ?></p>
      <h1 class="mt-3 text-3xl font-bold leading-tight tracking-tight text-navy-900 sm:text-5xl"><?= e($post['title']) ?></h1>
      <p class="mt-5 text-lg leading-relaxed text-navy-500"><?= e($post['excerpt']) ?></p>
      <div class="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-navy-500">
        <span class="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-white"><?= e(mb_substr($post['authorName'], 0, 1)) ?></span>
        <span class="font-medium text-navy-800"><?= e($post['authorName']) ?></span>
        <span>·</span>
        <?php if ($post['publishedAt']): ?><time datetime="<?= e(iso_date($post['publishedAt'])) ?>"><?= e(format_date($post['publishedAt'])) ?></time><?php endif; ?>
        <span>·</span>
        <span><?= reading_time($post['content']) ?> min read</span>
      </div>
    </div>
  </header>

  <?php if ($post['coverImage']): ?>
  <div class="<?= CONTAINER ?> max-w-5xl">
    <div class="relative -mb-4 mt-10 aspect-[16/8] overflow-hidden rounded-3xl bg-navy-50">
      <img src="<?= e($post['coverImage']) ?>" alt="" class="absolute inset-0 h-full w-full object-cover" fetchpriority="high">
    </div>
  </div>
  <?php endif; ?>

  <div class="<?= CONTAINER ?> max-w-3xl py-14">
    <!-- Content is sanitized when saved; sanitized again here as defence in depth. -->
    <div class="prose prose-lg prose-britech max-w-none"><?= sanitize_post_html($post['content']) ?></div>

    <div class="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-navy-100 pt-8">
      <?php if ($tags): ?>
      <ul class="flex flex-wrap gap-2">
        <?php foreach ($tags as $t): ?><li class="rounded-full bg-navy-50 px-3 py-1 text-sm text-navy-600">#<?= e($t) ?></li><?php endforeach; ?>
      </ul>
      <?php else: ?><span></span><?php endif; ?>
      <div class="flex items-center gap-2">
        <span class="mr-1 text-sm text-navy-400">Share</span>
        <?php foreach ($share as [$label, $href, $svg]): ?>
        <a href="<?= e($href) ?>" target="_blank" rel="noopener noreferrer" aria-label="<?= e($label) ?>" class="flex h-9 w-9 items-center justify-center rounded-lg text-navy-600 ring-1 ring-navy-200 transition hover:bg-navy-900 hover:text-white"><?= $svg ?></a>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</article>

<?php if ($related): ?>
<section class="border-t border-navy-100 bg-navy-50/50 py-16">
  <div class="<?= CONTAINER ?>">
    <h2 class="text-2xl font-bold text-navy-900">More in <?= e($post['category']) ?></h2>
    <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <?php foreach ($related as $p) { echo post_card($p); } ?>
    </div>
  </div>
</section>
<?php endif; ?>
<?= cta() ?>
