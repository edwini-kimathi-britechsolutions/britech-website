<?php
defined('BRITECH') || exit;

/* Admin form pieces — same look as the React admin (fields.tsx, StatusBadge.tsx). */

const INPUT_CLS = 'w-full rounded-lg border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 outline-none transition focus:border-mint-500 focus:ring-4 focus:ring-mint-500/15';
const POST_CATEGORIES = ['News', 'Insights', 'Cybersecurity', 'Data & BI', 'Software', 'AI', 'Events', 'Case Study'];

function field(string $label, string $control, string $hint = ''): string
{
    return '<label class="block"><span class="mb-1.5 block text-sm font-medium text-navy-800">' . e($label) . '</span>' . $control
        . ($hint !== '' ? '<span class="mt-1 block text-xs text-navy-400">' . e($hint) . '</span>' : '') . '</label>';
}

/** <input> with escaped attributes. */
function text_input(string $name, ?string $value, array $attrs = []): string
{
    $a = '';
    foreach ($attrs as $k => $v) {
        $a .= $v === true ? ' ' . $k : ' ' . $k . '="' . e($v) . '"';
    }
    return '<input name="' . e($name) . '" value="' . e($value ?? '') . '"' . (isset($attrs['class']) ? '' : ' class="' . INPUT_CLS . '"') . $a . '>';
}

function textarea(string $name, ?string $value, int $rows, array $attrs = []): string
{
    $a = '';
    foreach ($attrs as $k => $v) {
        $a .= $v === true ? ' ' . $k : ' ' . $k . '="' . e($v) . '"';
    }
    return '<textarea name="' . e($name) . '" rows="' . $rows . '" class="' . INPUT_CLS . '"' . $a . '>' . e($value ?? '') . '</textarea>';
}

/** @param array<string,string> $options value => label */
function select(string $name, array $options, ?string $selected, string $extraClass = '', bool $disabled = false): string
{
    $h = '<select name="' . e($name) . '" class="' . INPUT_CLS . ' ' . $extraClass . '"' . ($disabled ? ' disabled' : '') . '>';
    foreach ($options as $v => $l) {
        $h .= '<option value="' . e($v) . '"' . ((string) $v === (string) $selected ? ' selected' : '') . '>' . e($l) . '</option>';
    }
    return $h . '</select>';
}

function checkbox(string $name, bool $checked, string $label, bool $disabled = false): string
{
    return '<label class="flex items-center gap-2 text-sm text-navy-700"><input type="checkbox" name="' . e($name) . '"' . ($checked ? ' checked' : '') . ($disabled ? ' disabled' : '')
        . ' class="h-4 w-4 accent-mint-600"> ' . e($label) . '</label>';
}

function submit_button(string $label, string $variant = 'primary', string $name = '', string $value = ''): string
{
    $styles = [
        'primary' => 'bg-navy-900 text-white hover:bg-navy-800',
        'secondary' => 'bg-white text-navy-800 ring-1 ring-navy-200 hover:bg-navy-50',
        'mint' => 'bg-mint-500 text-navy-950 hover:bg-mint-400',
        'danger' => 'bg-white text-red-600 ring-1 ring-red-200 hover:bg-red-50',
    ];
    return '<button type="submit"' . ($name !== '' ? ' name="' . e($name) . '" value="' . e($value) . '"' : '')
        . ' class="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ' . $styles[$variant] . '">'
        . e($label) . '</button>';
}

/** Submit button that asks for confirmation first (handled in admin.js). */
function confirm_submit(string $message, string $innerHtml): string
{
    return '<button type="submit" data-confirm="' . e($message) . '" class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 ring-1 ring-red-200 transition hover:bg-red-50">' . $innerHtml . '</button>';
}

function form_message(?string $error, ?string $ok = null, ?string $secret = null): string
{
    if ($error) {
        return '<p role="alert" class="flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">' . icon('AlertCircle', 'mt-0.5 h-4 w-4 shrink-0') . ' ' . e($error) . '</p>';
    }
    if ($ok) {
        return '<div role="status" class="rounded-lg bg-navy-50 px-3.5 py-2.5 text-sm text-navy-900"><p class="flex items-start gap-2">' . icon('CheckCircle2', 'mt-0.5 h-4 w-4 shrink-0') . ' ' . e($ok) . '</p>'
            . ($secret ? '<code class="mt-2 block select-all rounded bg-white px-3 py-2 font-mono text-base text-navy-900 ring-1 ring-navy-200">' . e($secret) . '</code>' : '')
            . '</div>';
    }
    return '';
}

