<?php
defined('BRITECH') || exit;
/** @var bool $sent @var ?string $error @var array $old */
$s = settings();
$phones = array_values(array_filter([$s['phone1'], $s['phone2']]));
$cards = [
    ['MapPin', 'Visit us', [[$s['address'], null]]],
    ['Mail', 'Email us', [[$s['email'], 'mailto:' . $s['email']]]],
    ['Phone', 'Call us', array_map(fn ($p) => [$p, tel_href($p)], $phones)],
];
$input = 'w-full rounded-lg border border-navy-200 bg-white px-4 py-3 text-navy-900 placeholder:text-navy-300 outline-none transition focus:border-mint-500 focus:ring-4 focus:ring-mint-500/15';
$v = fn (string $k) => e($old[$k] ?? '');
?>
<?= page_hero('Contact', 'Let’s build something brilliant', 'Tell us about your goals and our team will help you find the right solution, from a quick consultation to full-scale delivery.') ?>
<section class="py-20 sm:py-24">
  <div class="<?= CONTAINER ?> grid gap-10 lg:grid-cols-5">
    <div class="space-y-4 lg:col-span-2">
      <?php foreach ($cards as [$ic, $title, $lines]): ?>
      <div class="flex gap-4 rounded-2xl border border-navy-100 p-5">
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-900"><?= icon($ic, 'h-5 w-5') ?></span>
        <div class="min-w-0">
          <h2 class="font-semibold text-navy-900"><?= e($title) ?></h2>
          <?php foreach ($lines as [$text, $href]): ?>
            <?php if ($href): ?>
            <a href="<?= e($href) ?>" class="block break-words text-navy-500 hover:text-mint-600"><?= e($text) ?></a>
            <?php else: ?>
            <p class="text-navy-500"><?= e($text) ?></p>
            <?php endif; ?>
          <?php endforeach; ?>
        </div>
      </div>
      <?php endforeach; ?>
      <div class="overflow-hidden rounded-2xl border border-navy-100">
        <iframe title="Britech Solutions location" src="https://www.google.com/maps?q=<?= rawurlencode($s['address'] ?: 'Arusha, Tanzania') ?>&amp;output=embed" class="h-64 w-full" loading="lazy"></iframe>
      </div>
    </div>

    <div id="form" class="scroll-mt-28 rounded-3xl border border-navy-100 bg-white p-6 shadow-xl shadow-navy-900/5 sm:p-10 lg:col-span-3">
      <h2 class="text-2xl font-bold text-navy-900">Get in Touch</h2>
      <p class="mb-8 mt-2 text-navy-500">Fill in the form and we’ll get back to you shortly.</p>

      <?php if ($sent): ?>
      <div role="status" class="rounded-2xl bg-mint-50 p-8 text-center">
        <?= icon('CheckCircle2', 'mx-auto h-12 w-12 text-navy-900') ?>
        <h3 class="mt-4 text-xl font-semibold text-navy-900">Thank you. We’ve received your message.</h3>
        <p class="mt-2 text-navy-600">Our team will get back to you shortly.</p>
      </div>
      <?php else: ?>
      <form method="post" action="/contact#form" data-pending-form class="grid gap-5 sm:grid-cols-2">
        <?php if ($error): ?>
        <p role="alert" class="flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2"><?= icon('AlertCircle', 'mt-0.5 h-4 w-4 shrink-0') ?> <?= e($error) ?></p>
        <?php endif; ?>
        <input type="hidden" name="t" value="<?= e(form_token()) ?>">
        <!-- Honeypot: hidden from people, tempting for bots -->
        <div aria-hidden="true" class="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
        </div>

        <label class="block">
          <span class="mb-1.5 block text-sm font-medium text-navy-700">First name</span>
          <input name="firstName" required maxlength="80" autocomplete="given-name" value="<?= $v('firstName') ?>" class="<?= $input ?>">
        </label>
        <label class="block">
          <span class="mb-1.5 block text-sm font-medium text-navy-700">Last name</span>
          <input name="lastName" required maxlength="80" autocomplete="family-name" value="<?= $v('lastName') ?>" class="<?= $input ?>">
        </label>
        <label class="block sm:col-span-2">
          <span class="mb-1.5 block text-sm font-medium text-navy-700">Company / Organization <span class="font-normal text-navy-400">(optional)</span></span>
          <input name="company" maxlength="160" autocomplete="organization" value="<?= $v('company') ?>" class="<?= $input ?>">
        </label>
        <label class="block">
          <span class="mb-1.5 block text-sm font-medium text-navy-700">Email</span>
          <input name="email" type="email" required maxlength="191" autocomplete="email" value="<?= $v('email') ?>" class="<?= $input ?>" placeholder="you@company.com">
        </label>
        <label class="block">
          <span class="mb-1.5 block text-sm font-medium text-navy-700">Phone <span class="font-normal text-navy-400">(optional)</span></span>
          <input name="phone" type="tel" maxlength="40" autocomplete="tel" value="<?= $v('phone') ?>" class="<?= $input ?>" placeholder="+255 …">
        </label>
        <label class="block sm:col-span-2">
          <span class="mb-1.5 block text-sm font-medium text-navy-700">How can we help you?</span>
          <select name="service" required class="<?= $input ?>">
            <option value="" disabled<?= ($old['service'] ?? '') === '' ? ' selected' : '' ?>>Select an option</option>
            <?php foreach (data('inquiryServices') as $o): ?>
            <option<?= ($old['service'] ?? '') === $o ? ' selected' : '' ?>><?= e($o) ?></option>
            <?php endforeach; ?>
          </select>
        </label>
        <label class="block sm:col-span-2">
          <span class="mb-1.5 block text-sm font-medium text-navy-700">Message</span>
          <textarea name="message" required minlength="10" maxlength="5000" rows="5" class="<?= $input ?>" placeholder="Tell us about your project…"><?= $v('message') ?></textarea>
        </label>
        <div class="sm:col-span-2">
          <button type="submit" data-pending-label="Sending…" class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy-900 px-6 py-3.5 font-semibold text-white shadow-lg shadow-navy-900/20 transition hover:bg-navy-800 disabled:opacity-60 sm:w-auto">
            <?= icon('Send', 'h-4 w-4') ?> <span>Send Message</span>
          </button>
        </div>
      </form>
      <?php endif; ?>
    </div>
  </div>
</section>
