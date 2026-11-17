import "server-only";
import sanitizeHtml from "sanitize-html";

/** Allow-list for blog HTML produced by the editor. Everything else is stripped. */
export function sanitizePostHtml(dirty: string) {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p", "br", "hr", "h2", "h3", "h4", "strong", "em", "u", "s", "code", "pre",
      "blockquote", "ul", "ol", "li", "a", "img", "figure", "figcaption",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: "noopener noreferrer nofollow", ...(attribs.href?.startsWith("/") ? {} : { target: "_blank" }) },
      }),
    },
    // Images may only be uploaded media (/media/...) or https URLs.
    exclusiveFilter: (frame) =>
      frame.tag === "img" && !(frame.attribs.src?.startsWith("/media/") || frame.attribs.src?.startsWith("https://")),
  });
}

export const stripTags = (html: string) => sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
