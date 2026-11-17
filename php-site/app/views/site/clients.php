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
<?= cta() ?>
