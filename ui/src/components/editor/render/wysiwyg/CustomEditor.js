import { useEditor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { History } from "@tiptap/extension-history";
import serialize from "../../lib/serializeDoc";
import deserialize from "../../lib/deserializeDoc";
import plugins from "./plugins/PluginEntry";
import BulletItem from "./default/Bullet";
import CheckboxItem from "./default/Checkbox";
import ImageNode from "./default/Image";
import LaTeXNode from "./default/LaTeX";
import CodeBlockNode from "./default/CodeBlock";
import { defaultShortcuts } from "./hotkeys/Shortcuts";
import { HistoryManager } from "../../stores/HistoryManager";
import settings from "../../../../../../settings.json";
import { Code } from "lucide-react";

const INDENT_SIZE = settings.indentSize || 4;
const isEditorUpdateRef = { current: false };

const editor = ({
    content,
    setContent,
    updateTabContent,
    filePath,
    readBinaryFile,
    writeBinaryFile,
    editorProps = {},
}) => {
    const savedData = HistoryManager.getHistory(filePath);

    return useEditor(
        {
            extensions: [
                Document,
                Paragraph.extend({
                    addAttributes() {
                        return { class: { default: null } };
                    },
                    addProseMirrorPlugins() {
                        return [plugins(this.editor, writeBinaryFile)];
                    },
                    addKeyboardShortcuts() {
                        return defaultShortcuts(this.editor);
                    },
                }),
                Text,
                CheckboxItem,
                BulletItem,
                LaTeXNode,
                CodeBlockNode,
                ImageNode.configure({
                    readBinaryFile: readBinaryFile,
                }),
                History.configure({
                    depth: 100,
                    newGroupDelay: 50,
                }),
            ],
            content: savedData ? savedData.json : deserialize(content, INDENT_SIZE),
            editorProps: {
                ...editorProps,
                attributes: {
                    class: "max-w-none focus:outline-none min-h-screen p-6",
                },
            },
            onCreate: ({ editor }) => {
                if (savedData) {
                    if (savedData.selection) {
                        try {
                            editor.commands.setTextSelection(savedData.selection);
                        } catch (e) {}
                    }
                    if (savedData.scroll && editor.view.dom) {
                        setTimeout(() => {
                            if (editor.view.dom)
                                editor.view.dom.scrollTop = savedData.scroll;
                        }, 0);
                    }
                }
            },
            onUpdate: ({ editor, transaction }) => {
                if (transaction.getMeta('skipUpdate')) return;

                isEditorUpdateRef.current = true;

                const text = serialize(editor, INDENT_SIZE);
                setContent(text);
                updateTabContent(text);

                const { doc, tr } = editor.state;
                let modified = false;

                const SYNTAX_RULES = [
                    { reg: /^(#{1,6})\s/, class: (m) => `heading-${m[1].length}` },
                    { reg: /^```/, class: () => 'code-block' },
                    { reg: /^>\s/, class: () => 'blockquote' },
                ];

                doc.descendants((node, pos) => {
                    if (node.type.name === "paragraph") {
                        let targetClass = null;

                        for (const rule of SYNTAX_RULES) {
                            const match = node.textContent.match(rule.reg);
                            if (match) {
                                targetClass = rule.class(match);
                                break;
                            }
                        }

                        if (node.attrs.class !== targetClass) {
                            tr.setNodeMarkup(pos, null, { ...node.attrs, class: targetClass });
                            modified = true;
                        }
                    }
                });

                if (modified) {
                    tr.setMeta('skipUpdate', true);
                    editor.view.dispatch(tr);
                }

                setTimeout(() => { isEditorUpdateRef.current = false; }, 0);
            },
        },
        [filePath]
    );
};

export { editor as default, serialize, deserialize, isEditorUpdateRef };