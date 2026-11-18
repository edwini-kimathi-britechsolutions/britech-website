"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { uploadImage } from "./fields";

function ToolButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition disabled:opacity-40 ${
        active ? "bg-navy-900 text-white" : "text-navy-600 hover:bg-navy-100"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function setLink() {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address (https://…)", prev ?? "https://");
    if (url === null) return;
    if (url === "") return editor.chain().focus().unsetLink().run();
    if (!/^(https?:\/\/|mailto:|\/)/.test(url)) return window.alert("Links must start with https://, mailto: or /");
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  async function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const src = await uploadImage(file);
      const alt = window.prompt("Describe the image (alt text for accessibility)", "") ?? "";
      editor.chain().focus().setImage({ src, alt }).run();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const c = () => editor.chain().focus();
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-navy-100 bg-white/95 p-1.5 backdrop-blur">
      <ToolButton label="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => c().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Subheading" active={editor.isActive("heading", { level: 3 })} onClick={() => c().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-4 w-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-navy-100" />
      <ToolButton label="Bold" active={editor.isActive("bold")} onClick={() => c().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Italic" active={editor.isActive("italic")} onClick={() => c().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => c().toggleStrike().run()}>
        <Strikethrough className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Inline code" active={editor.isActive("code")} onClick={() => c().toggleCode().run()}>
        <Code className="h-4 w-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-navy-100" />
      <ToolButton label="Bulleted list" active={editor.isActive("bulletList")} onClick={() => c().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => c().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Quote" active={editor.isActive("blockquote")} onClick={() => c().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Divider" onClick={() => c().setHorizontalRule().run()}>
        <Minus className="h-4 w-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-navy-100" />
      <ToolButton label="Link" active={editor.isActive("link")} onClick={setLink}>
        <Link2 className="h-4 w-4" />
      </ToolButton>
      <ToolButton label="Insert image" disabled={uploading} onClick={() => fileRef.current?.click()}>
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
      </ToolButton>
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={onImage} />
      <span className="ml-auto flex">
        <ToolButton label="Undo" disabled={!editor.can().undo()} onClick={() => c().undo().run()}>
          <Undo2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton label="Redo" disabled={!editor.can().redo()} onClick={() => c().redo().run()}>
          <Redo2 className="h-4 w-4" />
        </ToolButton>
      </span>
    </div>
  );
}

/** Rich-text editor that writes sanitized-on-server HTML into a hidden input. */
export default function RichEditor({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const [html, setHtml] = useState(defaultValue ?? "");
  const [words, setWords] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ["https", "mailto"] }),
      Image,
      Placeholder.configure({ placeholder: "Start writing your article…" }),
    ],
    content: defaultValue ?? "",
    editorProps: { attributes: { class: "prose prose-britech max-w-none min-h-[420px] px-5 py-4 focus:outline-none" } },
    onCreate: ({ editor }) => setWords(editor.getText().trim().split(/\s+/).filter(Boolean).length),
    onUpdate: ({ editor }) => {
      setHtml(editor.getHTML());
      setWords(editor.getText().trim().split(/\s+/).filter(Boolean).length);
    },
  });

  return (
    <div className="overflow-hidden rounded-xl border border-navy-200 bg-white focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
      <input type="hidden" name={name} value={html} />
      {editor ? <Toolbar editor={editor} /> : <div className="h-11 border-b border-navy-100" />}
      <EditorContent editor={editor} />
      <div className="border-t border-navy-100 px-4 py-2 text-xs text-navy-400">
        {words} words · about {Math.max(1, Math.round(words / 220))} min read
      </div>
    </div>
  );
}
