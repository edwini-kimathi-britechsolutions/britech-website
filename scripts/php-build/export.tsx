/**
 * Exports the site's static content (src/lib/data.ts) and the Lucide icons used by the site
 * into JSON that `scripts/php-build/build.sh` turns into PHP files for the PHP version (php-site/).
 * Run via build.sh — not needed on the server.
 */
import { writeFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as Lucide from "lucide-react";
import * as data from "../../src/lib/data";

const out = process.argv[2];
if (!out) throw new Error("usage: export.tsx <out-dir>");

/* ------------------------------- data ------------------------------- */
const { company, practices, services, stats, highlights, values, partners, serviceProcess, engagementProcess, sectors, positioning, industries, INQUIRY_SERVICES } = data;
writeFileSync(
  `${out}/data.json`,
  JSON.stringify({ company, practices, services, stats, highlights, values, partners, serviceProcess, engagementProcess, sectors, positioning, industries, inquiryServices: INQUIRY_SERVICES }, null, 2)
);

/* ------------------------------- icons ------------------------------ */
const names = [
  // site + admin UI
  "AlertCircle", "AlertTriangle", "Archive", "ArrowLeft", "ArrowRight", "ArrowUpRight", "Award", "BarChart3", "Briefcase", "Check",
  "CheckCircle2", "ChevronDown", "ChevronLeft", "ChevronRight", "Cloud", "Cpu", "Database", "ExternalLink", "Eye", "FileCheck2",
  "FileText", "Globe", "Handshake", "Heart", "ImagePlus", "Inbox", "LayoutDashboard", "Loader2", "LogOut", "Mail", "MapPin", "Menu",
  "MessageSquareQuote", "Newspaper", "PenLine", "Phone", "Plus", "Quote", "RotateCcw", "Search", "Send", "Settings", "ShieldCheck",
  "Sparkles", "Target", "Trash2", "UserCircle", "Users", "X",
  // service / industry / highlight icons (data.ts)
  "Banknote", "Sprout", "Activity", "Bot", "Boxes", "Building2", "Link2", "Map", "Package", "Route", "ShoppingCart", "TreePine",
  "BadgeCheck", "Compass", "GraduationCap", "HeartHandshake", "Landmark", "Layers", "Rocket", "Scale", "Smartphone", "Stethoscope", "Store", "Zap",
  // blog editor toolbar
  "Bold", "Code", "Heading2", "Heading3", "Italic", "List", "ListOrdered", "Minus", "Redo2", "Strikethrough", "Undo2",
];

const icons: Record<string, string> = {};
const lib = Lucide as unknown as Record<string, Parameters<typeof createElement>[0]>;
for (const n of names) {
  const C = lib[n];
  if (!C) throw new Error(`Unknown lucide icon: ${n}`);
  const svg = renderToStaticMarkup(createElement(C));
  // Keep only the inner shapes; PHP wraps them in its own <svg> with the right classes.
  icons[n] = svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
}
// Make sure every icon referenced by the content exists.
for (const item of [...practices, ...services, ...industries, ...highlights]) {
  if (!icons[item.icon]) throw new Error(`Icon ${item.icon} used in data.ts is not exported`);
}
writeFileSync(`${out}/icons.json`, JSON.stringify(icons, null, 2));
console.log(`exported data + ${Object.keys(icons).length} icons`);
