import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";

function EditorButton({ active, onClick, children }) {
    return (
        <button
            type="button"
            className={`rep-btn ${active ? "active" : ""}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

export default function RichEditor({ value, onChange }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: true,
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Placeholder.configure({
                placeholder: "Начните писать статью…",
            }),
        ],
        content: value || "",
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) return null;

    return (
        <div className="rep-editor">
            <div className="rep-toolbar">
                <EditorButton
                    active={editor.isActive("bold")}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    B
                </EditorButton>

                <EditorButton
                    active={editor.isActive("italic")}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    I
                </EditorButton>

                <EditorButton
                    active={editor.isActive("underline")}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    U
                </EditorButton>

                <div className="rep-sep" />

                <EditorButton
                    active={editor.isActive("heading", { level: 2 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    H2
                </EditorButton>

                <EditorButton
                    active={editor.isActive("heading", { level: 3 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                    H3
                </EditorButton>

                <div className="rep-sep" />

                <EditorButton onClick={() => editor.chain().focus().toggleBulletList().run()}>
                    • List
                </EditorButton>

                <EditorButton onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                    1. List
                </EditorButton>

                <EditorButton onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                    ❝
                </EditorButton>

                <EditorButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                    —
                </EditorButton>

                <div className="rep-sep" />

                <EditorButton
                    onClick={() => {
                        const url = prompt("Введите ссылку");
                        if (url) {
                            editor.chain().focus().setLink({ href: url }).run();
                        }
                    }}
                >
                    🔗
                </EditorButton>
                <EditorButton
                    onClick={() => {
                        const html = prompt("Вставьте HTML код");
                        if (html) {
                            editor.commands.insertContent(html);
                        }
                    }}
                >
                    {"</>"}
                </EditorButton>
            </div>

            <div
                className={`rep-editor-body ${editor.isFocused ? "focused" : ""}`}
                onClick={() => editor.commands.focus()}
            >
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