/** Uploads an image (admin.js) and stores its URL in a hidden input. */
function image_field(string $name, string $label, ?string $value, string $hint = ''): string
{
    $url = $value ?? '';
    return '<div data-image-field><span class="mb-1.5 block text-sm font-medium text-navy-800">' . e($label) . '</span>'
        . '<input type="hidden" name="' . e($name) . '" value="' . e($url) . '" data-image-value>'
        . '<div class="flex items-center gap-4">'
        . '<div class="flex h-24 w-40 items-center justify-center overflow-hidden rounded-lg border border-dashed border-navy-200 bg-navy-50/60">'
        . '<img data-image-preview src="' . e($url) . '" alt="" class="h-full w-full object-contain p-2' . ($url === '' ? ' hidden' : '') . '">'
        . '<span data-image-empty class="' . ($url === '' ? '' : 'hidden') . '">' . icon('ImagePlus', 'h-6 w-6 text-navy-300') . '</span></div>'
        . '<div class="flex flex-col gap-2">'
        . '<button type="button" data-image-pick class="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-navy-800 ring-1 ring-navy-200 hover:bg-navy-50 disabled:opacity-60">'
        . icon('ImagePlus', 'h-4 w-4') . '<span data-image-label>' . ($url === '' ? 'Upload image' : 'Replace image') . '</span></button>'
        . '<button type="button" data-image-remove class="inline-flex items-center gap-1 text-xs text-navy-400 hover:text-red-600' . ($url === '' ? ' hidden' : '') . '">' . icon('X', 'h-3 w-3') . ' Remove</button>'
        . '</div><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" data-image-file></div>'
        . ($hint !== '' ? '<p class="mt-1 text-xs text-navy-400">' . e($hint) . '</p>' : '')
        . '<p data-image-error class="mt-1 hidden text-xs text-red-600"></p></div>';
}

function status_badge(string $status): string
{
    $styles = [
        'PUBLISHED' => 'bg-navy-900 text-white ring-navy-900',
        'REVIEW' => 'bg-amber-50 text-amber-700 ring-amber-200',
        'DRAFT' => 'bg-navy-50 text-navy-600 ring-navy-200',
    ];
    $labels = ['PUBLISHED' => 'Published', 'REVIEW' => 'In review', 'DRAFT' => 'Draft'];
    return '<span class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ' . $styles[$status] . '">' . $labels[$status] . '</span>';
}

function page_title(string $title, string $text = '', string $actionHtml = ''): string
{
    return '<div class="mb-8 flex flex-wrap items-end justify-between gap-4"><div><h1 class="text-2xl font-bold text-navy-900">' . e($title) . '</h1>'
        . ($text !== '' ? '<p class="text-navy-500">' . e($text) . '</p>' : '') . '</div>' . $actionHtml . '</div>';
}

/** $html is trusted (code-defined) markup. */
function notice(string $html, string $tone = 'ok'): string
{
    return '<p class="mb-6 rounded-lg px-4 py-3 text-sm ' . ($tone === 'ok' ? 'bg-navy-50 text-navy-900' : 'bg-amber-50 text-amber-800') . '">' . $html . '</p>';
}

function add_button(string $href, string $label, string $icon = 'Plus'): string
{
    return '<a href="' . e($href) . '" class="inline-flex items-center gap-2 rounded-lg bg-mint-500 px-4 py-2.5 text-sm font-semibold text-navy-950 hover:bg-mint-400">' . icon($icon, 'h-4 w-4') . ' ' . e($label) . '</a>';
}

/** Delete form for edit pages. */
function delete_form(string $action, string $id, string $message): string
{
    return '<form method="post" action="' . e($action) . '">' . csrf_field() . '<input type="hidden" name="id" value="' . e($id) . '">'
        . confirm_submit($message, icon('Trash2', 'h-4 w-4') . ' Delete') . '</form>';
}

/** Value for a form: posted value after a failed save, otherwise the saved record's value. */
function old(array $old, ?array $record, string $key, $default = '')
{
    if (array_key_exists($key, $old)) {
        return $old[$key];
    }
    return $record[$key] ?? $default;
}

function old_checked(array $old, ?array $record, string $key, bool $default): bool
{
    if ($old) {
        return ($old[$key] ?? '') === 'on';
    }
    return $record ? (bool) (int) $record[$key] : $default;
}
