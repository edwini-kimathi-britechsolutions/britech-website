<?php
defined('BRITECH') || exit;
// Shown when a page fails (e.g. the database is briefly unavailable). Self-contained: no database calls.
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Something went wrong | Britech Solutions</title>
<link rel="icon" href="/images/mark.png">
<link rel="stylesheet" href="<?= e(asset('app.css')) ?>">
</head>
<body class="font-sans">
<header class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
  <a href="/" aria-label="Britech Solutions home"><img src="/images/logo.png" alt="Britech Solutions" width="140" height="53" class="h-10 w-auto"></a>
</header>
<section class="flex min-h-[60vh] items-center justify-center px-4 py-24">
  <div class="max-w-lg text-center">
    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-navy-500">Something went wrong</p>
    <h1 class="mt-4 text-3xl font-bold text-navy-900">We couldn’t load this page</h1>
    <p class="mt-3 text-navy-500">Please try again in a moment. If the problem continues, contact us directly.</p>
    <div class="mt-8 flex flex-wrap justify-center gap-3">
      <a href="" class="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-5 py-3 font-semibold text-white hover:bg-navy-800"><?= icon('RotateCcw', 'h-4 w-4') ?> Try again</a>
      <a href="/" class="rounded-lg px-5 py-3 font-semibold text-navy-800 ring-1 ring-navy-200 hover:bg-navy-50">Go to home page</a>
    </div>
    <p class="mt-6 text-sm text-navy-400">info@britechsolutions.co.tz · +255 795 005 903</p>
  </div>
</section>
</body>
</html>
