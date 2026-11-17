<?php
defined('BRITECH') || exit;
/** @var array $inq @var array $user */
$name = $inq['firstName'] . ' ' . $inq['lastName'];
$replyHref = 'mailto:' . $inq['email'] . '?subject=' . rawurlencode('Re: your inquiry about ' . $inq['service']);
$btn = 'inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-navy-800 ring-1 ring-navy-200 hover:bg-navy-50';
?>
<div class="max-w-3xl">
  <a href="/admin/inquiries" class="inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-900"><?= icon('ArrowLeft', 'h-4 w-4') ?> All inquiries</a>

  <div class="mt-4 rounded-2xl border border-navy-100 bg-white">
    <div class="flex flex-wrap items-start justify-between gap-4 border-b border-navy-100 p-6">
      <div>
        <h1 class="text-xl font-bold text-navy-900"><?= e($name) ?></h1>
        <p class="text-sm text-navy-500"><?= $inq['company'] ? e($inq['company']) . ' · ' : '' ?><?= e(format_datetime($inq['createdAt'])) ?></p>
      </div>
      <span class="rounded-full bg-mint-50 px-3 py-1 text-xs font-semibold text-mint-700"><?= e($inq['service']) ?></span>
    </div>

    <dl class="grid gap-4 border-b border-navy-100 p-6 sm:grid-cols-2">
      <div>
        <dt class="text-xs font-semibold uppercase tracking-wider text-navy-400">Email</dt>
        <dd><a href="mailto:<?= e($inq['email']) ?>" class="break-all font-medium text-navy-800 hover:text-mint-700"><?= e($inq['email']) ?></a></dd>
      </div>
      <div>
        <dt class="text-xs font-semibold uppercase tracking-wider text-navy-400">Phone</dt>
        <dd><?= $inq['phone'] ? '<a href="' . e(tel_href($inq['phone'])) . '" class="font-medium text-navy-800 hover:text-mint-700">' . e($inq['phone']) . '</a>' : '<span class="text-navy-400">Not provided</span>' ?></dd>
      </div>
    </dl>

    <div class="whitespace-pre-wrap p-6 leading-relaxed text-navy-700"><?= e($inq['message']) ?></div>

    <div class="flex flex-wrap items-center gap-2 border-t border-navy-100 bg-navy-50/50 p-4">
      <a href="<?= e($replyHref) ?>" class="inline-flex items-center gap-2 rounded-lg bg-mint-500 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-mint-400"><?= icon('Mail', 'h-4 w-4') ?> Reply by email</a>
      <?php if ($inq['phone']): ?>
      <a href="<?= e(tel_href($inq['phone'])) ?>" class="<?= $btn ?>"><?= icon('Phone', 'h-4 w-4') ?> Call</a>
      <?php endif; ?>
      <form method="post"><?= csrf_field() ?>
        <?php if ($inq['status'] === 'ARCHIVED'): ?>
        <input type="hidden" name="status" value="READ"><button type="submit" class="<?= $btn ?>"><?= icon('Inbox', 'h-4 w-4') ?> Move to inbox</button>
        <?php else: ?>
        <input type="hidden" name="status" value="ARCHIVED"><button type="submit" class="<?= $btn ?>"><?= icon('Archive', 'h-4 w-4') ?> Archive</button>
        <?php endif; ?>
      </form>
      <form method="post"><?= csrf_field() ?>
        <input type="hidden" name="status" value="NEW">
        <button type="submit" class="px-3 py-2 text-sm font-medium text-navy-500 hover:text-navy-900">Mark as unread</button>
      </form>
      <?php if ($user['role'] === 'ADMIN'): ?>
      <form method="post" class="ml-auto"><?= csrf_field() ?>
        <input type="hidden" name="action" value="delete">
        <?= confirm_submit('Delete this inquiry permanently?', icon('Trash2', 'h-4 w-4') . ' Delete') ?>
      </form>
      <?php endif; ?>
    </div>
  </div>

  <p class="mt-4 flex items-center gap-2 text-sm text-navy-500">
    <?php if ($inq['emailedAt']): ?>
      <?= icon('CheckCircle2', 'h-4 w-4 text-navy-900') ?> Notification emailed <?= e(format_datetime($inq['emailedAt'])) ?>
    <?php elseif ($inq['emailError']): ?>
      <?= icon('AlertTriangle', 'h-4 w-4 text-navy-900') ?> Notification email failed: <?= e($inq['emailError']) ?>
    <?php else: ?>
      No notification email was sent.
    <?php endif; ?>
  </p>
</div>
