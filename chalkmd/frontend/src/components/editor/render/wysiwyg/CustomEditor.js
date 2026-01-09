import { useEditor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import plugins from "./plugins/PluginEntry";

const textToDoc = (text) => {
    const lines = text.split('\n');
    return {
        type: 'doc',
        content: lines.map(line => ({
            type: 'paragraph',
            content: line ? [{ type: 'text', text: line }] : []
        }))
    };
};

const docToText = (editor) => {
    if (!editor) return '';
    const { doc } = editor.state;
    const lines = [];
    doc.forEach(node => {
        lines.push(node.textContent);
    });
    return lines.join('\n');
};

// Accept editorProps so the Engine can pass the Arrow Key logic
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