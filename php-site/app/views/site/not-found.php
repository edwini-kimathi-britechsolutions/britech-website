<?php defined('BRITECH') || exit; ?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Page not found | Britech Solutions</title>
<link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/images/mark.png" type="image/png">
<link rel="stylesheet" href="<?= e(asset('app.css')) ?>">
</head>
<body class="font-sans">
<div class="relative flex min-h-screen flex-col overflow-hidden bg-white">
  <div class="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"></div>
  <header class="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <a href="/" aria-label="Britech Solutions home"><img src="/images/logo.svg" alt="Britech Solutions" width="139" height="50" class="h-11 w-auto"></a>
  </header>
  <main class="relative flex flex-1 items-center justify-center px-4 pb-24">
    <div class="max-w-xl text-center">
      <p class="text-8xl font-extrabold tracking-tight text-navy-900 sm:text-9xl">4<span class="text-navy-300">0</span>4</p>
      <h1 class="mt-6 text-2xl font-bold text-navy-900 sm:text-3xl">We couldn’t find that page</h1>
      <p class="mt-3 text-navy-500">The link may be broken, or the page may have moved. Try one of these instead:</p>
      <div class="mt-8 flex flex-wrap justify-center gap-2">
        <?php foreach ([['/solutions', 'Solutions'], ['/products', 'Products'], ['/our-work', 'Our work'], ['/blog', 'Blog'], ['/contact', 'Contact']] as [$href, $label]): ?>
        <a href="<?= $href ?>" class="rounded-full border border-navy-200 px-4 py-2 text-sm font-medium text-navy-700 transition hover:border-navy-400 hover:bg-navy-50"><?= e($label) ?></a>
        <?php endforeach; ?>
      </div>
      <div class="mt-10 flex flex-wrap justify-center gap-3">
        <a href="/" class="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-5 py-3 font-semibold text-white hover:bg-navy-800"><?= icon('ArrowLeft', 'h-4 w-4') ?> Back to home</a>
        <a href="/blog" class="inline-flex items-center gap-2 rounded-lg px-5 py-3 font-semibold text-navy-800 ring-1 ring-navy-200 hover:bg-navy-50"><?= icon('Search', 'h-4 w-4') ?> Search articles</a>
      </div>
    </div>
  </main>
</div>
</body>
</html>
