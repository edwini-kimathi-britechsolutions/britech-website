<?php
defined('BRITECH') || exit;
/** @var array $service */
$others = array_slice(array_values(array_filter(data('services'), fn ($s) => $s['slug'] !== $service['slug'])), 0, 3);
$delivery = data('serviceProcess')[$service['slug']] ?? null;
?>
<section class="relative overflow-hidden border-b border-navy-100 bg-navy-50/50">
  <div class="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_left,black,transparent_70%)]"></div>
  <div class="<?= CONTAINER ?> relative py-16 sm:py-20">
    <a href="/solutions" class="inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-900"><?= icon('ArrowLeft', 'h-4 w-4') ?> All solutions</a>
    <div class="mt-6 flex animate-fade-up flex-col gap-6 lg:flex-row lg:items-center">
      <span class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-xl"><?= icon($service['icon'], 'h-8 w-8') ?></span>
      <div>
        <?= eyebrow('Solution') ?>
        <h1 class="mt-3 text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl"><?= e($service['title']) ?></h1>
      </div>
    </div>
    <p class="mt-6 max-w-3xl text-xl font-medium text-navy-600"><?= e($service['headline']) ?></p>
  </div>
</section>

<section class="py-16 sm:py-20">
  <div class="<?= CONTAINER ?> grid gap-12 lg:grid-cols-3">
    <div class="space-y-5 text-lg leading-relaxed text-navy-600 lg:col-span-2">
      <?php foreach ($service['intro'] as $p): ?><p><?= e($p) ?></p><?php endforeach; ?>
    </div>
    <aside class="h-fit rounded-2xl bg-navy-900 p-7 text-white">
      <h2 class="text-lg font-semibold">Talk to an expert</h2>
      <p class="mt-2 text-sm text-navy-200">Tell us about your project and we’ll get back to you shortly.</p>
      <a href="<?= e(contact_for_solution($service['slug'])) ?>" class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-mint-500 px-4 py-3 font-semibold text-navy-950 transition hover:bg-mint-400">Schedule a Consultation <?= icon('ArrowRight', 'h-4 w-4') ?></a>
    </aside>
  </div>
</section>

<section class="border-y border-navy-100 bg-navy-50/40 py-16 sm:py-20">
  <div class="<?= CONTAINER ?>">
    <h2 class="text-3xl font-bold tracking-tight text-navy-900">What we deliver</h2>
    <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <?php foreach ($service['features'] as $f): ?>
      <div class="rounded-2xl border border-navy-100 bg-white p-6">
        <?= icon('CheckCircle2', 'h-6 w-6 text-navy-900') ?>
        <h3 class="mt-4 font-semibold text-navy-900"><?= e($f['title']) ?></h3>
        <p class="mt-2 text-navy-500"><?= e($f['text']) ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<?php if ($delivery): ?>
<section class="py-16 sm:py-20">
  <div class="<?= CONTAINER ?> grid gap-12 lg:grid-cols-5">
    <div class="lg:col-span-3">
      <h2 class="text-3xl font-bold tracking-tight text-navy-900">Our approach</h2>
      <ol class="mt-8 space-y-4">
        <?php foreach ($delivery['approach'] as $i => $step): ?>
        <li class="flex items-center gap-4 rounded-2xl border border-navy-100 p-5">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-white"><?= $i + 1 ?></span>
          <span class="font-medium text-navy-800"><?= e($step) ?></span>
        </li>
        <?php endforeach; ?>
      </ol>
    </div>
    <div class="lg:col-span-2">
      <h2 class="text-3xl font-bold tracking-tight text-navy-900">What you receive</h2>
      <ul class="mt-8 space-y-3 rounded-2xl bg-navy-50/70 p-6">
        <?php foreach ($delivery['deliverables'] as $d): ?>
        <li class="flex items-center gap-3 text-navy-700"><?= icon('FileCheck2', 'h-5 w-5 shrink-0 text-navy-900') ?> <?= e($d) ?></li>
        <?php endforeach; ?>
      </ul>
    </div>
  </div>
</section>
<?php endif; ?>

<section class="py-16 sm:py-20 <?= $delivery ? 'border-t border-navy-100' : '' ?>">
  <div class="<?= CONTAINER ?>">
    <h2 class="text-2xl font-bold text-navy-900">Explore other solutions</h2>
    <div class="mt-8 grid gap-5 md:grid-cols-3">
      <?php foreach ($others as $s): ?>
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
