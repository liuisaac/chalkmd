import { Node } from '@tiptap/core';
import { HeadingNodeView } from './HeadingNodeView';

export const HeadingWithPrefix = Node.create({
    name: 'heading',
    
    addOptions() {
        return {
            levels: [1, 2, 3, 4, 5, 6],
        };
    },
    
    content: 'inline*',
    
    group: 'block',
    
    defining: true,
    
    addAttributes() {
        return {
            level: {
                default: 1,
                rendered: false,
            },
        };
    },
    
    parseHTML() {
        return this.options.levels.map((level) => ({
            tag: `h${level}`,
            attrs: { level },
        }));
    },
    
    renderHTML({ node, HTMLAttributes }) {
        const hasLevel = this.options.levels.includes(node.attrs.level);
        const level = hasLevel ? node.attrs.level : this.options.levels[0];
        
        return [`h${level}`, HTMLAttributes, 0];
    },
    
    addNodeView() {
        return ({ node, view, getPos }) => {
            return new HeadingNodeView(node, view, getPos);
        };
    },
    
    addKeyboardShortcuts() {
        return this.options.levels.reduce((shortcuts, level) => ({
            ...shortcuts,
            [`Mod-Alt-${level}`]: () => this.editor.commands.setHeading({ level }),
        }), {});
    },
});