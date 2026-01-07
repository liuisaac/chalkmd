import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { useVault } from "../../../App";
import { useTabContext } from "../TabContext";

const EditorEngine = () => {
    const { content, setContent } = useVault();
    const { updateTabContent } = useTabContext();

    const editor = useEditor({
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
                    return [
                        new Plugin({
                            props: {
                                decorations: (state) => {
                                    const decorations = [];
                                    const { doc, selection } = state;
                                    const cursorPos = selection.from;
                                    
                                    doc.descendants((node, pos) => {
                                        if (node.type.name === 'paragraph') {
                                            const text = node.textContent;
                                            const match = text.match(/^(#{1,6})\s/);
                                            
                                            if (match) {
                                                const hashEnd = match[0].length;
                                                const isActive = cursorPos > pos && cursorPos < pos + node.nodeSize;
                                                
                                                if (!isActive) {
                                                    // Hide ### completely
                                                    decorations.push(
                                                        Decoration.inline(pos + 1, pos + 1 + hashEnd, {
                                                            style: 'font-size: 0; width: 0; display: inline-block; overflow: hidden;'
                                                        })
                                                    );
                                                } else {
                                                    // Gray out when editing
                                                    decorations.push(
                                                        Decoration.inline(pos + 1, pos + 1 + hashEnd, {
                                                            style: 'color: #999;'
                                                        })
                                                    );
                                                }
                                            }
                                        }
                                    });
                                    
                                    return DecorationSet.create(doc, decorations);
                                },
                            },
                        }),
                    ];
                },
            }),
            Text,
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'max-w-none focus:outline-none min-h-screen p-6',
            },
        },
        onUpdate: ({ editor }) => {
            const text = editor.getText();
            setContent(text);
            updateTabContent(text);
            
            // Apply header classes
            const { doc } = editor.state;
            const tr = editor.state.tr;
            
            doc.descendants((node, pos) => {
                if (node.type.name === 'paragraph') {
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

    useEffect(() => {
        if (editor && content !== editor.getText()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) {
        return <div>Loading editor...</div>;
    }

    return (
        <div className="w-full h-full overflow-auto bg-offwhite text-black text-left font-inconsolata">
            <div className="max-w-[750px] mx-auto">
                <EditorContent editor={editor} />
                <style>{`
                    .ProseMirror p {
                        margin: 0.5em 0;
                    }
                    .ProseMirror p.heading-1 {
                        font-size: 2.5rem;
                        font-weight: bold;
                    }
                    .ProseMirror p.heading-2 {
                        font-size: 2rem;
                        font-weight: bold;
                    }
                    .ProseMirror p.heading-3 {
                        font-size: 1.75rem;
                        font-weight: bold;
                    }
                    .ProseMirror p.heading-4 {
                        font-size: 1.5rem;
                        font-weight: bold;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default EditorEngine;