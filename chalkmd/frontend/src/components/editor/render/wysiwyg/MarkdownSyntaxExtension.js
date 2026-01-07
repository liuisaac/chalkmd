import { Extension } from '@tiptap/core';
import { MarkdownSyntaxPlugin } from './MarkdownSyntaxPlugin';

export const MarkdownSyntaxExtension = Extension.create({
    name: 'markdownSyntax',

    addProseMirrorPlugins() {
        return [MarkdownSyntaxPlugin()];
    },
});