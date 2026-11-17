<?php
defined('BRITECH') || exit;
/** @var ?string $error @var string $email */
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Sign in · Britech Admin</title>
<link rel="icon" href="/images/mark.png">
<link rel="stylesheet" href="<?= e(asset('app.css')) ?>">
<script src="<?= e(asset('admin.js')) ?>" defer></script>
</head>
<body class="font-sans">
<div class="min-h-screen bg-navy-50/60">
  <div class="flex min-h-screen items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <img src="/images/logo.png" alt="Britech Solutions" width="150" height="58" class="mx-auto h-12 w-auto">
      <div class="mt-8 rounded-2xl border border-navy-100 bg-white p-7 shadow-xl shadow-navy-900/5">
        <h1 class="text-xl font-bold text-navy-900">Sign in to the admin portal</h1>
        <p class="mt-1 text-sm text-navy-500">For Britech team members only.</p>
        <form method="post" action="/admin/login" class="mt-6 space-y-4">
          <input type="hidden" name="_login" value="<?= e(form_token()) ?>">
          <?= form_message($error) ?>
          <?= field('Email', text_input('email', $email, ['type' => 'email', 'autocomplete' => 'username', 'required' => true])) ?>
          <?= field('Password', '<input name="password" type="password" autocomplete="current-password" required class="' . INPUT_CLS . '">') ?>
          <div class="pt-2 [&>button]:w-full"><?= submit_button('Sign in') ?></div>
        </form>
      </div>
      <p class="mt-6 text-center text-xs text-navy-400">Accounts are created by an administrator.</p>
    </div>
  </div>
</div>
</body>
</html>
