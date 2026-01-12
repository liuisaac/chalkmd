import { Node, mergeAttributes } from '@tiptap/core';

const INDENT_SIZE = 4;

const bulletUnicode = '•';

export const BulletItem = Node.create({
  name: 'bulletItem',
  
  group: 'block',
  
  content: 'inline*',
  
  defining: true,
  
  addAttributes() {
    return {
      indent: {
        default: 0,
        parseHTML: element => parseInt(element.getAttribute('data-indent') || '0'),
        renderHTML: attributes => ({
          'data-indent': attributes.indent,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="bullet-item"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const indent = node.attrs.indent || 0;
    
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'bullet-item',
        style: `margin-left: ${indent * 24 + 32}px; position: relative; display: flex; align-items: baseline;`,
      }),
      [
        'span',
        {
          contenteditable: 'false',
          style: 'position: absolute; left: -20px; bottom: 12px; user-select: none; pointer-events: none; font-size: 24px; line-height: 0; color: #a0a0a0;',
        },
        bulletUnicode,
      ],
      ['span', { 'data-content': 'true' }, 0],
    ];
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.editor.isActive('bulletItem')) {
          return this.editor.commands.command(({ tr, state }) => {
            const { $from } = state.selection;
            const bulletNode = $from.node($from.depth);
            
            if (bulletNode.type.name === 'bulletItem') {
              const currentIndent = bulletNode.attrs.indent || 0;
              tr.setNodeMarkup($from.before($from.depth), null, {
                ...bulletNode.attrs,
                indent: currentIndent + 1,
              });
              return true;
            }
            return false;
          });
        }
        return false;
      },
      
      'Shift-Tab': () => {
        if (this.editor.isActive('bulletItem')) {
          return this.editor.commands.command(({ tr, state }) => {
            const { $from } = state.selection;
            const bulletNode = $from.node($from.depth);
            
            if (bulletNode.type.name === 'bulletItem') {
              const currentIndent = bulletNode.attrs.indent || 0;
              if (currentIndent > 0) {
                tr.setNodeMarkup($from.before($from.depth), null, {
                  ...bulletNode.attrs,
                  indent: currentIndent - 1,
                });
              }
              return true;
            }
            return false;
          });
        }
        return false;
      },
      
      Enter: () => {
        if (this.editor.isActive('bulletItem')) {
          return this.editor.commands.command(({ tr, state }) => {
            const { $from } = state.selection;
            const bulletNode = $from.node($from.depth);
            
            if (bulletNode.type.name === 'bulletItem') {
              const currentIndent = bulletNode.attrs.indent || 0;
              
              if (bulletNode.content.size === 0) {
                tr.setNodeMarkup($from.before($from.depth), state.schema.nodes.paragraph);
                return true;
              }
              
              const pos = $from.after($from.depth);
              const newBullet = state.schema.nodes.bulletItem.create({ indent: currentIndent });
              tr.insert(pos, newBullet);
              tr.setSelection(state.selection.constructor.near(tr.doc.resolve(pos + 1)));
              return true;
            }
            return false;
          });
        }
        return false;
      },
      
      Backspace: () => {
        if (this.editor.isActive('bulletItem')) {
          return this.editor.commands.command(({ tr, state }) => {
            const { $from } = state.selection;
            
            if ($from.parentOffset !== 0) return false;
            
            const bulletNode = $from.node($from.depth);
            
            if (bulletNode.type.name === 'bulletItem') {
              const currentIndent = bulletNode.attrs.indent || 0;
              
              if (currentIndent > 0) {
                tr.setNodeMarkup($from.before($from.depth), null, {
                  ...bulletNode.attrs,
                  indent: currentIndent - 1,
                });
              } else {
                tr.setNodeMarkup($from.before($from.depth), state.schema.nodes.paragraph);
              }
              return true;
            }
            return false;
          });
        }
        return false;
      },
    };
  },

  markdownTokenizer: {
    name: 'bullet_item',
    level: 'block',
    start: (src) => {
      const match = /^(\s*)- /.exec(src);
      return match ? 0 : -1;
    },
    tokenize: (src, tokens, lexer) => {
      const match = /^(\s*)- (.+?)(?:\n|$)/.exec(src);
      
      if (!match) return undefined;
      
      const spaces = match[1].length;
      const indentLevel = Math.floor(spaces / INDENT_SIZE);
      const content = match[2];
      
      return {
        type: 'bullet_item',
        raw: match[0],
        indent: indentLevel,
        text: content,
        tokens: lexer.inlineTokens(content),
      };
    },
  },

  parseMarkdown: (token, helpers) => {
    const content = helpers.parseInline(token.tokens || []);
    
    return {
      type: 'bulletItem',
      attrs: {
        indent: token.indent || 0,
      },
      content,
    };
  },

  renderMarkdown: (node, helpers, context) => {
    const indent = node.attrs?.indent || 0;
    const spaces = ' '.repeat(indent * INDENT_SIZE);
    const content = helpers.renderChildren(node.content || []);
    
    return `${spaces}- ${content}\n`;
  },

  addInputRules() {
    return [
      {
        find: /^(\s*)- $/,
        handler: ({ state, range, match, chain }) => {
          const spaces = match[1].length;
          const indentLevel = Math.floor(spaces / INDENT_SIZE);
          
          const { tr } = state;
          const $start = state.doc.resolve(range.from);
          const nodeStart = $start.before();
          
          const bulletNode = state.schema.nodes.bulletItem.create({
            indent: indentLevel,
          });
          
          tr.replaceWith(nodeStart, $start.after(), bulletNode);
          
          const newPos = nodeStart + 1;
          tr.setSelection(state.selection.constructor.near(tr.doc.resolve(newPos)));
          
          return tr;
        },
      },
    ];
  },
});

export default BulletItem;