<?php
defined('BRITECH') || exit;
/** @var string $title @var string $content @var array $user @var int $newInquiries @var bool $editor */
$path = request_path();
$items = [
    ['/admin', 'Dashboard', 'LayoutDashboard', ['ADMIN', 'EDITOR', 'AUTHOR']],
    ['/admin/inquiries', 'Inquiries', 'Inbox', ['ADMIN', 'EDITOR']],
    ['/admin/posts', 'Blog posts', 'FileText', ['ADMIN', 'EDITOR', 'AUTHOR']],
    ['/admin/projects', 'Projects & products', 'Briefcase', ['ADMIN', 'EDITOR']],
    ['/admin/partners', 'Clients & partners', 'Handshake', ['ADMIN', 'EDITOR']],
    ['/admin/testimonials', 'Testimonials', 'MessageSquareQuote', ['ADMIN', 'EDITOR']],
    ['/admin/users', 'Team accounts', 'Users', ['ADMIN']],
    ['/admin/settings', 'Site settings', 'Settings', ['ADMIN']],
    ['/admin/account', 'My account', 'UserCircle', ['ADMIN', 'EDITOR', 'AUTHOR']],
];
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="csrf-token" content="<?= e(csrf_token()) ?>">
<title><?= e($title) ?> · Britech Admin</title>
<link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/images/mark.png" type="image/png">
<link rel="stylesheet" href="<?= e(asset('app.css')) ?>">
<script src="<?= e(asset('admin.js')) ?>" defer></script>
<?php if (!empty($withEditor)): ?><script src="<?= e(asset('editor.js')) ?>" defer></script><?php endif; ?>
</head>
<body class="font-sans">
<div class="min-h-screen bg-navy-50/60">
<div class="lg:flex">
  <aside class="border-b border-navy-100 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
    <div class="flex items-center justify-between px-5 py-4 lg:block lg:py-6">
      <a href="/admin" class="flex items-center gap-2">
        <img src="/images/logo.svg" alt="Britech Solutions" width="111" height="40" class="h-9 w-auto">
        <span class="rounded bg-navy-900 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Admin</span>
      </a>
    </div>
    <nav class="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
      <?php foreach ($items as [$href, $label, $ic, $roles]): if (!in_array($user['role'], $roles, true)) { continue; }
          $active = $href === '/admin' ? $path === '/admin' : str_starts_with($path, $href); ?>
      <a href="<?= $href ?>" class="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition <?= $active ? 'bg-navy-900 text-white' : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900' ?>">
        <?= icon($ic, 'h-4 w-4' . ($active ? ' text-white' : '')) ?>
        <?= e($label) ?>
        <?php if ($href === '/admin/inquiries' && $newInquiries > 0): ?><span class="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-bold text-navy-950"><?= $newInquiries ?></span><?php endif; ?>
      </a>
      <?php endforeach; ?>
    </nav>
    <div class="mt-auto hidden border-t border-navy-100 p-4 lg:block">
      <p class="truncate text-sm font-semibold text-navy-900"><?= e($user['name']) ?></p>
      <p class="truncate text-xs text-navy-400"><?= e($user['email']) ?> · <?= e(strtolower($user['role'])) ?></p>
      <div class="mt-3 flex items-center justify-between">
        <a href="/" target="_blank" class="inline-flex items-center gap-1 text-xs font-medium text-navy-500 hover:text-navy-900">View site <?= icon('ExternalLink', 'h-3 w-3') ?></a>
        <form method="post" action="/admin/logout"><?= csrf_field() ?>
          <button class="inline-flex items-center gap-1 text-xs font-medium text-navy-500 hover:text-red-600"><?= icon('LogOut', 'h-3 w-3') ?> Sign out</button>
        </form>
      </div>
    </div>
  </aside>
  <div class="min-w-0 flex-1">
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-8"><?= $content ?></div>
  </div>
</div>
</div>
</body>
</html>
