import { Node } from "@tiptap/core";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "prosemirror-view";

let katexLoaded = false;
let katexLoading = false;
let katexLoadCallbacks = [];

// Helper: Refresh view to apply syntax highlighting/math after load
const triggerGlobalRefresh = (view) => {
    const editorView = view || window.__editorView;
    if (editorView && !editorView.isDestroyed) {
        editorView.dispatch(editorView.state.tr.setMeta("refresh_syntax", true));
    }
};

// Helper: Async Load Katex Library
function loadKatex() {
    if (katexLoaded) return Promise.resolve();
    if (katexLoading) {
        return new Promise((resolve) => katexLoadCallbacks.push(resolve));
    }

    katexLoading = true;
    return new Promise((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
        script.onload = () => {
            katexLoaded = true;
            katexLoading = false;
            resolve();
            katexLoadCallbacks.forEach((cb) => cb());
            katexLoadCallbacks = [];
            triggerGlobalRefresh();
        };
        script.onerror = () => {
            katexLoading = false;
            reject(new Error("Failed to load KaTeX"));
        };
        document.head.appendChild(script);
    });
}

// Helper: Render LaTeX string to DOM
function renderLatex(latex, displayMode = false) {
    if (!katexLoaded || !window.katex) return null;

    try {
        const rendered = document.createElement("span");
        window.katex.render(latex, rendered, {
            displayMode,
            throwOnError: false,
            errorColor: "#cc0000",
        });
        return rendered;
    } catch {
        return null;
    }
}

// Helper: Snapshot Scroll Position (to prevent jumping during render)
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

// Helper: Restore Scroll Position
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

const INLINE_LATEX_RE = /(?<!\$)\$(?!\$)([^\$\n]+?)\$/g;
const BLOCK_LATEX_RE = /\$\$([^\$]+?)\$\$/g;
const pluginKey = new PluginKey("latexPlugin");

export const LaTeXNode = Node.create({
    name: "latexNode",
    group: "inline",
    inline: true,
    atom: true,

    addProseMirrorPlugins() {
        const rendered = new Map();
        let editorViewRef = null;

        loadKatex().catch(() => {});

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

                        newState.doc.descendants((node, pos) => {
                            if (!node.isText) return;
                            const text = node.text;
                            if (!text) return;

                            const selFrom = newState.selection.from;
                            const selTo = newState.selection.to;

                            // Handle Block Latex $$...$$
                            BLOCK_LATEX_RE.lastIndex = 0;
                            let m;
                            while ((m = BLOCK_LATEX_RE.exec(text)) !== null) {
                                const matchStart = pos + m.index;
                                const matchEnd = matchStart + m[0].length;
                                const latex = m[1];
                                const isCursorInside = Math.max(matchStart, selFrom) <= Math.min(matchEnd, selTo);

                                if (isCursorInside) {
                                    const dollarStart1 = matchStart;
                                    const dollarEnd1 = matchStart + 2;
                                    const dollarStart2 = matchEnd - 2;
                                    const dollarEnd2 = matchEnd;
                                    const contentStart = matchStart + 2;
                                    const contentEnd = matchEnd - 2;

                                    decorations.push(
                                        Decoration.inline(dollarStart1, dollarEnd1, { style: "color: #ff6b6b; font-weight: 600;" }),
                                        Decoration.inline(contentStart, contentEnd, { style: "color: #4ecdc4;" }),
                                        Decoration.inline(dollarStart2, dollarEnd2, { style: "color: #ff6b6b; font-weight: 600;" })
                                    );
                                } else {
                                    decorations.push(
                                        Decoration.inline(matchStart, matchEnd, { style: "display: none !important" })
                                    );
                                    layoutChanged = true;
                                }

                                const key = `block-${latex}-${matchStart}`;
                                let renderedElement = rendered.get(key);

                                if (!renderedElement && katexLoaded) {
                                    renderedElement = renderLatex(latex, true);
                                    if (renderedElement) rendered.set(key, renderedElement);
                                }

                                if (renderedElement) {
                                    const wrapper = document.createElement("div");
                                    wrapper.contentEditable = "false";
                                    Object.assign(wrapper.style, {
                                        userSelect: "none",
                                        display: "block",
                                        margin: "8px 0",
                                        cursor: "pointer",
                                        textAlign: "center"
                                    });
                                    wrapper.appendChild(renderedElement.cloneNode(true));

                                    wrapper.addEventListener("mousedown", (e) => e.preventDefault());
                                    wrapper.addEventListener("click", (ev) => {
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

                                    decorations.push(Decoration.widget(matchEnd, wrapper, { side: 1 }));
                                }
                            }

                            // Handle Inline Latex $...$
                            INLINE_LATEX_RE.lastIndex = 0;
                            while ((m = INLINE_LATEX_RE.exec(text)) !== null) {
                                const matchStart = pos + m.index;
                                const matchEnd = matchStart + m[0].length;
                                const latex = m[1];
                                const isCursorInside = Math.max(matchStart, selFrom) <= Math.min(matchEnd, selTo);

                                if (isCursorInside) {
                                    const dollarStart1 = matchStart;
                                    const dollarEnd1 = matchStart + 1;
                                    const dollarStart2 = matchEnd - 1;
                                    const dollarEnd2 = matchEnd;
                                    const contentStart = matchStart + 1;
                                    const contentEnd = matchEnd - 1;

                                    decorations.push(
                                        Decoration.inline(dollarStart1, dollarEnd1, { style: "color: #ff6b6b; font-weight: 600;" }),
                                        Decoration.inline(contentStart, contentEnd, { style: "color: #4ecdc4;" }),
                                        Decoration.inline(dollarStart2, dollarEnd2, { style: "color: #ff6b6b; font-weight: 600;" })
                                    );
                                } else {
                                    const key = `inline-${latex}-${matchStart}`;
                                    let renderedElement = rendered.get(key);

                                    if (!renderedElement && katexLoaded) {
                                        renderedElement = renderLatex(latex, false);
                                        if (renderedElement) rendered.set(key, renderedElement);
                                    }

                                    if (renderedElement) {
                                        decorations.push(
                                            Decoration.inline(matchStart, matchEnd, { style: "display: none !important" })
                                        );

                                        const wrapper = document.createElement("span");
                                        wrapper.contentEditable = "false";
                                        Object.assign(wrapper.style, {
                                            userSelect: "none",
                                            cursor: "pointer"
                                        });
                                        wrapper.appendChild(renderedElement.cloneNode(true));

                                        wrapper.addEventListener("mousedown", (e) => e.preventDefault());
                                        wrapper.addEventListener("click", (ev) => {
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

                                        decorations.push(Decoration.widget(matchEnd, wrapper, { side: 1 }));
                                        layoutChanged = true;
                                    }
                                }
                            }
                        });

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

export default LaTeXNode;