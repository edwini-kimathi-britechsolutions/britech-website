<?php
defined('BRITECH') || exit;
/** @var array $partners @var int $total @var int $pages @var int $page @var string $q @var ?string $type */
?>
<?= page_hero('Clients & partners', 'Organizations we work with', 'Public institutions, conservation bodies, development organizations and businesses across Tanzania and East Africa.') ?>
<section class="py-16 sm:py-20">
  <div class="<?= CONTAINER ?>">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <?= filter_chips('/clients', 'type', $type, [['label' => 'All'], ['label' => 'Clients', 'value' => 'clients'], ['label' => 'Partners', 'value' => 'partners']], ['q' => $q]) ?>
      <?= search_form('/clients', $q, ['type' => $type], 'Search organizations') ?>
    </div>
    <div class="mt-10">
      <?= $partners ? partner_logos($partners, true) : empty_state('No organizations match your search', '', '/clients') ?>
    </div>
    <?= pagination('/clients', ['q' => $q, 'type' => $type], $page, $pages, $total, PARTNER_PAGE_SIZE, 'organizations') ?>
  </div>
</section>
<?php if (!$q && $type !== 'clients'): /* same list as the home page strip */ ?>
<section class="border-t border-navy-100 bg-navy-50/50 py-16 sm:py-20">
  <div class="<?= CONTAINER ?>">
    <h2 class="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">Technology partners we build with</h2>
    <p class="mt-3 max-w-2xl text-navy-500">The technology vendors and platforms behind the systems we design, deliver and support.</p>
    <ul class="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <?php foreach (data('partners') as $p): ?>
      <li class="flex h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-navy-100 bg-white p-4">
        <img src="/images/partners/<?= e($p['file']) ?>.png" alt="<?= e($p['name']) ?>" width="180" height="60" loading="lazy" class="h-10 w-auto max-w-full object-contain">
        <span class="text-center text-xs font-medium text-navy-500"><?= e($p['name']) ?></span>
      </li>
      <?php endforeach; ?>
    </ul>
  </div>
</section>
<?php endif; ?>
<?= cta() ?>
