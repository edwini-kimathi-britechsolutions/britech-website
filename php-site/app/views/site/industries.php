<?php defined('BRITECH') || exit; ?>
<?= page_hero('Industries', 'Technology for the sectors that shape Africa', 'We bring software, data, and security expertise to institutions in agriculture, health, education, conservation, finance, and governance.') ?>
<section class="py-20 sm:py-24">
  <div class="<?= CONTAINER ?> grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    <?php foreach (data('industries') as $i => $ind): ?>
    <div data-reveal style="transition-delay:<?= ($i % 3) * 80 ?>ms">
      <a href="/industries/<?= e($ind['slug']) ?>" class="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-7 transition hover:border-mint-300 hover:shadow-lg hover:shadow-navy-900/5">
        <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-mint-50 text-mint-700"><?= icon($ind['icon'], 'h-6 w-6') ?></span>
        <h2 class="mt-5 text-lg font-semibold text-navy-900"><?= e($ind['title']) ?></h2>
        <p class="mt-2 flex-1 leading-relaxed text-navy-500"><?= e($ind['short']) ?></p>
        <span class="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-mint-700">Learn more <?= icon('ArrowRight', 'h-4 w-4 transition group-hover:translate-x-1') ?></span>
      </a>
    </div>
    <?php endforeach; ?>
    <div data-reveal style="transition-delay:80ms" class="lg:col-span-2">
      <div class="flex h-full flex-col justify-between gap-6 rounded-2xl bg-navy-900 p-7 text-white sm:flex-row sm:items-center">
        <div>
          <h2 class="text-lg font-semibold">Don’t see your sector?</h2>
          <p class="mt-2 max-w-md text-navy-200">Our solutions adapt to any organization. Tell us about your challenges and we’ll show you what’s possible.</p>
        </div>
        <a href="/contact" class="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-mint-500 px-5 py-3 font-semibold text-navy-950 transition hover:bg-mint-400">Talk to us <?= icon('ArrowRight', 'h-4 w-4') ?></a>
      </div>
    </div>
  </div>
</section>
<?= cta() ?>
