import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const MarkdownSyntaxPluginKey = new PluginKey('markdownSyntax');

export function MarkdownSyntaxPlugin() {
    return new Plugin({
        key: MarkdownSyntaxPluginKey,
        state: {
            init(_, { doc }) {
                return DecorationSet.empty;
            },
            apply(tr, oldState) {
                if (!tr.docChanged && !tr.selectionSet) {
                    return oldState;
                }

                const decorations = [];
                const { selection } = tr;
                const { $from } = selection;
                const currentLine = $from.pos;

                tr.doc.descendants((node, pos) => {
                    // Only process headings
                    if (node.type.name === 'heading') {
                        const lineStart = pos;
                        const lineEnd = pos + node.nodeSize;

                        // Check if cursor is on this line
                        if (currentLine >= lineStart && currentLine <= lineEnd) {
                            const level = node.attrs.level;
                            const hashes = '#'.repeat(level) + ' ';
                            
                            // Add decoration to show the hashes at the start
                            decorations.push(
                                Decoration.widget(lineStart + 1, () => {
                                    const span = document.createElement('span');
                                    span.textContent = hashes;
                                    span.style.color = '#999';
                                    span.style.fontWeight = 'normal';
                                    span.style.userSelect = 'none';
                                    span.style.pointerEvents = 'none';
                                    span.contentEditable = 'false';
                                    // Match the heading size
                                    span.style.fontSize = 'inherit';
                                    return span;
                                }, { side: -1 })
                            );
                        }
                    }
                    return true;
                });

                return DecorationSet.create(tr.doc, decorations);
            },
        },
        props: {
            decorations(state) {
                return this.getState(state);
            },
        },
    });
}