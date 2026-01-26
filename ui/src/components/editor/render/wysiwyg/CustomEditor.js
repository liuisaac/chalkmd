import { useEditor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";

// serialization
import serialize from "../../lib/serializeDoc";
import deserialize from "../../lib/deserializeDoc";

// custom plugins and extensions
import plugins from "./plugins/PluginEntry";
import BulletItem from "./default/Bullet";
import CheckboxItem from "./default/Checkbox";
import ImageNode from "./default/Image";
import LaTeXNode from "./default/LaTeX";
import CodeBlockNode from "./default/CodeBlock";
import { createWikilinkPlugin } from "./default/WikiLink";

// shortcuts
import { defaultShortcuts } from "./hotkeys/Shortcuts";

// history
import { History } from "@tiptap/extension-history";
import { HistoryManager } from "../../stores/HistoryManager";

import settings from "../../../../../../settings.json";

const INDENT_SIZE = settings.indentSize || 4;

const editor = ({
    content,
    setContent,
    updateTabContent,
    filePath,
    readBinaryFile,
    writeBinaryFile,
    onClickLink,
    files,
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
                        return [
                            plugins(this.editor, writeBinaryFile),
                            createWikilinkPlugin(onClickLink, files || []),
                        ];
                    },
                    addKeyboardShortcuts() {
                        return defaultShortcuts(this.editor);
                    },
                }),
                Text,
                CheckboxItem,
                BulletItem,
                ImageNode.configure({
                    readBinaryFile: readBinaryFile,
                }),
                LaTeXNode,
                CodeBlockNode.configure({}),
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
                            editor.commands.setTextSelection(
                                savedData.selection
                            );
                        } catch (e) { }
                    }
                    if (savedData.scroll && editor.view.dom) {
                        setTimeout(() => {
                            if (editor.view.dom)
                                editor.view.dom.scrollTop = savedData.scroll;
                        }, 0);
                    }
                }
            },
            onUpdate: ({ editor }) => {
                const text = serialize(editor, INDENT_SIZE);
                setContent(text);
                updateTabContent(text);

                const { doc, tr } = editor.state;
                let modified = false;

                doc.descendants((node, pos) => {
                    if (node.type.name === "paragraph") {
                        const textContent = node.textContent;
                        const match = textContent.match(/^(#{1,6})\s/);
                        if (match) {
                            const level = match[1].length;
                            const className = `heading-${level}`;
                            if (node.attrs.class !== className) {
                                tr.setNodeMarkup(pos, null, {
                                    class: className,
                                });
                                modified = true;
                            }
                        } else if (node.attrs.class) {
                            tr.setNodeMarkup(pos, null, { class: null });
                            modified = true;
                        }
                    }
                });

                if (modified) {
                    editor.view.dispatch(tr);
                }
            },
        },
        [filePath]
    );
};

export { editor as default, serialize, deserialize };