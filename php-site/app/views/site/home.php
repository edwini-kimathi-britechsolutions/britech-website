<?php
defined('BRITECH') || exit;
/** @var array $partners @var int $partnerTotal @var array $products @var array $testimonials @var array $posts */
$s = settings();
$services = data('services');
$shortName = [
    'mobile-software-development' => 'Apps',
    'ai-powered-digital-transformation' => 'AI',
    'training-support-capacity-building' => 'Training',
    'enterprise-software-erp-development' => 'ERP',
    'business-intelligence-services' => 'BI',
    'cybersecurity-it-audit' => 'Security',
    'digital-strategy-it-consulting' => 'Strategy',
];
/** Position n items evenly on a circle (percent coords, starting at 12 o'clock). */
$onCircle = function (int $i, int $n): string {
    $a = ($i / $n) * M_PI * 2 - M_PI / 2;
    return sprintf('left:%.4F%%;top:%.4F%%', 50 + 50 * cos($a), 50 + 50 * sin($a));
};
$words = ['software', 'security', 'dashboards', 'AI systems', 'ERP'];
$heroLogos = array_slice($partners, 0, 5);
?>
<!-- HERO -->
<section class="relative overflow-hidden border-b border-navy-100 bg-gradient-to-br from-white via-white to-mint-50/60">
  <div class="absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,black_20%,transparent_75%)]">
    <canvas data-network aria-hidden="true" class="pointer-events-none h-full w-full"></canvas>
  </div>
  <div class="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] animate-blob rounded-full bg-mint-200/40 blur-3xl"></div>

  <div class="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:px-8 lg:pb-24">
    <div>
      <p class="flex animate-fade-up items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-mint-700"><span class="h-px w-10 bg-mint-500"></span>Driven by Innovation</p>

      <h1 class="mt-6 animate-fade-up text-5xl font-extrabold leading-[1.08] tracking-tight text-navy-900 [animation-delay:100ms] sm:text-6xl lg:text-[68px]">
        Building smart<br>
        <span data-rotating class="relative inline-grid pb-2">
          <?php foreach ($words as $n => $w): ?>
          <span data-word<?= $n ? ' aria-hidden="true"' : '' ?> class="text-gradient col-start-1 row-start-1 whitespace-nowrap transition-all duration-500 ease-out <?= $n === 0 ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0' ?>"><?= e($w) ?></span>
          <?php endforeach; ?>
          <span data-underline aria-hidden="true" class="absolute bottom-0 left-0 h-1.5 w-24 origin-left animate-underline rounded-full bg-mint-500 sm:w-32"></span>
        </span><br>
        for Africa &amp; beyond.
      </h1>

      <p class="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-navy-500 [animation-delay:200ms]">Britech Solutions designs, builds and secures the digital systems that businesses, governments and NGOs run on — from mobile apps and ERP to cybersecurity and data intelligence.</p>

      <div class="mt-9 flex animate-fade-up flex-wrap gap-3 [animation-delay:300ms]">
        <?= button_link('/contact', 'Start a Project') ?>
        <?= button_link('/solutions', 'Explore Solutions', 'secondary') ?>
      </div>

      <?php if ($heroLogos): ?>
      <div class="mt-10 animate-fade-up [animation-delay:400ms]">
        <p class="text-sm font-medium text-navy-500">Trusted by public institutions, NGOs and businesses</p>
        <ul class="mt-3 flex flex-wrap items-center gap-2">
          <?php foreach ($heroLogos as $l): ?>
          <li title="<?= e($l['name']) ?>" class="flex h-11 items-center rounded-lg border border-navy-100 bg-white/90 px-3 shadow-sm">
            <img src="<?= e($l['logo']) ?>" alt="<?= e($l['name']) ?>" width="90" height="32" class="h-7 w-auto max-w-[84px] object-contain">
          </li>
          <?php endforeach; ?>
        </ul>
      </div>
      <?php endif; ?>
    </div>

    <div class="animate-fade-up [animation-delay:250ms]">
      <!-- Britech mark at the centre with every service in orbit — "one partner, every capability". -->
      <div class="relative mx-auto aspect-square w-full max-w-[520px]">
        <div class="absolute inset-[18%] rounded-full bg-mint-300/30 blur-3xl"></div>

        <div class="absolute inset-[7%] animate-orbit rounded-full border border-dashed border-navy-200">
          <?php foreach ($services as $i => $sv): ?>
          <div class="absolute -translate-x-1/2 -translate-y-1/2" style="<?= $onCircle($i, count($services)) ?>">
            <div class="animate-orbit-reverse">
              <div class="flex flex-col items-center gap-1.5">
                <span class="flex h-11 w-11 items-center justify-center rounded-2xl border border-navy-100 bg-white text-navy-800 shadow-lg shadow-navy-900/10 sm:h-14 sm:w-14"><?= icon($sv['icon'], 'h-5 w-5 text-mint-700 sm:h-6 sm:w-6') ?></span>
                <span class="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-navy-700 shadow-sm sm:text-xs"><?= e($shortName[$sv['slug']] ?? $sv['title']) ?></span>
              </div>
            </div>
          </div>
          <?php endforeach; ?>
        </div>

        <div class="absolute inset-[29%] animate-orbit-reverse-slow rounded-full border border-navy-100 bg-white/40 backdrop-blur-[2px]">
          <?php foreach (['Cloud', 'Database', 'Cpu'] as $i => $ic): ?>
          <div class="absolute -translate-x-1/2 -translate-y-1/2" style="<?= $onCircle($i, 3) ?>">
            <div class="animate-orbit-slow"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-mint-400 shadow-md sm:h-9 sm:w-9"><?= icon($ic, 'h-4 w-4') ?></span></div>
          </div>
          <?php endforeach; ?>
        </div>

        <div class="absolute inset-0 flex items-center justify-center">
          <span class="absolute h-[26%] w-[26%] animate-ping-slow rounded-3xl bg-mint-400/30"></span>
          <div class="relative flex h-[26%] w-[26%] items-center justify-center rounded-3xl border border-navy-100 bg-white shadow-2xl shadow-navy-900/15">
            <img src="/images/mark.png" alt="Britech Solutions" width="120" height="120" class="h-3/5 w-3/5 object-contain">
          </div>
        </div>

        <div class="absolute -left-[4%] top-0 hidden animate-pop-in sm:block [animation-delay:900ms]">
          <div class="flex animate-float items-center gap-3 rounded-xl border-l-4 border-mint-500 bg-white px-4 py-3 shadow-xl shadow-navy-900/10">
            <?= icon('ShieldCheck', 'h-5 w-5 text-mint-700') ?>
            <div><p class="text-sm font-semibold text-navy-900">Systems secured</p><p class="text-xs text-navy-400">ISO 27001 · NIST aligned</p></div>
          </div>
        </div>
        <div class="absolute -right-[6%] top-[70%] hidden animate-pop-in sm:block [animation-delay:1300ms]">
          <div class="flex animate-float items-center gap-3 rounded-xl border-l-4 border-navy-900 bg-white px-4 py-3 shadow-xl shadow-navy-900/10 [animation-delay:-3s]">
            <?= icon('BarChart3', 'h-5 w-5 text-navy-700') ?>
            <div><p class="text-sm font-semibold text-navy-900">Insights in real time</p><p class="text-xs text-navy-400">Power BI · GIS dashboards</p></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- STATS -->
