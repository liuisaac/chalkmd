import { Node } from "@tiptap/core";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { highlightTree, classHighlighter } from "@lezer/highlight";
import { tags as t } from "@lezer/highlight";

// Language imports
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/lang-go";
import { php } from "@codemirror/lang-php";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { sql } from "@codemirror/lang-sql";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";

// Language map
const languageMap = {
    javascript: javascript(),
    js: javascript(),
    typescript: javascript({ typescript: true }),
    ts: javascript({ typescript: true }),
    jsx: javascript({ jsx: true }),
    tsx: javascript({ typescript: true, jsx: true }),
    python: python(),
    py: python(),
    cpp: cpp(),
    "c++": cpp(),
    c: cpp(),
    java: java(),
    rust: rust(),
    rs: rust(),
    go: go(),
    php: php(),
    css: css(),
    scss: css(),
    sass: css(),
    html: html(),
    xml: xml(),
    json: json(),
    markdown: markdown(),
    md: markdown(),
    sql: sql(),
    yaml: yaml(),
    yml: yaml(),
};

// Class name to color mapping (One Dark theme)
const classColors = {
    "tok-keyword": "#c678dd",
    "tok-name": "#e06c75",
    "tok-variableName": "#e06c75",
    "tok-typeName": "#e5c07b",
    "tok-className": "#e5c07b",
    "tok-propertyName": "#d19a66",
    "tok-string": "#98c379",
    "tok-number": "#d19a66",
    "tok-bool": "#d19a66",
    "tok-operator": "#56b6c2",
    "tok-operatorKeyword": "#56b6c2",
    "tok-comment": "#5c6370",
    "tok-meta": "#5c6370",
    "tok-function": "#61afef",
    "tok-self": "#d19a66",
    "tok-regexp": "#56b6c2",
    "tok-escape": "#56b6c2",
    "tok-link": "#56b6c2",
    "tok-url": "#56b6c2",
    "tok-heading": "#e06c75",
    "tok-atom": "#d19a66",
    "tok-invalid": "#ffffff",
};

