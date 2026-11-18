<?php
defined('BRITECH') || exit;
/** @var ?array $post @var array $old @var ?string $error @var bool $canPublish */
$title = old($old, $post, 'title');
$slug = old($old, $post, 'slug');
$content = old($old, $post, 'content');
$status = $post['status'] ?? null;
$tool = fn (string $cmd, string $label, string $ic) => '<button type="button" data-cmd="' . $cmd . '" title="' . e($label) . '" aria-label="' . e($label) . '" class="flex h-8 w-8 items-center justify-center rounded-md text-navy-600 transition hover:bg-navy-100 disabled:opacity-40 aria-pressed:bg-navy-900 aria-pressed:text-white">' . icon($ic, 'h-4 w-4') . '</button>';
$sep = '<span class="mx-1 h-5 w-px bg-navy-100"></span>';
?>
<form method="post" data-pending-form data-post-form class="grid gap-6 lg:grid-cols-3">
  <?= csrf_field() ?>
  <div class="space-y-5 lg:col-span-2">
    <?= form_message($error) ?>
    <?= field('Title', text_input('title', $title, ['required' => true, 'maxlength' => '200', 'data-title' => '', 'class' => INPUT_CLS . ' text-lg font-semibold', 'placeholder' => 'A clear, specific headline'])) ?>
    <?= field('Summary', textarea('excerpt', old($old, $post, 'excerpt'), 3, ['required' => true, 'maxlength' => '400']), 'Shown on the blog list and in search results (max 400 characters).') ?>
    <div>
      <span class="mb-1.5 block text-sm font-medium text-navy-800">Article</span>
      <div data-rich-editor class="overflow-hidden rounded-xl border border-navy-200 bg-white focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
        <input type="hidden" name="content" value="<?= e($content) ?>" data-editor-input>
        <div data-editor-toolbar class="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-navy-100 bg-white/95 p-1.5 backdrop-blur">
          <?= $tool('h2', 'Heading', 'Heading2') ?><?= $tool('h3', 'Subheading', 'Heading3') ?><?= $sep ?>
          <?= $tool('bold', 'Bold', 'Bold') ?><?= $tool('italic', 'Italic', 'Italic') ?><?= $tool('strike', 'Strikethrough', 'Strikethrough') ?><?= $tool('code', 'Inline code', 'Code') ?><?= $sep ?>
          <?= $tool('bulletList', 'Bulleted list', 'List') ?><?= $tool('orderedList', 'Numbered list', 'ListOrdered') ?><?= $tool('blockquote', 'Quote', 'Quote') ?><?= $tool('hr', 'Divider', 'Minus') ?><?= $sep ?>
          <?= $tool('link', 'Link', 'Link2') ?>
          <button type="button" data-cmd="image" title="Insert image" aria-label="Insert image" class="flex h-8 w-8 items-center justify-center rounded-md text-navy-600 transition hover:bg-navy-100 disabled:opacity-40"><span data-idle><?= icon('ImagePlus', 'h-4 w-4') ?></span><span data-busy class="hidden"><?= icon('Loader2', 'h-4 w-4 animate-spin') ?></span></button>
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" data-editor-file>
          <span class="ml-auto flex"><?= $tool('undo', 'Undo', 'Undo2') ?><?= $tool('redo', 'Redo', 'Redo2') ?></span>
        </div>
        <div data-editor-mount class="min-h-[420px]">
          <!-- Without JavaScript the article can still be edited as HTML. -->
          <noscript><textarea name="content" rows="18" class="w-full border-0 p-4 font-mono text-sm"><?= e($content) ?></textarea></noscript>
        </div>
        <div class="border-t border-navy-100 px-4 py-2 text-xs text-navy-400" data-editor-count>0 words · about 1 min read</div>
      </div>
    </div>
  </div>

  <aside class="space-y-5">
    <div class="space-y-3 rounded-xl border border-navy-100 bg-white p-5">
      <p class="text-sm font-semibold text-navy-900">Publish</p>
      <p class="text-xs text-navy-500">Status: <strong class="text-navy-800"><?= e($status ? strtolower($status) : 'new') ?></strong><?= $canPublish ? '' : ' · An editor reviews and publishes your posts.' ?></p>
      <div class="flex flex-col gap-2">
        <?= $canPublish
            ? submit_button($status === 'PUBLISHED' ? 'Update published post' : 'Publish', 'brand', 'intent', 'publish')
            : submit_button('Submit for review', 'brand', 'intent', 'review') ?>
        <?= submit_button($status === 'PUBLISHED' ? 'Unpublish (save as draft)' : 'Save draft', 'secondary', 'intent', 'draft') ?>
      </div>
    </div>

    <div class="space-y-4 rounded-xl border border-navy-100 bg-white p-5">
      <?= image_field('coverImage', 'Cover image', old($old, $post, 'coverImage'), 'Landscape, at least 1200px wide.') ?>
      <?= field('Category', select('category', array_combine(POST_CATEGORIES, POST_CATEGORIES), old($old, $post, 'category', 'News'))) ?>
      <?= field('Tags', text_input('tags', old($old, $post, 'tags'), ['maxlength' => '300']), 'Comma separated, e.g. ERP, Tanzania') ?>
      <label class="block">
        <span class="mb-1.5 block text-sm font-medium text-navy-800">Web address</span>
        <?= text_input('slug', $slug, ['data-slug' => '', 'data-touched' => $post ? '1' : '0']) ?>
        <span class="mt-1 block text-xs text-navy-400">/blog/<span data-slug-preview><?= e($slug ?: '…') ?></span></span>
      </label>
      <?php if ($canPublish): ?>
        <?= checkbox('featured', old_checked($old, $post, 'featured', false), 'Feature at the top of the blog') ?>
      <?php endif; ?>
    </div>
  </aside>
</form>
