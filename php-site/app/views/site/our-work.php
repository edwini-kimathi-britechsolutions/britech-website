<?php
defined('BRITECH') || exit;
/** @var array $projects @var int $total @var int $pages @var int $page @var string $q @var ?string $sector @var array $sectors */
// Search and filters only help once there are enough projects to browse.
$showTools = $q || $sector || $total > PROJECT_PAGE_SIZE;
?>
<?= page_hero('Our work', 'Systems we’ve built for our clients', 'Platforms Britech has designed and delivered for organizations across Tanzania.') ?>
<section class="py-16 sm:py-20">
  <div class="<?= CONTAINER ?>">
    <?php if ($showTools): ?>
    <div class="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <?php if (count($sectors) > 1): ?>
        <?= filter_chips('/our-work', 'sector', $sector, array_merge([['label' => 'All']], array_map(fn ($s) => ['label' => $s['name'], 'value' => $s['name'], 'count' => (int) $s['count']], $sectors)), ['q' => $q]) ?>
      <?php else: ?><span></span><?php endif; ?>
      <?= search_form('/our-work', $q, ['sector' => $sector], 'Search projects') ?>
    </div>
    <?php endif; ?>

    <?php if (!$projects): ?>
      <?= ($q || $sector) ? empty_state('No projects match your search', '', '/our-work') : empty_state('Client projects coming soon') ?>
    <?php else: ?>
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <?php foreach ($projects as $p) { echo project_card($p); } ?>
      </div>
    <?php endif; ?>
    <?= pagination('/our-work', ['q' => $q, 'sector' => $sector], $page, $pages, $total, PROJECT_PAGE_SIZE, 'projects') ?>

    <div class="mt-14 grid gap-4 md:grid-cols-2">
      <div class="flex flex-col items-start justify-between gap-4 rounded-2xl border border-navy-100 bg-navy-50/60 p-6">
        <p class="text-navy-700"><span class="font-semibold text-navy-900">Our own products.</span> The platforms Britech builds, runs and supports itself.</p>
        <a href="/products" class="inline-flex items-center gap-1 font-semibold text-mint-700 hover:text-mint-600">View products <?= icon('ArrowRight', 'h-4 w-4') ?></a>
      </div>
      <div class="flex flex-col items-start justify-between gap-4 rounded-2xl border border-navy-100 bg-navy-50/60 p-6">
        <p class="text-navy-700"><span class="font-semibold text-navy-900">Clients &amp; partners.</span> See the organizations we work with across Tanzania.</p>
        <a href="/clients" class="inline-flex items-center gap-1 font-semibold text-mint-700 hover:text-mint-600">View clients &amp; partners <?= icon('ArrowRight', 'h-4 w-4') ?></a>
      </div>
    </div>
  </div>
</section>
<?= cta() ?>
