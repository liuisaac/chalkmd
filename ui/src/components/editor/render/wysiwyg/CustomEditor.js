import { useEditor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import plugins from "./plugins/PluginEntry";
import BulletItem from "./default/Bullet";
import CheckboxItem from "./default/Checkbox";
import { defaultShortcuts } from "./hotkeys/Shortcuts";
import { History } from "@tiptap/extension-history";
import { HistoryManager } from "../../stores/HistoryManager";
import ImageNode from "./default/Image";

const INDENT_SIZE = 4;

const textToDoc = (text) => {
    if (typeof text !== "string" || !text) {
        return {
            type: "doc",
            content: [{ type: "paragraph" }],
        };
    }

    const lines = text.split("\n");
    const content = [];
    for (const line of lines) {
        // Parse image syntax FIRST
        const imageMatch = line.match(/^!\[\[([^\]|]+)(?:\|(\d+))?\]\]$/);
        if (imageMatch) {
            const filename = imageMatch[1];
            const width = imageMatch[2] ? parseInt(imageMatch[2]) : null;
            content.push({
                type: "imageNode",
                attrs: {
                    src: null,  // Will be loaded async
                    alt: filename,
                    width: width,
                    filename: filename,
                },
            });
            continue;
        }

        const checkboxMatch = line.match(/^(\s*)- \[([ x])\]\s?(.*)$/);
        if (checkboxMatch) {
            const spaces = checkboxMatch[1].length;
            const indentLevel = Math.floor(spaces / INDENT_SIZE);
            const checked = checkboxMatch[2] === "x";
            const itemText = checkboxMatch[3];
            content.push({
                type: "checkboxItem",
                attrs: { indent: indentLevel, checked: checked },
                content: itemText ? [{ type: "text", text: itemText }] : [],
            });
            continue;
        }

        const bulletMatch = line.match(/^(\s*)- (.*)$/);
        if (bulletMatch) {
            const spaces = bulletMatch[1].length;
            const indentLevel = Math.floor(spaces / INDENT_SIZE);
            const itemText = bulletMatch[2];
            content.push({
                type: "bulletItem",
                attrs: { indent: indentLevel },
                content: itemText ? [{ type: "text", text: itemText }] : [],
            });
            continue;
        }

        content.push({
            type: "paragraph",
            content: line ? [{ type: "text", text: line }] : [],
        });
    }
    return {
        type: "doc",
        content: content.length > 0 ? content : [{ type: "paragraph" }],
    };
};

const docToText = (editor) => {
    if (!editor || editor.isDestroyed || !editor.state) return "";

    const { doc } = editor.state;
    const lines = [];
    doc.forEach((node) => {
        if (node.type.name === "checkboxItem") {
            const indent = node.attrs.indent || 0;
            const checked = node.attrs.checked || false;
            const spaces = " ".repeat(indent * INDENT_SIZE);
            const content = node.textContent;
            const checkmark = checked ? "x" : " ";
            lines.push(`${spaces}- [${checkmark}] ${content}`);
        } else if (node.type.name === "bulletItem") {
            const indent = node.attrs.indent || 0;
            const spaces = " ".repeat(indent * INDENT_SIZE);
            const content = node.textContent;
            lines.push(`${spaces}- ${content}`);
        } else if (node.type.name === "imageNode") {
            const { filename, width } = node.attrs;
            const widthPart = width ? `|${width}` : "";
            lines.push(`![[${filename}${widthPart}]]`);
        } else {
            lines.push(node.textContent);
        }
    });
    return lines.join("\n");
};

const editor = ({
    content,
    setContent,
    updateTabContent,
    filePath,
    readBinaryFile,
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
                        return [plugins(this.editor)];
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
                History.configure({
                    depth: 100,
                    newGroupDelay: 50,
                }),
            ],
            content: savedData ? savedData.json : textToDoc(content),
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
            onUpdate: ({ editor }) => {
                const text = docToText(editor);
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

export { editor as default, docToText, textToDoc };