<section class="border-b border-navy-100 bg-white">
  <div class="<?= CONTAINER ?> grid grid-cols-2 gap-y-8 py-12 lg:grid-cols-4">
    <?php foreach (data('stats') as $i => $st): ?>
    <div class="px-2 <?= $i > 0 ? 'lg:border-l lg:border-navy-100 lg:pl-8' : '' ?>">
      <?= count_up($st['value'], 'block text-4xl font-bold tracking-tight text-navy-900') ?>
      <p class="mt-1 text-navy-500"><?= e($st['label']) ?></p>
    </div>
    <?php endforeach; ?>
  </div>
</section>

<?php if ($partners): ?>
<!-- CLIENTS & PARTNERS -->
<section class="py-20 sm:py-24">
  <div class="<?= CONTAINER ?>">
    <div class="grid items-end gap-6 lg:grid-cols-2">
      <?= section_heading('Trusted by', 'Clients &amp; partners across Tanzania', '', false) ?>
      <p class="text-lg text-navy-500 lg:pb-2">We work alongside public institutions, conservation bodies, businesses and development organizations.</p>
    </div>
    <div class="mt-12"><?= partner_logos($partners, false, 8) ?></div>
    <div class="mt-8 text-center">
      <a href="/clients" class="inline-flex items-center gap-1 font-semibold text-mint-700 hover:text-mint-600"><?= $partnerTotal > 8 ? 'View all ' . $partnerTotal . ' clients &amp; partners' : 'View all clients &amp; partners' ?><?= icon('ArrowRight', 'h-4 w-4') ?></a>
    </div>
  </div>
