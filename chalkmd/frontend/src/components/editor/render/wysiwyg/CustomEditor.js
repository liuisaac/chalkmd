import { useEditor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import plugins from "./plugins/PluginEntry";

// nodes
import BulletItem from "./default/Bullet";

const INDENT_SIZE = 4;

const textToDoc = (text) => {
    const lines = text.split('\n');
    const content = [];
    
    for (const line of lines) {
        // Check if line is a bullet item
        const bulletMatch = line.match(/^(\s*)- (.*)$/);
        if (bulletMatch) {
            const spaces = bulletMatch[1].length;
            const indentLevel = Math.floor(spaces / INDENT_SIZE);
            const text = bulletMatch[2];
            
            content.push({
                type: 'bulletItem',
                attrs: { indent: indentLevel },
                content: text ? [{ type: 'text', text }] : []
            });
        } else {
            // Regular paragraph
            content.push({
                type: 'paragraph',
                content: line ? [{ type: 'text', text: line }] : []
            });
        }
    }
    
    return {
        type: 'doc',
        content: content.length > 0 ? content : [{ type: 'paragraph' }]
    };
};

const docToText = (editor) => {
    if (!editor) return '';
    const { doc } = editor.state;
    const lines = [];
    
    doc.forEach(node => {
        if (node.type.name === 'bulletItem') {
            const indent = node.attrs.indent || 0;
            const spaces = ' '.repeat(indent * INDENT_SIZE);
            const content = node.textContent;
            lines.push(`${spaces}- ${content}`);
        } else {
            lines.push(node.textContent);
        }
    });
    
    return lines.join('\n');
};

const editor = ({ content, setContent, updateTabContent, editorProps = {} }) => {
    return useEditor({
        extensions: [
            Document,
            Paragraph.extend({
                addAttributes() {
                    return {
                        class: {
                            default: null,
                        },
                    };
                },
                addProseMirrorPlugins() {
                    return [plugins(this.editor)];
                },
            }),
            Text,
            BulletItem
        ],
        content: textToDoc(content),
        editorProps: {
            // Merge external props from EditorEngine
            ...editorProps,
            attributes: {
                // RESTORED: Your exact original classes
                class: "max-w-none focus:outline-none min-h-screen p-6",
            },
        },
        onUpdate: ({ editor }) => {
            const text = docToText(editor);
            setContent(text);
            updateTabContent(text);

            const { doc } = editor.state;
            const tr = editor.state.tr;

            doc.descendants((node, pos) => {
                if (node.type.name === "paragraph") {
                    const text = node.textContent;
                    const match = text.match(/^(#{1,6})\s/);

                    if (match) {
                        const level = match[1].length;
                        const className = `heading-${level}`;
                        if (node.attrs.class !== className) {
                            tr.setNodeMarkup(pos, null, { class: className });
                        }
                    } else if (node.attrs.class) {
                        tr.setNodeMarkup(pos, null, { class: null });
                    }
                }
            });

            if (tr.docChanged) {
                editor.view.dispatch(tr);
            }
        },
    });
};

export { editor as default, docToText, textToDoc };