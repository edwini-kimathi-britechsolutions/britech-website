<?php
defined('BRITECH') || exit;
/** @var array $projects @var int $total @var int $pages @var int $page @var string $q @var ?string $sector @var array $sectors */
?>
<?= page_hero('Our work', 'Platforms we’ve built for our clients and ourselves', 'From poultry health monitoring to results management, enterprise operations and messaging — systems Britech has designed and delivered.') ?>
<section class="py-16 sm:py-20">
  <div class="<?= CONTAINER ?>">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <?php if (count($sectors) > 1): ?>
        <?= filter_chips('/our-work', 'sector', $sector, array_merge([['label' => 'All']], array_map(fn ($s) => ['label' => $s['name'], 'value' => $s['name'], 'count' => (int) $s['count']], $sectors)), ['q' => $q]) ?>
      <?php else: ?><span></span><?php endif; ?>
      <?= search_form('/our-work', $q, ['sector' => $sector], 'Search projects') ?>
    </div>

    <?php if (!$projects): ?>
      <div class="mt-10"><?= empty_state('No projects match your search', '', '/our-work') ?></div>
    <?php else: ?>
      <div class="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <?php foreach ($projects as $p) { echo project_card($p); } ?>
      </div>
    <?php endif; ?>
    <?= pagination('/our-work', ['q' => $q, 'sector' => $sector], $page, $pages, $total, PROJECT_PAGE_SIZE, 'projects') ?>

    <div class="mt-14 flex flex-col items-start justify-between gap-4 rounded-2xl border border-navy-100 bg-navy-50/60 p-6 sm:flex-row sm:items-center">
      <p class="text-navy-700"><span class="font-semibold text-navy-900">Clients &amp; partners.</span> See the organizations we work with across Tanzania.</p>
      <a href="/clients" class="inline-flex items-center gap-1 font-semibold text-mint-700 hover:text-mint-600">View clients &amp; partners <?= icon('ArrowRight', 'h-4 w-4') ?></a>
    </div>
  </div>
</section>
<?= cta() ?>