</section>
<?php endif; ?>

<!-- SERVICES -->
<section class="bg-navy-50/50 py-20 sm:py-28">
  <div class="<?= CONTAINER ?>">
    <div class="grid items-end gap-6 lg:grid-cols-2">
      <?= section_heading('What we do', 'Our core services', '', false) ?>
      <p class="text-lg text-navy-500 lg:pb-2">End-to-end technology services that help organizations build, secure, and scale their digital operations.</p>
    </div>
    <!-- Swipeable row on phones, grid from tablet up -->
    <div class="-mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
      <?php foreach ($services as $i => $sv): ?>
      <div data-reveal style="transition-delay:<?= ($i % 4) * 80 ?>ms" class="w-[82%] shrink-0 snap-start sm:w-auto">
        <a href="/solutions/<?= e($sv['slug']) ?>" class="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 transition hover:border-mint-300 hover:shadow-lg hover:shadow-navy-900/5">
          <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-mint-400 transition group-hover:bg-mint-500 group-hover:text-navy-950"><?= icon($sv['icon'], 'h-5 w-5') ?></span>
          <h3 class="mt-5 font-semibold text-navy-900"><?= e($sv['title']) ?></h3>
          <p class="mt-2 flex-1 text-sm leading-relaxed text-navy-500"><?= e($sv['short']) ?></p>
          <span class="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-mint-700">Learn more <?= icon('ArrowRight', 'h-4 w-4 transition group-hover:translate-x-1') ?></span>
        </a>
      </div>
      <?php endforeach; ?>
      <div data-reveal style="transition-delay:240ms" class="w-[82%] shrink-0 snap-start sm:w-auto">
        <div class="flex h-full flex-col rounded-2xl bg-navy-900 p-6 text-white">
          <h3 class="text-lg font-semibold">Not sure where to start?</h3>
          <p class="mt-2 flex-1 text-sm leading-relaxed text-navy-200">Tell us what you’re trying to achieve and we’ll recommend the right approach.</p>
          <a href="<?= e(contact_href(null, 'I’d like to book a consultation.')) ?>" class="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-mint-500 px-4 py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-mint-400">Book a consultation <?= icon('ArrowRight', 'h-4 w-4') ?></a>
          <a href="<?= e(tel_href($s['phone1'])) ?>" class="mt-3 inline-flex items-center justify-center gap-2 text-sm text-navy-200 hover:text-white"><?= icon('Phone', 'h-3.5 w-3.5') ?> <?= e($s['phone1']) ?></a>
        </div>
      </div>
    </div>
  </div>
</section>

