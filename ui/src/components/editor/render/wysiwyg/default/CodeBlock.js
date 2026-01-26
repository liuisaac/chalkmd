import { Node } from "@tiptap/core";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { highlightTree, classHighlighter } from "@lezer/highlight";

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

const languageMap = {
    javascript: javascript(), js: javascript(),
    typescript: javascript({ typescript: true }), ts: javascript({ typescript: true }),
    jsx: javascript({ jsx: true }), tsx: javascript({ typescript: true, jsx: true }),
    python: python(), py: python(), cpp: cpp(), "c++": cpp(), c: cpp(),
    java: java(), rust: rust(), rs: rust(), go: go(), php: php(),
    css: css(), scss: css(), sass: css(), html: html(), xml: xml(),
    json: json(), markdown: markdown(), md: markdown(), sql: sql(), yaml: yaml(), yml: yaml(),
};

const classColors = {
    "tok-keyword": "#c678dd", "tok-name": "#e06c75", "tok-variableName": "#e06c75",
    "tok-typeName": "#e5c07b", "tok-className": "#e5c07b", "tok-propertyName": "#d19a66",
    "tok-string": "#98c379", "tok-number": "#d19a66", "tok-bool": "#d19a66",
    "tok-operator": "#56b6c2", "tok-operatorKeyword": "#56b6c2", "tok-comment": "#5c6370",
    "tok-meta": "#5c6370", "tok-function": "#61afef", "tok-self": "#d19a66",
    "tok-regexp": "#56b6c2", "tok-escape": "#56b6c2", "tok-link": "#56b6c2",
    "tok-url": "#56b6c2", "tok-heading": "#e06c75", "tok-atom": "#d19a66",
};

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function highlightCode(code, language) {
    if (!code) return escapeHtml(code || "");
    const lang = language?.toLowerCase() || "plaintext";
    const languageSupport = languageMap[lang];
    if (!languageSupport) return escapeHtml(code);
    try {
        const tree = languageSupport.language.parser.parse(code);
        const highlighted = [];
        let pos = 0;
        highlightTree(tree, classHighlighter, (from, to, classes) => {
            if (from > pos) highlighted.push(escapeHtml(code.slice(pos, from)));
            const text = code.slice(from, to);
            const classList = classes.split(' ');
            let color = null;
            for (const cls of classList) { if (classColors[cls]) { color = classColors[cls]; break; } }
            highlighted.push(color ? `<span style="color: ${color} !important;">${escapeHtml(text)}</span>` : escapeHtml(text));
            pos = to;
        });
        if (pos < code.length) highlighted.push(escapeHtml(code.slice(pos)));
        return highlighted.join('');
    } catch { return escapeHtml(code); }
}

function getScrollSnapshot(editorView) {
    if (!editorView) return null;
    const root = document.documentElement;
    const body = document.body;
    let editorScroller = null;
    let p = editorView.dom.parentElement;
    while (p) {
        const style = getComputedStyle(p);
        if (style.overflowY === "auto" || style.overflowY === "scroll") { editorScroller = p; break; }
        p = p.parentElement;
    }
    return { docElX: root.scrollLeft, docElY: root.scrollTop, bodyX: body.scrollLeft, bodyY: body.scrollTop, editorX: editorScroller?.scrollLeft ?? null, editorY: editorScroller?.scrollTop ?? null, editorScroller };
}

function restoreScroll(snapshot) {
    if (!snapshot) return;
    const root = document.documentElement;
    const body = document.body;
    root.scrollLeft = snapshot.docElX; root.scrollTop = snapshot.docElY;
    body.scrollLeft = snapshot.bodyX; body.scrollTop = snapshot.bodyY;
    if (snapshot.editorScroller) { snapshot.editorScroller.scrollLeft = snapshot.editorX; snapshot.editorScroller.scrollTop = snapshot.editorY; }
}

// Match the LaTeX pattern - simpler regex that works within text nodes
const CODE_BLOCK_RE = /```([a-zA-Z0-9_+-]*\n[\s\S]+?)```/g;
const pluginKey = new PluginKey("codeBlockPlugin");

