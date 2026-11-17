<?php
defined('BRITECH') || exit;
/** @var array $products @var int $total @var int $pages @var int $page */
?>
<?= page_hero('Products', 'Our flagship products & systems', 'Platforms designed, built and supported by Britech to help organizations run operations, track results and reach people.') ?>
<section class="py-20 sm:py-24">
  <div class="<?= CONTAINER ?>">
    <?php if ($total === 0): ?>
      <?= empty_state('Products coming soon') ?>
    <?php else: ?>
    <div class="space-y-10">
      <?php foreach ($products as $i => $p): ?>
      <div id="<?= e($p['slug']) ?>" class="grid scroll-mt-28 items-center gap-10 rounded-3xl border border-navy-100 bg-white p-6 shadow-lg shadow-navy-900/5 sm:p-10 lg:grid-cols-2">
        <div class="<?= $i % 2 ? 'lg:order-2' : '' ?>">
          <span class="text-sm font-semibold uppercase tracking-wider text-mint-700"><?= e($p['tagline']) ?></span>
          <h2 class="mt-2 text-3xl font-bold text-navy-900 sm:text-4xl"><?= e($p['name']) ?></h2>
          <p class="mt-4 text-lg leading-relaxed text-navy-500"><?= e($p['description']) ?></p>
          <div class="mt-8 flex flex-wrap items-center gap-4">
            <?= button_link(contact_for_product($p), 'Request a Demo') ?>
            <?php if ($p['url']): ?>
            <a href="<?= e($p['url']) ?>" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 font-semibold text-mint-700 hover:text-mint-600">Visit <?= e($p['name']) ?> <?= icon('ArrowUpRight', 'h-4 w-4') ?></a>
            <?php endif; ?>
          </div>
          <?php if (!lines($p['highlights'])): ?><p class="mt-4 text-sm text-navy-400">More details coming soon.</p><?php endif; ?>
        </div>
        <?= product_panel($p) ?>
      </div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>
    <?= pagination('/products', [], $page, $pages, $total, PRODUCT_PAGE_SIZE, 'products') ?>
  </div>
</section>
<?= cta() ?>