<?php if ($products): ?>
<!-- PRODUCTS -->
<section class="py-20 sm:py-28">
  <div class="<?= CONTAINER ?>">
    <?= section_heading('Built by Britech', 'Our flagship products &amp; systems', 'Platforms we’ve designed, built and support — for operations, results management, logistics and messaging.') ?>
    <div class="mt-12" data-tabs>
      <div class="mx-auto flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-2xl border border-navy-100 bg-navy-50/60 p-1 sm:rounded-full" role="tablist">
        <?php foreach ($products as $i => $p): ?>
        <button type="button" role="tab" id="tab-<?= e($p['slug']) ?>" aria-controls="panel-<?= e($p['slug']) ?>" aria-selected="<?= $i === 0 ? 'true' : 'false' ?>" data-tab="<?= $i ?>"
          class="shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition <?= $i === 0 ? 'bg-white text-navy-900 shadow ring-1 ring-navy-100' : 'text-navy-500 hover:text-navy-900' ?>"><?= e($p['name']) ?></button>
        <?php endforeach; ?>
      </div>
      <?php foreach ($products as $i => $p): ?>
      <div role="tabpanel" id="panel-<?= e($p['slug']) ?>" aria-labelledby="tab-<?= e($p['slug']) ?>" data-panel="<?= $i ?>" class="<?= $i === 0 ? '' : 'hidden ' ?>mt-10 grid animate-fade-up items-center gap-10 rounded-3xl border border-navy-100 bg-white p-6 shadow-xl shadow-navy-900/5 sm:p-10 lg:grid-cols-2">
        <div>
          <span class="text-sm font-semibold uppercase tracking-wider text-mint-700"><?= e($p['tagline']) ?></span>
          <h3 class="mt-2 text-3xl font-bold text-navy-900 sm:text-4xl"><?= e($p['name']) ?></h3>
          <p class="mt-4 leading-relaxed text-navy-500"><?= e($p['description']) ?></p>
          <div class="mt-8 flex flex-wrap items-center gap-4">
            <?= button_link(contact_for_product($p), 'Request a Demo') ?>
            <?php if ($p['url']): ?>
            <a href="<?= e($p['url']) ?>" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 font-semibold text-mint-700 hover:text-mint-600">Visit <?= e($p['name']) ?> <?= icon('ArrowUpRight', 'h-4 w-4') ?></a>
            <?php endif; ?>
          </div>
        </div>
        <?= product_panel($p) ?>
      </div>
      <?php endforeach; ?>
    </div>
    <div class="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3">
      <a href="/products" class="inline-flex items-center gap-1 font-semibold text-mint-700 hover:text-mint-600">All products <?= icon('ArrowRight', 'h-4 w-4') ?></a>
      <a href="/our-work" class="inline-flex items-center gap-1 font-semibold text-navy-600 hover:text-navy-900">See our client work <?= icon('ArrowRight', 'h-4 w-4') ?></a>
    </div>
  </div>
</section>
<?php endif; ?>

<!-- TECHNOLOGY PARTNERS -->
<section class="border-y border-navy-100 bg-white py-10">
  <p class="mb-6 text-center text-sm font-medium text-navy-400">Technology partners we build with</p>
  <?= partner_marquee() ?>
</section>

<!-- INDUSTRIES -->
<section class="bg-navy-50/50 py-20 sm:py-28">
  <div class="<?= CONTAINER ?>">
    <div class="grid items-end gap-6 lg:grid-cols-2">
      <?= section_heading('Who we serve', 'Solutions across multiple sectors', '', false) ?>
      <p class="text-lg text-navy-500 lg:pb-2">Our systems power institutions in agriculture, health, education, conservation, finance and governance.</p>
    </div>
    <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <?php foreach (data('industries') as $i => $ind): ?>
      <div data-reveal style="transition-delay:<?= ($i % 4) * 80 ?>ms">
        <a href="/industries/<?= e($ind['slug']) ?>" class="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 transition hover:border-mint-300 hover:shadow-lg hover:shadow-navy-900/5">
          <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-mint-50 text-mint-700"><?= icon($ind['icon'], 'h-5 w-5') ?></span>
          <h3 class="mt-5 font-semibold text-navy-900"><?= e($ind['title']) ?></h3>
          <p class="mt-2 flex-1 text-sm leading-relaxed text-navy-500"><?= e($ind['short']) ?></p>
          <?= icon('ArrowRight', 'mt-4 h-4 w-4 text-mint-700 transition group-hover:translate-x-1') ?>
        </a>
      </div>
      <?php endforeach; ?>
      <div data-reveal style="transition-delay:240ms">
        <a href="/industries" class="group flex h-full flex-col justify-between rounded-2xl border border-dashed border-navy-200 p-6 transition hover:border-mint-400 hover:bg-white">
          <p class="font-semibold text-navy-900">Don’t see your sector?</p>
          <p class="mt-2 text-sm text-navy-500">Our solutions adapt to any organization.</p>
          <span class="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-mint-700">All industries <?= icon('ArrowRight', 'h-4 w-4 transition group-hover:translate-x-1') ?></span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- HOW WE WORK -->