export const CodeBlockNode = Node.create({
    name: "codeBlockNode",
    group: "inline", inline: true, atom: true,

    addProseMirrorPlugins() {
        const highlighted = new Map();
        let editorViewRef = null;

        return [
            new Plugin({
                key: pluginKey,
                state: {
                    init(_, { doc }) { return DecorationSet.create(doc, []); },
                    apply(tr, oldDecos, oldState, newState) {
                        const decorations = [];
                        const scrollSnap = editorViewRef ? getScrollSnapshot(editorViewRef) : null;
                        let layoutChanged = false;

                        newState.doc.descendants((node, pos) => {
                            if (!node.isText) return;
                            const text = node.text;
                            if (!text) return;

                            const selFrom = newState.selection.from;
                            const selTo = newState.selection.to;

                            CODE_BLOCK_RE.lastIndex = 0;
                            let m;

                            while ((m = CODE_BLOCK_RE.exec(text)) !== null) {
                                const fullContent = m[1];
                                const firstNewline = fullContent.indexOf('\n');
                                const language = firstNewline > -1 ? fullContent.substring(0, firstNewline) : '';
                                const code = firstNewline > -1 ? fullContent.substring(firstNewline + 1) : fullContent;
                                
                                const matchStart = pos + m.index;
                                const matchEnd = matchStart + m[0].length;
                                const isCursorInside = Math.max(matchStart, selFrom) <= Math.min(matchEnd, selTo);

                                if (isCursorInside) {
                                    decorations.push(
                                        Decoration.inline(matchStart, matchEnd, { style: "background-color: #f3f3f3; font-family: monospace;" }),
                                        Decoration.inline(matchStart, matchStart + 3, { style: "color: #c678dd; font-weight: bold;" })
                                    );
                                } else {
                                    decorations.push(Decoration.inline(matchStart, matchEnd, { style: "display: none !important" }));
                                    layoutChanged = true;

                                    const key = `code-${language}-${code}-${matchStart}`;
                                    let html = highlighted.get(key);
                                    if (!html) {
                                        html = highlightCode(code, language);
                                        highlighted.set(key, html);
                                    }

                                    const container = document.createElement("div");
                                    container.contentEditable = "false";
                                    Object.assign(container.style, { userSelect: "none", display: "block", margin: "8px 0" });
                                    container.innerHTML = `
                                        <div style="position: relative; background: #f3f3f3; padding: 12px; border-radius: 6px; cursor: pointer; border: 1px solid #ddd;">
                                            ${language ? `<span style="position: absolute; top: 4px; right: 8px; font-size: 10px; color: #5c6370; text-transform: uppercase;">${escapeHtml(language)}</span>` : ''}
                                            <pre style="margin: 0; font-family: monospace; font-size: 13px; color: #333; white-space: pre-wrap;"><code>${html}</code></pre>
                                        </div>
                                    `;

                                    container.addEventListener("mousedown", (e) => e.preventDefault());
                                    container.addEventListener("click", (ev) => {
                                        let view = window.__editorView || ev.target.ownerDocument?.defaultView?.__editorView;
                                        if (!view) {
                                            const nearest = ev.target.closest(".ProseMirror");
                                            if (nearest && nearest.__editorView) view = nearest.__editorView;
                                        }
                                        if (!view) return;

                                        const tr = view.state.tr.setSelection(
                                            TextSelection.create(view.state.doc, matchStart, matchEnd)
                                        );
                                        view.dispatch(tr);
                                        view.focus();
                                    });

                                    decorations.push(Decoration.widget(matchEnd, container, { side: 1 }));
                                }
                            }
                        });

                        if (scrollSnap && layoutChanged) {
                            requestAnimationFrame(() => requestAnimationFrame(() => restoreScroll(scrollSnap)));
                        }
                        return DecorationSet.create(newState.doc, decorations);
                    }
                },
                props: { decorations(state) { return this.getState(state); } },
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