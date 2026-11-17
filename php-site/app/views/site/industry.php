<?php
defined('BRITECH') || exit;
/** @var array $industry */
$ind = $industry;
$related = array_values(array_filter(array_map(fn ($slug) => find_by_slug(data('services'), $slug), $ind['related'])));
?>
<section class="relative overflow-hidden border-b border-navy-100 bg-navy-50/50">
  <div class="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_left,black,transparent_70%)]"></div>
  <div class="<?= CONTAINER ?> relative py-16 sm:py-20">
    <a href="/industries" class="inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-900"><?= icon('ArrowLeft', 'h-4 w-4') ?> All industries</a>
    <div class="mt-6 flex animate-fade-up flex-col gap-6 lg:flex-row lg:items-center">
      <span class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-xl"><?= icon($ind['icon'], 'h-8 w-8') ?></span>
      <div>
        <?= eyebrow('Industry') ?>
        <h1 class="mt-3 text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl"><?= e($ind['title']) ?></h1>
      </div>
    </div>
    <p class="mt-6 max-w-3xl text-lg leading-relaxed text-navy-600"><?= e($ind['intro']) ?></p>
  </div>
</section>

<section class="py-16 sm:py-20">
  <div class="<?= CONTAINER ?> grid gap-6 lg:grid-cols-2">
    <div class="rounded-3xl border border-navy-100 p-8">
      <h2 class="text-2xl font-bold text-navy-900">Challenges we address</h2>
      <ul class="mt-6 space-y-4">
        <?php foreach ($ind['challenges'] as $c): ?>
        <li class="flex gap-3 text-navy-600"><?= icon('AlertCircle', 'mt-0.5 h-5 w-5 shrink-0 text-navy-300') ?> <?= e($c) ?></li>
        <?php endforeach; ?>
      </ul>
    </div>
    <div class="rounded-3xl bg-navy-900 p-8 text-white">
      <h2 class="text-2xl font-bold">How Britech helps</h2>
      <ul class="mt-6 space-y-4">
        <?php foreach ($ind['help'] as $h): ?>
        <li class="flex gap-3 text-navy-100"><?= icon('CheckCircle2', 'mt-0.5 h-5 w-5 shrink-0 text-white') ?> <?= e($h) ?></li>
        <?php endforeach; ?>
      </ul>
    </div>
  </div>
</section>

<section class="border-t border-navy-100 py-16 sm:py-20">
  <div class="<?= CONTAINER ?>">
    <h2 class="text-2xl font-bold text-navy-900">Related solutions</h2>
    <div class="mt-8 grid gap-5 md:grid-cols-3">
      <?php foreach ($related as $s): ?>
      <a href="/solutions/<?= e($s['slug']) ?>" class="group rounded-2xl border border-navy-100 p-6 transition hover:border-mint-300 hover:shadow-lg">
        <?= icon($s['icon'], 'h-6 w-6 text-navy-900') ?>
        <h3 class="mt-4 font-semibold text-navy-900"><?= e($s['title']) ?></h3>
        <span class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-mint-700">Learn more <?= icon('ArrowRight', 'h-4 w-4 transition group-hover:translate-x-1') ?></span>
      </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?= cta() ?>
