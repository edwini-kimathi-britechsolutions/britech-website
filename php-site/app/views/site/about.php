<?php defined('BRITECH') || exit; ?>
<?= page_hero('About Britech', 'Seven years of growth, innovation & impact', 'We were founded with a mission to solve real-world challenges through technology — delivering digital solutions that transform institutions, empower communities, and shape a better future.') ?>

<section class="py-20 sm:py-24">
  <div class="<?= CONTAINER ?> grid items-center gap-14 lg:grid-cols-2">
    <div>
      <?= section_heading('Who we are', 'Innovation, trust, and impact', '', false) ?>
      <div class="mt-6 space-y-4 text-lg leading-relaxed text-navy-500">
        <p>Britech Solutions is proud to mark seven years of growth, innovation, and impact. It has been an inspiring journey filled with accomplishments, valuable lessons, and milestones that reflect our resilience, creativity, and shared purpose.</p>
        <p>We extend our heartfelt appreciation to every member of the Britech team, our clients, technology partners, and stakeholders. Your trust, support, and collaboration have been the cornerstone of our progress.</p>
        <p>We have refreshed our brand identity to reflect our future-forward vision — a palette that symbolizes clarity, intelligence, and transformation.</p>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-navy-100 bg-navy-100">
      <?php foreach (data('stats') as $st): ?>
      <div class="bg-white p-8">
        <?= count_up($st['value'], 'block text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl') ?>
        <p class="mt-2 text-navy-500"><?= e($st['label']) ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="py-20 sm:py-24">
  <div class="<?= CONTAINER ?> grid gap-6 md:grid-cols-2">
    <?php foreach ([
        ['Target', 'Our mission', 'To deliver secure and innovative digital systems that transform operations, empower users, and build resilient institutions.'],
        ['Eye', 'Our vision', 'To become Africa’s most trusted digital transformation and cybersecurity solutions provider by 2030.'],
    ] as [$ic, $title, $text]): ?>
    <div class="rounded-3xl border border-navy-100 bg-white p-8 sm:p-10">
      <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-mint-50 text-mint-700"><?= icon($ic, 'h-6 w-6') ?></span>
      <h2 class="mt-5 text-2xl font-bold text-navy-900"><?= e($title) ?></h2>
      <p class="mt-3 text-lg leading-relaxed text-navy-600"><?= e($text) ?></p>
    </div>
    <?php endforeach; ?>
  </div>
</section>

<section class="pb-20 sm:pb-24">
  <div class="<?= CONTAINER ?>">
    <?= section_heading('How we work', 'From discovery to handover', 'We combine strategic insight, technical capability, cybersecurity awareness, and local context — with accountability from inception to handover.', false) ?>
    <ol class="mt-12 grid gap-px overflow-hidden rounded-3xl border border-navy-100 bg-navy-100 sm:grid-cols-2 lg:grid-cols-4">
      <?php foreach (data('engagementProcess') as $i => $step): ?>
      <li class="bg-white p-7">
        <span class="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-mint-400"><?= $i + 1 ?></span>
        <h3 class="mt-5 font-semibold text-navy-900"><?= e($step['title']) ?></h3>
        <p class="mt-2 text-sm leading-relaxed text-navy-500"><?= e($step['text']) ?></p>
      </li>
      <?php endforeach; ?>
    </ol>
  </div>
</section>

<section class="border-y border-navy-100 bg-navy-50/50 py-20 sm:py-24">
  <div class="<?= CONTAINER ?>">
    <?= section_heading('At a glance', 'What sets Britech apart') ?>
    <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <?php foreach (data('highlights') as $h): ?>
      <div class="rounded-2xl border border-navy-100 bg-white p-7">
        <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-mint-400"><?= icon($h['icon'], 'h-6 w-6') ?></span>
        <h3 class="mt-5 text-lg font-semibold text-navy-900"><?= e($h['title']) ?></h3>
        <p class="mt-2 leading-relaxed text-navy-500"><?= e($h['text']) ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="py-20 sm:py-24">
  <div class="<?= CONTAINER ?>">
    <?= section_heading('Our values', 'What we stand for') ?>
    <div class="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
      <?php foreach (data('values') as $v): ?>
      <div class="border-t-2 border-navy-100 pt-5">
        <h3 class="text-lg font-semibold text-navy-900"><?= e($v['title']) ?></h3>
        <p class="mt-2 text-sm leading-relaxed text-navy-500"><?= e($v['text']) ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="pb-8">
  <div class="<?= CONTAINER ?>">
    <div class="rounded-3xl bg-navy-900 p-8 sm:p-12">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-mint-400">Our team</p>
      <p class="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">“Run it like you own it.”</p>
      <p class="mt-5 max-w-3xl text-lg leading-relaxed text-navy-200">The key to our success lies in our passionate, professional, and highly skilled team, which brings together years of experience across transformative projects. Our team blends youthful energy and innovation with the depth and wisdom of seasoned experts — united by a shared vision, creativity, and purpose.</p>
    </div>
  </div>
</section>

<section class="py-16">
  <div class="<?= CONTAINER ?>"><p class="mb-6 text-center text-sm font-medium text-navy-400">Technology partners we work with</p></div>
  <?= partner_marquee() ?>
</section>

<?= cta() ?>
