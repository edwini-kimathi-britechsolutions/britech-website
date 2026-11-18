<?php defined('BRITECH') || exit; ?>
<?= page_hero('Solutions', 'One Britech. Three practices.', 'Engineering consultancy, digital transformation and business advisory, integrated to help you design, modernize and operate the physical, digital and organizational systems your performance depends on.') ?>
<?php foreach (data('practices') as $i => $pr): $list = services_in($pr['slug']); ?>
<section id="<?= e($pr['slug']) ?>" class="scroll-mt-24 py-16 sm:py-20<?= $i % 2 ? ' bg-navy-50/50' : '' ?>">
  <div class="<?= CONTAINER ?>">
    <div class="flex flex-col gap-5 sm:flex-row sm:items-start">
      <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-white"><?= icon($pr['icon'], 'h-7 w-7') ?></span>
      <div class="max-w-3xl">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-navy-500">Practice <?= $i + 1 ?></p>
        <h2 class="mt-2 text-3xl font-bold tracking-tight text-navy-900"><?= e($pr['title']) ?></h2>
        <p class="mt-3 text-lg leading-relaxed text-navy-500"><?= e($pr['short']) ?></p>
      </div>
    </div>
    <?php if (count($list) === 1): $only = $list[0]; ?>
      <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <?php foreach ($only['features'] as $f): ?>
        <div class="rounded-2xl border border-navy-100 bg-white p-6">
          <h3 class="font-semibold text-navy-900"><?= e($f['title']) ?></h3>
          <p class="mt-2 text-sm leading-relaxed text-navy-500"><?= e($f['text']) ?></p>
        </div>
        <?php endforeach; ?>
      </div>
      <a href="/solutions/<?= e($only['slug']) ?>" class="mt-8 inline-flex items-center gap-1 font-semibold text-navy-900 underline-offset-4 hover:underline">More about <?= e($only['title']) ?> <?= icon('ArrowRight', 'h-4 w-4') ?></a>
    <?php else: ?>
      <div class="mt-10 grid gap-5 md:grid-cols-2">
        <?php foreach ($list as $s): ?>
        <a href="/solutions/<?= e($s['slug']) ?>" class="group flex gap-6 rounded-2xl border border-navy-100 bg-white p-7 transition hover:-translate-y-1 hover:border-navy-300 hover:shadow-xl hover:shadow-navy-900/5">
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-900"><?= icon($s['icon'], 'h-6 w-6') ?></span>
          <div>
            <h3 class="text-xl font-semibold text-navy-900"><?= e($s['title']) ?></h3>
            <p class="mt-2 leading-relaxed text-navy-500"><?= e($s['short']) ?></p>
            <span class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-900">Learn more <?= icon('ArrowRight', 'h-4 w-4 transition group-hover:translate-x-1') ?></span>
          </div>
        </a>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</section>
<?php endforeach; ?>
<?= cta() ?>
