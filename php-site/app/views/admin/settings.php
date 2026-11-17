<?php
defined('BRITECH') || exit;
/** @var array $values @var array $smtp @var array $msgs @var array $user @var string $form */
$contact = [['phone1', 'Main phone'], ['phone2', 'Second phone'], ['email', 'Email'], ['address', 'Address'], ['whatsapp', 'WhatsApp number (shows a chat button)']];
$social = [['linkedin', 'LinkedIn'], ['twitter', 'X (Twitter)'], ['facebook', 'Facebook'], ['instagram', 'Instagram'], ['youtube', 'YouTube']];
// After a failed SMTP save, show what was typed.
$sv = $form === 'smtp' && $msgs['smtp'][0]
    ? ['host' => input('smtp_host', 200), 'port' => input('smtp_port', 6), 'secure' => input('smtp_secure', 6) === 'true', 'user' => input('smtp_user', 200), 'from' => input('smtp_from', 200), 'notify' => input('notify_to', 500)]
    : ['host' => $smtp['host'], 'port' => (string) $smtp['port'], 'secure' => $smtp['secure'], 'user' => $smtp['user'], 'from' => $smtp['from'], 'notify' => implode(', ', $smtp['notifyTo'])];
?>
<div class="space-y-6">
  <form method="post" data-pending-form class="max-w-3xl space-y-6">
    <?= csrf_field() ?><input type="hidden" name="form" value="settings">
    <?= form_message(...$msgs['settings']) ?>
    <section class="rounded-xl border border-navy-100 bg-white p-6">
      <h2 class="font-semibold text-navy-900">Contact details</h2>
      <p class="text-sm text-navy-500">Shown in the header, footer, contact page and call-to-action sections.</p>
      <div class="mt-5 grid gap-5 sm:grid-cols-2">
        <?php foreach ($contact as [$k, $l]) { echo field($l, text_input($k, $values[$k])); } ?>
      </div>
    </section>
    <section class="rounded-xl border border-navy-100 bg-white p-6">
      <h2 class="font-semibold text-navy-900">Social media</h2>
      <p class="text-sm text-navy-500">Full links (https://…). Leave empty to hide the icon.</p>
      <div class="mt-5 grid gap-5 sm:grid-cols-2">
        <?php foreach ($social as [$k, $l]) { echo field($l, text_input($k, $values[$k], ['placeholder' => 'https://'])); } ?>
      </div>
    </section>
    <section class="rounded-xl border border-navy-100 bg-white p-6">
      <h2 class="font-semibold text-navy-900">Announcement bar</h2>
      <p class="text-sm text-navy-500">The thin bar above the menu. Leave the text empty to hide it.</p>
      <div class="mt-5 grid gap-5 sm:grid-cols-2">
        <?= field('Text', text_input('announcement_text', $values['announcement_text'], ['maxlength' => '140'])) ?>
        <?= field('Link', text_input('announcement_link', $values['announcement_link']), 'A page like /products#njiwa or a full https:// address') ?>
      </div>
    </section>
    <?= submit_button('Save settings') ?>
  </form>

  <div class="max-w-3xl space-y-4">
    <form method="post" data-pending-form id="smtp" class="space-y-5 rounded-xl border border-navy-100 bg-white p-6">
      <?= csrf_field() ?><input type="hidden" name="form" value="smtp">
      <div>
        <h2 class="font-semibold text-navy-900">Email notifications (SMTP)</h2>
        <p class="text-sm text-navy-500">Used to email the team when someone sends the contact form. On cPanel, use a mailbox from Email Accounts: host <strong>mail.yourdomain</strong>, port 465, SSL/TLS.</p>
      </div>
      <?= form_message(...$msgs['smtp']) ?>
      <div class="grid gap-5 sm:grid-cols-3">
        <div class="sm:col-span-2"><?= field('SMTP host', text_input('smtp_host', $sv['host'], ['autocomplete' => 'off']), 'e.g. mail.britechsolutions.co.tz, smtp.gmail.com') ?></div>
        <?= field('Port', text_input('smtp_port', $sv['port'], ['type' => 'number', 'min' => '1', 'max' => '65535', 'data-smtp-port' => ''])) ?>
      </div>
      <label class="block">
        <span class="mb-1.5 block text-sm font-medium text-navy-800">Security</span>
        <select name="smtp_secure" data-smtp-secure class="<?= INPUT_CLS ?>">
          <option value="false"<?= $sv['secure'] ? '' : ' selected' ?>>STARTTLS (usually port 587)</option>
          <option value="true"<?= $sv['secure'] ? ' selected' : '' ?>>SSL/TLS (usually port 465)</option>
        </select>
      </label>
      <div class="grid gap-5 sm:grid-cols-2">
        <?= field('Username', text_input('smtp_user', $sv['user'], ['autocomplete' => 'off'])) ?>
        <?= field('Password', '<input name="smtp_pass" type="password" class="' . INPUT_CLS . '" autocomplete="new-password" placeholder="' . ($smtp['hasPassword'] ? '••••••••' : '') . '">', $smtp['hasPassword'] ? 'A password is saved. Leave blank to keep it.' : 'Stored encrypted.') ?>
      </div>
      <?php if ($smtp['hasPassword']): ?>
        <?= checkbox('smtp_pass_clear', false, 'Remove the saved password') ?>
      <?php endif; ?>
      <?= field('From address', text_input('smtp_from', $sv['from']), 'Shown as the sender, e.g. "Britech Website <noreply@britechsolutions.co.tz>"') ?>
      <?= field('Send notifications to', text_input('notify_to', $sv['notify'], ['placeholder' => 'info@britechsolutions.co.tz']), 'One or more emails, separated by commas.') ?>
      <?= submit_button('Save email settings') ?>
    </form>

    <?php if ($smtp['host'] !== ''): ?>
    <form method="post" data-pending-form id="test" class="space-y-3 rounded-xl border border-navy-100 bg-white p-6">
      <?= csrf_field() ?><input type="hidden" name="form" value="test">
      <h3 class="font-semibold text-navy-900">Send a test email</h3>
      <?= form_message(...$msgs['test']) ?>
      <div class="flex flex-col gap-3 sm:flex-row">
        <?= text_input('to', $smtp['notifyTo'][0] ?? $user['email'], ['type' => 'email']) ?>
        <?= submit_button('Send test', 'secondary') ?>
      </div>
    </form>
    <?php endif; ?>
  </div>
</div>
