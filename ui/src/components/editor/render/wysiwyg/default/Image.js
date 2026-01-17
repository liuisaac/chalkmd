import { Node } from "@tiptap/core";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "prosemirror-view";
import settings from "../../../../../../../settings";

const IMAGES_FOLDER = settings.imageFolder || "";

async function loadImage(filename, readBinaryFile) {
    try {
        const imagePath = `${IMAGES_FOLDER}${filename}`;
        const base64Data = await readBinaryFile(imagePath);
        if (!base64Data) return null;

        const ext = filename.split(".").pop().toLowerCase();
        let mimeType = "image/png";
        if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
        else if (ext === "gif") mimeType = "image/gif";
        else if (ext === "webp") mimeType = "image/webp";
        else if (ext === "svg") mimeType = "image/svg+xml";

        return `data:${mimeType};base64,${base64Data}`;
    } catch {
        return null;
    }
}

const TAG_RE = /!\[\[([^\]|]+)(?:\|(\d+))?\]\]/g;
const pluginKey = new PluginKey("inlineImagePlugin");

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

export const ImageNode = Node.create({
    name: "inlineImage",
    group: "inline",
    inline: true,
    atom: false, 
    selectable: true,
    draggable: true,

    addOptions() {
        return {
            readBinaryFile: null,
            maxWidth: 600,
        };
    },

    addProseMirrorPlugins() {
        const readBinaryFile = this.options.readBinaryFile;
        const maxWidth = this.options.maxWidth;
        const loaded = new Map();
        const loading = new Set();
        let editorViewRef = null;

        return [
            new Plugin({
                key: pluginKey,

                state: {
                    init(_, { doc }) {
                        return DecorationSet.create(doc, []);
                    },

                    apply(tr, oldDecos, oldState, newState) {
                        const meta = tr.getMeta(pluginKey);
                        if (meta && meta.loadedKey && meta.dataUrl) {
                            loaded.set(meta.loadedKey, meta.dataUrl);
                        }

                        const decorations = [];
                        const scrollSnap = editorViewRef ? getScrollSnapshot(editorViewRef) : null;
                        let layoutChanged = false;

                        newState.doc.descendants((node, pos) => {
                            if (!node.isText) return;
                            const text = node.text;
                            if (!text) return;

                            let m;
                            TAG_RE.lastIndex = 0;

                            while ((m = TAG_RE.exec(text)) !== null) {
                                const matchStart = pos + m.index;
                                const matchEnd = matchStart + m[0].length;
                                const filename = m[1];
                                const width = m[2] ? parseInt(m[2], 10) : null;
                                const key = `${filename}@${matchStart}`;

                                const selFrom = newState.selection.from;
                                const selTo = newState.selection.to;
                                const isCursorInside = Math.max(matchStart, selFrom) <= Math.min(matchEnd, selTo);
                                const dataUrl = loaded.get(key);

                                if (dataUrl) {
                                    if (!isCursorInside) {
                                        decorations.push(
                                            Decoration.inline(matchStart, matchEnd, {
                                                style: "display: none !important",
                                            })
                                        );
                                        layoutChanged = true;
                                    } else {
                                        decorations.push(
                                            Decoration.inline(matchStart, matchEnd, {
                                                style: "color: #8250ff; text-decoration: underline; text-decoration-thickness: 1px;",
                                            })
                                        );
                                    }

                                    const img = document.createElement("img");
                                    img.src = dataUrl;
                                    img.draggable = false;
                                    img.style.maxWidth = `${Math.min(width || maxWidth, maxWidth)}px`;
                                    img.style.height = "auto";
                                    img.style.borderRadius = "4px";
                                    img.style.cursor = "pointer";
                                    img.style.display = "inline-block";
                                    img.style.verticalAlign = "middle";
                                    img.title = filename;

                                    img.addEventListener("mousedown", (e) => e.preventDefault());

                                    img.addEventListener("click", (ev) => {
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

                                    const wrapper = document.createElement("span");
                                    wrapper.contentEditable = "false";
                                    wrapper.style.userSelect = "none";
                                    wrapper.style.display = "inline-block";
                                    wrapper.style.verticalAlign = "middle";
                                    wrapper.appendChild(img);

                                    decorations.push(
                                        Decoration.widget(matchEnd, wrapper, { side: 1 })
                                    );

                                } else {
                                    if (!loaded.has(key) && readBinaryFile && !loading.has(key)) {
                                        loading.add(key);
                                        loadImage(filename, readBinaryFile)
                                            .then((data) => {
                                                loading.delete(key);
                                                if (!data) return;
                                                const view = window.__editorView;
                                                if (view) {
                                                    view.dispatch(view.state.tr.setMeta(pluginKey, {
                                                        loadedKey: key,
                                                        dataUrl: data,
                                                    }));
                                                }
                                            })
                                            .catch(() => loading.delete(key));
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

export default ImageNode;