<?php defined('BRITECH') || exit; ?>
<?= page_hero('Solutions', 'Technology that moves you forward', 'From strategy to deployment and long-term support, we deliver end-to-end digital capabilities that are scalable, secure, and tailored to your needs.') ?>
<section class="py-20 sm:py-24">
  <div class="<?= CONTAINER ?> grid gap-6 md:grid-cols-2">
    <?php foreach (data('services') as $s): ?>
    <a href="/solutions/<?= e($s['slug']) ?>" class="group flex gap-6 rounded-2xl border border-navy-100 bg-white p-7 transition hover:-translate-y-1 hover:border-navy-300 hover:shadow-xl hover:shadow-navy-900/5">
      <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-white transition group-hover:bg-navy-700"><?= icon($s['icon'], 'h-7 w-7') ?></span>
      <div>
        <h2 class="text-xl font-semibold text-navy-900"><?= e($s['title']) ?></h2>
        <p class="mt-2 leading-relaxed text-navy-500"><?= e($s['short']) ?></p>
        <span class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-900">Learn more <?= icon('ArrowRight', 'h-4 w-4 transition group-hover:translate-x-1') ?></span>
      </div>
    </a>
    <?php endforeach; ?>
  </div>
</section>
<?= cta() ?>
