import { Node, mergeAttributes } from "@tiptap/core";

const INDENT_SIZE = 4;

export const CheckboxItem = Node.create({
    name: "checkboxItem",
    group: "block",
    content: "inline*",
    defining: true,

    addAttributes() {
        return {
            indent: {
                default: 0,
                parseHTML: (element) =>
                    parseInt(element.getAttribute("data-indent") || "0"),
            },
            checked: {
                default: false,
                parseHTML: (element) =>
                    element.getAttribute("data-checked") === "true",
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="checkbox-item"]',
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        return [
            "div",
            mergeAttributes(HTMLAttributes, {
                "data-type": "checkbox-item",
                "data-indent": node.attrs.indent,
                "data-checked": node.attrs.checked,
            }),
            0,
        ];
    },

    addNodeView() {
        return ({ node, getPos, editor }) => {
            const dom = document.createElement("div");
            const indent = node.attrs.indent || 0;
            const checked = node.attrs.checked || false;

            dom.setAttribute("data-type", "checkbox-item");

            dom.style.cssText = `
            margin-left: ${indent * 24}px; 
            display: flex; 
            align-items: flex-start; 
            gap: 8px;
            margin-bottom: 2px;
            width: 100%;
        `;

            const checkboxContainer = document.createElement("span");
            checkboxContainer.contentEditable = "false";
            checkboxContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            user-select: none;
            cursor: pointer;
            flex-shrink: 0;
            margin-top: 2px; /* Align with first line of text */
        `;

            const checkbox = document.createElement("span");
            checkbox.style.cssText = `
            display: inline-flex; 
            align-items: center; 
            justify-content: center; 
            width: 16px; 
            height: 16px; 
            border: 1px solid ${checked ? "#8b5cf6" : "#a0a0a0"}; 
            border-radius: 4px; 
            transition: all 0.1s; 
            background: ${checked ? "#8b5cf6" : "transparent"};
        `;

            if (checked) {
                const svg = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "svg"
                );
                svg.setAttribute("width", "12");
                svg.setAttribute("height", "12");
                svg.setAttribute("viewBox", "0 0 12 12");
                svg.style.pointerEvents = "none";

                const path = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "path"
                );

                const x = 2.25;
                const y = 6.5;
                const leftLeg = 2.5;
                const rightLeg = 5;

                const d = `M${x} ${y} l${leftLeg} ${leftLeg} l${rightLeg} -${rightLeg}`;

                path.setAttribute("d", d);
                path.setAttribute("stroke", "white");
                path.setAttribute("stroke-width", "1.7");
                path.setAttribute("fill", "none");
                path.setAttribute("stroke-linecap", "round");
                path.setAttribute("stroke-linejoin", "round");

                svg.appendChild(path);
                checkbox.appendChild(svg);
            }

            const toggleCheck = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof getPos === "function") {
                    const pos = getPos();
                    editor.commands.command(({ tr }) => {
                        tr.setNodeMarkup(pos, null, {
                            ...node.attrs,
                            checked: !node.attrs.checked,
                        });
                        return true;
                    });
                }
            };

            checkboxContainer.addEventListener("mousedown", toggleCheck);

            checkboxContainer.appendChild(checkbox);
            dom.appendChild(checkboxContainer);

            const contentDOM = document.createElement("span");
            contentDOM.setAttribute("data-content", "true");
            contentDOM.style.cssText =
                "flex-grow: 1; min-width: 0; line-height: 1.5; padding-top: 2px;";
            dom.appendChild(contentDOM);

            return {
                dom,
                contentDOM,
            };
        };
    },

    addKeyboardShortcuts() {
        return {
            Space: () => {
                if (this.editor.isActive("checkboxItem")) {
                    const { state } = this.editor;
                    const { $from } = state.selection;

                    if ($from.parentOffset === 0) {
                        return this.editor.commands.command(({ tr }) => {
                            const checkboxNode = $from.node($from.depth);
                            if (checkboxNode.type.name === "checkboxItem") {
                                const checked =
                                    checkboxNode.attrs.checked || false;
                                tr.setNodeMarkup(
                                    $from.before($from.depth),
                                    null,
                                    {
                                        ...checkboxNode.attrs,
                                        checked: !checked,
                                    }
                                );
                                return true;
                            }
                            return false;
                        });
                    }
                }
                return false;
            },

            Tab: () => {
                if (this.editor.isActive("checkboxItem")) {
                    return this.editor.commands.command(({ tr, state }) => {
                        const { $from } = state.selection;
                        const checkboxNode = $from.node($from.depth);

                        if (checkboxNode.type.name === "checkboxItem") {
                            const currentIndent =
                                checkboxNode.attrs.indent || 0;
                            tr.setNodeMarkup($from.before($from.depth), null, {
                                ...checkboxNode.attrs,
                                indent: currentIndent + 1,
                            });
                            return true;
                        }
                        return false;
                    });
                }
                return false;
            },

            "Shift-Tab": () => {
                if (this.editor.isActive("checkboxItem")) {
                    return this.editor.commands.command(({ tr, state }) => {
                        const { $from } = state.selection;
                        const checkboxNode = $from.node($from.depth);

                        if (checkboxNode.type.name === "checkboxItem") {
                            const currentIndent =
                                checkboxNode.attrs.indent || 0;
                            if (currentIndent > 0) {
                                tr.setNodeMarkup(
                                    $from.before($from.depth),
                                    null,
                                    {
                                        ...checkboxNode.attrs,
                                        indent: currentIndent - 1,
                                    }
                                );
                            }
                            return true;
                        }
                        return false;
                    });
                }
                return false;
            },

            Enter: () => {
                if (this.editor.isActive("checkboxItem")) {
                    return this.editor.commands.command(({ tr, state }) => {
                        const { $from } = state.selection;
                        const checkboxNode = $from.node($from.depth);

                        if (checkboxNode.type.name === "checkboxItem") {
                            const currentIndent =
                                checkboxNode.attrs.indent || 0;

                            if (checkboxNode.content.size === 0) {
                                tr.setNodeMarkup(
                                    $from.before($from.depth),
                                    state.schema.nodes.paragraph
                                );
                                return true;
                            }

                            const pos = $from.after($from.depth);
                            const newCheckbox =
                                state.schema.nodes.checkboxItem.create({
                                    indent: currentIndent,
                                    checked: false,
                                });
                            tr.insert(pos, newCheckbox);
                            tr.setSelection(
                                state.selection.constructor.near(
                                    tr.doc.resolve(pos + 1)
                                )
                            );
                            return true;
                        }
                        return false;
                    });
                }
                return false;
            },

            Backspace: () => {
                if (this.editor.isActive("checkboxItem")) {
                    return this.editor.commands.command(({ tr, state }) => {
                        const { $from } = state.selection;

                        if ($from.parentOffset !== 0) return false;

                        const checkboxNode = $from.node($from.depth);

                        if (checkboxNode.type.name === "checkboxItem") {
                            const currentIndent =
                                checkboxNode.attrs.indent || 0;

                            if (currentIndent > 0) {
                                tr.setNodeMarkup(
                                    $from.before($from.depth),
                                    null,
                                    {
                                        ...checkboxNode.attrs,
                                        indent: currentIndent - 1,
                                    }
                                );
                            } else {
                                tr.setNodeMarkup(
                                    $from.before($from.depth),
                                    state.schema.nodes.paragraph
                                );
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
        name: "checkbox_item",
        level: "block",
        start: (src) => {
            if (/^(\s*)- \[[ x]\]/.test(src)) return 0;
            return -1;
        },
        tokenize: (src, lexer) => {
            const match = /^(\s*)- \[([ x])\] ?(.*)(?:\n|$)/.exec(src);
            if (!match) return undefined;

            const spaces = match[1].length;
            const indentLevel = Math.floor(spaces / INDENT_SIZE);
            const checked = match[2] === "x";
            const content = match[3];

            return {
                type: "checkbox_item",
                raw: match[0],
                indent: indentLevel,
                checked: checked,
                text: content,
                tokens: content ? lexer.inlineTokens(content) : [],
            };
        },
    },

    parseMarkdown: (token, helpers) => {
        const content = helpers.parseInline(token.tokens || []);

        return {
            type: "checkboxItem",
            attrs: {
                indent: token.indent || 0,
                checked: token.checked || false,
            },
            content,
        };
    },

    renderMarkdown: (node, helpers) => {
        const indent = node.attrs?.indent || 0;
        const checked = node.attrs?.checked || false;
        const spaces = " ".repeat(indent * INDENT_SIZE);
        const content = helpers.renderChildren(node.content || []);
        const checkmark = checked ? "x" : " ";

        return `${spaces}- [${checkmark}] ${content}\n`;
    },

    addInputRules() {
        return [
            // Standard Rule: Paragraph -> Checkbox
            {
                find: /^(\s*)- \[([ x])\] $/,
                handler: ({ state, range, match }) => {
                    const spaces = match[1].length;
                    const indentLevel = Math.floor(spaces / INDENT_SIZE);
                    const checked = match[2] === "x";

                    const { tr } = state;
                    const $start = state.doc.resolve(range.from);
                    const nodeStart = $start.before();

                    const checkboxNode = state.schema.nodes.checkboxItem.create(
                        {
                            indent: indentLevel,
                            checked: checked,
                        }
                    );

                    tr.replaceWith(nodeStart, $start.after(), checkboxNode);

                    const newPos = nodeStart + 1;
                    tr.setSelection(
                        state.selection.constructor.near(tr.doc.resolve(newPos))
                    );

                    return tr;
                },
            },
            // NEW RULE: Bullet -> Checkbox (Override)
            {
                find: /^\[([ x])\] $/,
                handler: ({ state, range, match }) => {
                    const { tr } = state;
                    const { from, to } = range;
                    const $start = state.doc.resolve(from);
                    
                    // Only trigger if we are inside a bulletItem
                    if ($start.parent.type.name !== "bulletItem") return null;
                    
                    const indent = $start.parent.attrs.indent || 0;
                    const checked = match[1] === "x";
                    
                    // Convert the Bullet node to a Checkbox node
                    tr.setNodeMarkup($start.before(), state.schema.nodes.checkboxItem, {
                        indent,
                        checked,
                    });
                    
                    tr.delete(from, to);
                    
                    return tr;
                }
            }
        ];
    },
});

export default CheckboxItem;