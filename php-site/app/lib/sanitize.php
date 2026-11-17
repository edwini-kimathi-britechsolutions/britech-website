<?php
defined('BRITECH') || exit;

/*
 * Allow-list HTML sanitizer for blog posts (same rules as the Node.js version):
 * only the tags/attributes the editor produces survive; links get rel/target;
 * images must be uploaded media (/media/…) or https URLs. Everything else is stripped.
 */

const ALLOWED_TAGS = [
    'p', 'br', 'hr', 'h2', 'h3', 'h4', 'strong', 'em', 'u', 's', 'code', 'pre',
    'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption',
];
const ALLOWED_ATTRS = [
    'a' => ['href', 'target', 'rel'],
    'img' => ['src', 'alt', 'title'],
];
// Removed together with their contents.
const DROP_WITH_CONTENT = ['script', 'style', 'textarea', 'option', 'noscript', 'iframe', 'object', 'embed', 'svg', 'math', 'template', 'head', 'title'];

function sanitize_post_html(string $dirty): string
{
    if (trim($dirty) === '') {
        return '';
    }
    $doc = new DOMDocument('1.0', 'UTF-8');
    $prev = libxml_use_internal_errors(true);
    $doc->loadHTML('<?xml encoding="UTF-8"?><!DOCTYPE html><html><body><div id="__root">' . $dirty . '</div></body></html>', LIBXML_NONET);
    libxml_clear_errors();
    libxml_use_internal_errors($prev);

    $root = $doc->getElementById('__root');
    if (!$root) {
        return '';
    }
    sanitize_children($root);

    $html = '';
    foreach ($root->childNodes as $child) {
        $html .= $doc->saveHTML($child);
    }
    return $html;
}

function sanitize_children(DOMNode $parent): void
{
    // Copy the list first: we modify the tree while walking it.
    $children = [];
    foreach ($parent->childNodes as $c) {
        $children[] = $c;
    }
    foreach ($children as $node) {
        if ($node instanceof DOMText) {
            continue;
        }
        if (!$node instanceof DOMElement) {
            $parent->removeChild($node); // comments, processing instructions …
            continue;
        }
        $tag = strtolower($node->nodeName);

        if (in_array($tag, DROP_WITH_CONTENT, true)) {
            $parent->removeChild($node);
            continue;
        }
        if (!in_array($tag, ALLOWED_TAGS, true)) {
            // Unknown tag: keep its (sanitized) contents, drop the tag itself.
            sanitize_children($node);
            while ($node->firstChild) {
                $parent->insertBefore($node->firstChild, $node);
            }
            $parent->removeChild($node);
            continue;
        }

        // Attributes: allow-list only.
        $allowed = ALLOWED_ATTRS[$tag] ?? [];
        $attrs = [];
        foreach ($node->attributes as $a) {
            $attrs[] = $a->nodeName;
        }
        foreach ($attrs as $name) {
            if (!in_array(strtolower($name), $allowed, true)) {
                $node->removeAttribute($name);
            }
        }

        if ($tag === 'a') {
            $href = trim($node->getAttribute('href'));
            if ($href !== '' && !preg_match('#^(https?://|mailto:|/(?!/))#i', $href)) {
                $node->removeAttribute('href');
                $href = '';
            }
            $node->setAttribute('rel', 'noopener noreferrer nofollow');
            if ($href !== '' && $href[0] !== '/') {
                $node->setAttribute('target', '_blank');
            } else {
                $node->removeAttribute('target');
            }
        }

        if ($tag === 'img') {
            $src = trim($node->getAttribute('src'));
            if (!(str_starts_with($src, '/media/') || str_starts_with($src, 'https://'))) {
                $parent->removeChild($node);
                continue;
            }
        }

        sanitize_children($node);
    }
}

function strip_all_tags(string $html): string
{
    return html_entity_decode(strip_tags(str_replace('<', ' <', $html)), ENT_QUOTES | ENT_HTML5, 'UTF-8');
}
