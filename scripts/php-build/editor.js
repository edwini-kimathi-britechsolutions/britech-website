/**
 * Blog editor for the PHP admin — the same TipTap setup as the React admin (RichEditor.tsx),
 * bundled by build.sh into php-site/assets/editor.js. The toolbar HTML is rendered by PHP.
 */
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

function mount(root) {
  const input = root.querySelector("[data-editor-input]");
  const el = root.querySelector("[data-editor-mount]");
  const toolbar = root.querySelector("[data-editor-toolbar]");
  const fileInput = root.querySelector("[data-editor-file]");
  const counter = root.querySelector("[data-editor-count]");
  el.innerHTML = "";

  const editor = new Editor({
    element: el,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ["https", "mailto"] }),
      Image,
      Placeholder.configure({ placeholder: "Start writing your article…" }),
    ],
    content: input.value,
    editorProps: { attributes: { class: "prose prose-britech max-w-none min-h-[420px] px-5 py-4 focus:outline-none" } },
    onUpdate: sync,
    onSelectionUpdate: refresh,
    onTransaction: refresh,
  });

  function words() {
    return editor.getText().trim().split(/\s+/).filter(Boolean).length;
  }
  function sync() {
    input.value = editor.isEmpty ? "" : editor.getHTML();
    const n = words();
    counter.textContent = `${n} words · about ${Math.max(1, Math.round(n / 220))} min read`;
  }

  const c = () => editor.chain().focus();
  const commands = {
    h2: [() => c().toggleHeading({ level: 2 }).run(), () => editor.isActive("heading", { level: 2 })],
    h3: [() => c().toggleHeading({ level: 3 }).run(), () => editor.isActive("heading", { level: 3 })],
    bold: [() => c().toggleBold().run(), () => editor.isActive("bold")],
    italic: [() => c().toggleItalic().run(), () => editor.isActive("italic")],
    strike: [() => c().toggleStrike().run(), () => editor.isActive("strike")],
    code: [() => c().toggleCode().run(), () => editor.isActive("code")],
    bulletList: [() => c().toggleBulletList().run(), () => editor.isActive("bulletList")],
    orderedList: [() => c().toggleOrderedList().run(), () => editor.isActive("orderedList")],
    blockquote: [() => c().toggleBlockquote().run(), () => editor.isActive("blockquote")],
    hr: [() => c().setHorizontalRule().run(), null],
    link: [setLink, () => editor.isActive("link")],
    image: [() => fileInput.click(), null],
    undo: [() => c().undo().run(), null, () => editor.can().undo()],
    redo: [() => c().redo().run(), null, () => editor.can().redo()],
  };

  function setLink() {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Link address (https://…)", prev ?? "https://");
    if (url === null) return;
    if (url === "") return editor.chain().focus().unsetLink().run();
    if (!/^(https?:\/\/|mailto:|\/)/.test(url)) return window.alert("Links must start with https://, mailto: or /");
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  toolbar.querySelectorAll("[data-cmd]").forEach((btn) => {
    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", () => commands[btn.dataset.cmd]?.[0]());
  });

  function refresh() {
    toolbar.querySelectorAll("[data-cmd]").forEach((btn) => {
      const [, isActive, canRun] = commands[btn.dataset.cmd] ?? [];
      if (isActive) {
        const on = isActive();
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        btn.classList.toggle("bg-navy-900", on);
        btn.classList.toggle("text-white", on);
        btn.classList.toggle("hover:bg-navy-100", !on);
      }
      if (canRun) btn.disabled = !canRun();
    });
  }

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    fileInput.value = "";
    if (!file) return;
    const imgBtn = toolbar.querySelector('[data-cmd="image"]');
    imgBtn.disabled = true;
    imgBtn.querySelector("[data-idle]").classList.add("hidden");
    imgBtn.querySelector("[data-busy]").classList.remove("hidden");
    try {
      const src = await window.britechUpload(file);
      const alt = window.prompt("Describe the image (alt text for accessibility)", "") ?? "";
      editor.chain().focus().setImage({ src, alt }).run();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      imgBtn.disabled = false;
      imgBtn.querySelector("[data-idle]").classList.remove("hidden");
      imgBtn.querySelector("[data-busy]").classList.add("hidden");
    }
  });

  // Make sure the latest content is in the form when it is submitted.
  root.closest("form")?.addEventListener("submit", sync, true);
  sync();
  refresh();
}

function init() {
  document.querySelectorAll("[data-rich-editor]").forEach(mount);
}
if (document.readyState !== "loading") init();
else document.addEventListener("DOMContentLoaded", init);