<section class="py-20 sm:py-28">
  <div class="<?= CONTAINER ?>">
    <div class="grid items-end gap-6 lg:grid-cols-2">
      <?= section_heading('How we work', 'From discovery to handover', '', false) ?>
      <p class="text-lg text-navy-500 lg:pb-2">A clear, accountable process — so you always know what happens next, and your team can run the system after we hand it over.</p>
    </div>
    <ol class="relative mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      <span aria-hidden="true" class="absolute left-5 right-5 top-5 hidden h-px bg-gradient-to-r from-mint-400 via-navy-200 to-navy-100 lg:block"></span>
      <?php foreach (data('engagementProcess') as $i => $step): ?>
      <li class="relative">
        <span class="relative flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-mint-400 ring-4 ring-white"><?= $i + 1 ?></span>
        <h3 class="mt-5 font-semibold text-navy-900"><?= e($step['title']) ?></h3>
        <p class="mt-2 text-sm leading-relaxed text-navy-500"><?= e($step['text']) ?></p>
      </li>
      <?php endforeach; ?>
    </ol>
  </div>
</section>

<?php if ($testimonials): ?>
<!-- TESTIMONIALS -->
<section class="bg-navy-950 py-20 text-white sm:py-28">
  <div class="<?= CONTAINER ?>">
    <p class="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-mint-400"><span class="h-px w-8 bg-mint-400"></span> What clients say</p>
    <h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">In our clients’ words</h2>
    <?php $tc = count($testimonials); ?>
    <div class="mt-12 grid gap-5 <?= $tc === 1 ? 'max-w-3xl' : ($tc === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3') ?>">
      <?php foreach ($testimonials as $t): ?>
      <figure class="flex h-full flex-col rounded-2xl bg-white/[0.05] p-7 ring-1 ring-white/10">
        <?= icon('Quote', 'h-6 w-6 text-mint-400') ?>
        <blockquote class="mt-4 flex-1 text-lg leading-relaxed text-navy-100">“<?= e($t['quote']) ?>”</blockquote>
        <figcaption class="mt-6 flex items-center gap-3">
          <?php if ($t['photo']): ?>
          <img src="<?= e($t['photo']) ?>" alt="" width="44" height="44" loading="lazy" class="h-11 w-11 rounded-full object-cover">
          <?php else: ?>
          <span class="flex h-11 w-11 items-center justify-center rounded-full bg-mint-500 font-bold text-navy-950"><?= e(mb_substr($t['name'], 0, 1)) ?></span>
          <?php endif; ?>
          <span>
            <span class="block font-semibold"><?= e($t['name']) ?></span>
            <span class="block text-sm text-navy-300"><?= e(implode(', ', array_filter([$t['role'], $t['organization']]))) ?></span>
          </span>
        </figcaption>
      </figure>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<!-- WHO WE ARE -->