function highlightCode(code, language) {
    if (!code) return escapeHtml(code || "");

    const lang = language?.toLowerCase() || "plaintext";
    const languageSupport = languageMap[lang];

    if (!languageSupport) {
        return escapeHtml(code);
    }

    try {
        const tree = languageSupport.language.parser.parse(code);
        const highlighted = [];
        let pos = 0;

        // Use classHighlighter to get CSS class names
        highlightTree(tree, classHighlighter, (from, to, classes) => {
            // Add any unhighlighted text before this token
            if (from > pos) {
                highlighted.push(escapeHtml(code.slice(pos, from)));
            }

            const text = code.slice(from, to);

            // Parse the class names and find matching colors
            const classList = classes.split(' ');
            let color = null;

            for (const cls of classList) {
                if (classColors[cls]) {
                    color = classColors[cls];
                    break;
                }
            }

            if (color) {
                highlighted.push(`<span style="color: ${color} !important;">${escapeHtml(text)}</span>`);
            } else {
                highlighted.push(escapeHtml(text));
            }

            pos = to;
        });

        // Add any remaining text
        if (pos < code.length) {
            highlighted.push(escapeHtml(code.slice(pos)));
        }

        return highlighted.join('');
    } catch (error) {
        console.error('Syntax highlighting error:', error);
        return escapeHtml(code);
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Match code blocks with newlines OR paragraph breaks
const CODE_BLOCK_RE = /```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g;
const pluginKey = new PluginKey("codeBlockPlugin");

function getScrollSnapshot(editorView) {
    if (!editorView) return null;
    const root = document.documentElement;
    const body = document.body;

    let editorScroller = null;
    let p = editorView.dom.parentElement;
    while (p) {
        const style = getComputedStyle(p);
        if (style.overflowY === "auto" || style.overflowY === "scroll") {
            editorScroller = p;
            break;
        }
        p = p.parentElement;
    }

    return {
        docElX: root.scrollLeft,
        docElY: root.scrollTop,
        bodyX: body.scrollLeft,
        bodyY: body.scrollTop,
        editorX: editorScroller?.scrollLeft ?? null,
        editorY: editorScroller?.scrollTop ?? null,
        editorScroller,
    };
}

function restoreScroll(snapshot) {
    if (!snapshot) return;
    const root = document.documentElement;
    const body = document.body;

    root.scrollLeft = snapshot.docElX;
    root.scrollTop = snapshot.docElY;
    body.scrollLeft = snapshot.bodyX;
    body.scrollTop = snapshot.bodyY;

    if (snapshot.editorScroller) {
        snapshot.editorScroller.scrollLeft = snapshot.editorX;
        snapshot.editorScroller.scrollTop = snapshot.editorY;
    }
}

// Serialize document to text with position mapping
function getDocumentText(doc) {
    let text = '';
    const posMap = [];

    doc.descendants((node, pos) => {
        if (node.isText && node.text) {
            const startPos = text.length;
            text += node.text;
            posMap.push({ textStart: startPos, textEnd: text.length, docStart: pos, docEnd: pos + node.nodeSize });
        } else if (node.type.name === 'paragraph' && !node.isText) {
            // Add newline between paragraphs
            if (text.length > 0 && !text.endsWith('\n')) {
                text += '\n';
            }
        }
    });

    return { text, posMap };
}

// Convert text position to document position
function textPosToDocPos(textPos, posMap) {
    for (const mapping of posMap) {
        if (textPos >= mapping.textStart && textPos < mapping.textEnd) {
            const offset = textPos - mapping.textStart;
            return mapping.docStart + offset;
        }
    }
    return null;
}

export const CodeBlockNode = Node.create({
    name: "codeBlockNode",
    group: "inline",
    inline: true,
    atom: true,

    addProseMirrorPlugins() {
        const highlighted = new Map();
        let editorViewRef = null;

        return [
            new Plugin({
                key: pluginKey,

                state: {
                    init(_, { doc }) {
                        return DecorationSet.create(doc, []);
                    },

                    apply(tr, oldDecos, oldState, newState) {
                        const decorations = [];
                        const scrollSnap = editorViewRef ? getScrollSnapshot(editorViewRef) : null;
                        let layoutChanged = false;

                        // Serialize entire document
                        const { text, posMap } = getDocumentText(newState.doc);

                        const selFrom = newState.selection.from;
                        const selTo = newState.selection.to;

                        CODE_BLOCK_RE.lastIndex = 0;
                        let m;

                        while ((m = CODE_BLOCK_RE.exec(text)) !== null) {
                            const textStart = m.index;
                            const textEnd = textStart + m[0].length;
                            const language = m[1] || "";
                            const code = m[2];

                            // Convert text positions to document positions
                            const matchStart = textPosToDocPos(textStart, posMap);
                            const matchEnd = textPosToDocPos(textEnd - 1, posMap);

                            if (matchStart === null || matchEnd === null) continue;

                            const isCursorInside = Math.max(matchStart, selFrom) <= Math.min(matchEnd + 1, selTo);

                            if (isCursorInside) {
                                // Cursor is inside - show raw markdown with syntax highlighting
                                const openBackticksStart = matchStart;
                                const openBackticksEnd = matchStart + 3;
                                const langStart = matchStart + 3;
                                const langEnd = matchStart + 3 + language.length;

                                // Opening backticks - RED
                                decorations.push(
                                    Decoration.inline(openBackticksStart, openBackticksEnd, {
                                        style: "color: #ff6b6b !important; font-weight: 600 !important;",
                                    })
                                );

                                // Language identifier - YELLOW
                                if (language) {
                                    decorations.push(
                                        Decoration.inline(langStart, langEnd, {
                                            style: "color: #ffd93d !important; font-weight: 500 !important;",
                                        })
                                    );
                                }

                                // Find code content positions (skip the newline after language)
                                const codeTextStart = textStart + 3 + language.length + 1;
                                const codeTextEnd = textEnd - 3;
                                const codeStart = textPosToDocPos(codeTextStart, posMap);
                                const codeEnd = textPosToDocPos(codeTextEnd - 1, posMap);

                                if (codeStart !== null && codeEnd !== null) {
                                    decorations.push(
                                        Decoration.inline(codeStart, codeEnd + 1, {
                                            style: "color: #a8dadc !important; font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;",
                                        })
                                    );
                                }

                                // Closing backticks - RED
                                const closeBackticksStart = matchEnd + 1 - 3;
                                const closeBackticksEnd = matchEnd + 1;
                                decorations.push(
                                    Decoration.inline(closeBackticksStart, closeBackticksEnd, {
                                        style: "color: #ff6b6b !important; font-weight: 600 !important;",
                                    })
                                );
                            } else {
                                // Cursor is outside - hide markdown and show rendered widget
                                decorations.push(
                                    Decoration.inline(matchStart, matchEnd + 1, {
                                        style: "display: none !important; visibility: hidden !important;",
                                    })
                                );
                                layoutChanged = true;

                                const key = `code-${language}-${code.substring(0, 50)}-${matchStart}`;
                                let highlightedCode = highlighted.get(key);

                                if (!highlightedCode) {
                                    highlightedCode = highlightCode(code, language);
                                    if (highlightedCode) {
                                        highlighted.set(key, highlightedCode);
                                    }
                                }

                                if (highlightedCode) {
                                    const pre = document.createElement("pre");
                                    pre.style.cssText = `
                                        margin: 8px 0 !important;
                                        border-radius: 6px !important;
                                        background-color: #282c34 !important;
                                        padding: 12px 16px !important;
                                        overflow: auto !important;
                                        cursor: pointer !important;
                                        position: relative !important;
                                        border: 1px solid #3e4451 !important;
                                    `;

                                    const codeElement = document.createElement("code");
                                    codeElement.style.cssText = `
                                        font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
                                        font-size: 13px !important;
                                        line-height: 1.6 !important;
                                        color: #abb2bf !important;
                                        display: block !important;
                                        white-space: pre !important;
                                    `;
                                    codeElement.innerHTML = highlightedCode;

                                    if (language) {
                                        const langLabel = document.createElement("div");
                                        langLabel.textContent = language;
                                        langLabel.style.cssText = `
                                            position: absolute !important;
                                            top: 4px !important;
                                            right: 8px !important;
                                            font-size: 10px !important;
                                            color: #5c6370 !important;
                                            text-transform: uppercase !important;
                                            font-weight: 600 !important;
                                            letter-spacing: 0.5px !important;
                                        `;
                                        pre.appendChild(langLabel);
                                    }

                                    pre.appendChild(codeElement);

                                    const wrapper = document.createElement("div");
                                    wrapper.contentEditable = "false";
                                    wrapper.style.cssText = `
                                        user-select: none !important;
                                        display: block !important;
                                        margin: 8px 0 !important;
                                    `;

                                    wrapper.addEventListener("mousedown", (e) => e.preventDefault());
                                    wrapper.addEventListener("click", (ev) => {
                                        let view = window.__editorView || ev.target.ownerDocument?.defaultView?.__editorView;
                                        if (!view) {
                                            const nearest = ev.target.closest(".ProseMirror");
                                            if (nearest && nearest.__editorView) view = nearest.__editorView;
                                        }
                                        if (!view) return;

                                        const tr = view.state.tr.setSelection(
                                            TextSelection.create(view.state.doc, matchStart, matchEnd + 1)
                                        );
                                        view.dispatch(tr);
                                        view.focus();
                                    });

                                    wrapper.appendChild(pre);

                                    decorations.push(
                                        Decoration.widget(matchEnd + 1, wrapper, { side: 1 })
                                    );
                                }
                            }
                        }

                        if (scrollSnap && layoutChanged) {
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    restoreScroll(scrollSnap);
                                });
                            });
                        }

                        return DecorationSet.create(newState.doc, decorations);
                    },
                },

                props: {
                    decorations(state) {
                        return this.getState(state);
                    },
                },

                view(editorView) {
                    editorViewRef = editorView;
                    editorView.dom.__editorView = editorView;
                    window.__editorView = editorView;
                    return {};
                },
            }),
        ];
    },
});

export default CodeBlockNode;