<section class="py-20 sm:py-28">
  <div class="<?= CONTAINER ?>">
    <div class="grid gap-8 lg:grid-cols-12 lg:items-end">
      <div class="lg:col-span-7"><?= section_heading('Who we are', 'Smart, secure, and scalable digital systems', '', false) ?></div>
      <div class="lg:col-span-5">
        <p class="text-lg leading-relaxed text-navy-500">Britech Solutions is a technology company in Arusha. For seven years we have helped public institutions, NGOs, and businesses simplify operations and achieve impact through technology.</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <?= button_link('/about', 'About Britech') ?>
          <?= button_link('/our-work', 'Our work', 'secondary') ?>
        </div>
      </div>
    </div>

    <div class="mt-14 grid gap-4 lg:grid-cols-4">
      <div data-reveal class="lg:col-span-2">
        <div class="relative h-full overflow-hidden rounded-3xl bg-navy-900 p-8 text-white sm:p-10">
          <div class="bg-grid-dark absolute inset-0 [mask-image:linear-gradient(to_bottom_left,black,transparent_70%)]"></div>
          <div class="relative">
            <span class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-mint-400"><?= icon('Target', 'h-4 w-4') ?> Mission</span>
            <p class="mt-6 text-2xl font-semibold leading-snug sm:text-[28px]">To deliver secure and innovative digital systems that transform operations, empower users, and build resilient institutions.</p>
          </div>
        </div>
      </div>

      <div data-reveal style="transition-delay:80ms" class="lg:col-span-2">
        <div class="flex h-full flex-col justify-between gap-6 rounded-3xl border border-mint-200 bg-mint-50 p-8 sm:p-10">
          <span class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-mint-700"><?= icon('Eye', 'h-4 w-4') ?> Vision</span>
          <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <p class="max-w-sm text-lg font-medium leading-relaxed text-navy-800">To become Africa’s most trusted digital transformation and cybersecurity solutions provider.</p>
            <p class="text-6xl font-extrabold tracking-tight text-mint-700 sm:text-7xl" aria-label="by 2030">2030</p>
          </div>
        </div>
      </div>

      <div data-reveal style="transition-delay:120ms" class="lg:col-span-2">
        <div class="h-full rounded-3xl border border-navy-100 bg-white p-8">
          <span class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-navy-500"><?= icon('Award', 'h-4 w-4 text-mint-700') ?> Credentials</span>
          <div class="mt-5 flex flex-wrap gap-2">
            <?php foreach (['PMP', 'CISA', 'ITIL', 'CISSP'] as $c): ?>
            <span class="rounded-lg bg-navy-900 px-3 py-1.5 text-sm font-bold text-mint-300"><?= $c ?></span>
            <?php endforeach; ?>
          </div>
          <p class="mt-5 flex items-start gap-2 text-navy-600"><?= icon('Globe', 'mt-0.5 h-4 w-4 shrink-0 text-mint-700') ?> Accredited .tz domain registrar, hosting nearly 200 domains.</p>
        </div>
      </div>

      <div data-reveal style="transition-delay:160ms" class="lg:col-span-2">
        <div class="h-full rounded-3xl border border-navy-100 bg-white p-8">
          <span class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-navy-500"><?= icon('Heart', 'h-4 w-4 text-mint-700') ?> What we stand for</span>
          <div class="mt-5 flex flex-wrap gap-2">
            <?php foreach (data('values') as $v): ?>
            <span class="rounded-full border border-navy-200 px-4 py-1.5 text-sm font-medium text-navy-700"><?= e($v['title']) ?></span>
            <?php endforeach; ?>
          </div>
          <p class="mt-5 text-navy-500">“Run it like you own it” — the mindset every Britech team member brings to client work.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<?php if ($posts): ?>
<!-- BLOG -->
<section class="border-t border-navy-100 bg-navy-50/50 py-20 sm:py-24">
  <div class="<?= CONTAINER ?>">
    <div class="flex flex-wrap items-end justify-between gap-6">
      <?= section_heading('From the blog', 'Latest insights', '', false) ?>
      <a href="/blog" class="inline-flex items-center gap-1 font-semibold text-mint-700 hover:text-mint-600">All articles <?= icon('ArrowRight', 'h-4 w-4') ?></a>
    </div>
    <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <?php foreach ($posts as $p) { echo post_card($p); } ?>
    </div>
  </div>
</section>
<?php endif; ?>

<?= cta() ?>
