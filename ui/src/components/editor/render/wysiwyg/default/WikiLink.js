import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "prosemirror-view";

const WIKILINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const pluginKey = new PluginKey("inlineWikilinkPlugin");

export function createWikilinkPlugin(onClickLink, files) {
    let editorViewRef = null;

    // Helper function to find file by path (relative to vault root)
    const findFileByPath = (targetPath) => {
        // Remove .md extension if present for comparison
        const normalizedTarget = targetPath.replace(/\.md$/, "");

        // Priority 1: Exact path match from vault root (e.g., "folder/file" or just "file")
        let foundFile = files.find((file) => {
            if (file.isDir) return false;
            const normalizedPath = file.path.replace(/\.md$/, "");
            return normalizedPath === normalizedTarget;
        });

        if (foundFile) return foundFile;

        // Priority 2: Filename match in vault root
        foundFile = files.find((file) => {
            if (file.isDir) return false;
            const fileName = file.path.split("/").pop();
            const nameWithoutExt = fileName.replace(/\.md$/, "");
            // Only match if file is in root (no "/" in path)
            return !file.path.includes("/") && nameWithoutExt === normalizedTarget;
        });

        if (foundFile) return foundFile;

        // Priority 3: Filename match anywhere in vault (last resort)
        return files.find((file) => {
            if (file.isDir) return false;
            const fileName = file.path.split("/").pop();
            const nameWithoutExt = fileName.replace(/\.md$/, "");
            return nameWithoutExt === normalizedTarget;
        });
    };

    return new Plugin({
        key: pluginKey,

        state: {
            init(_, { doc }) {
                return DecorationSet.create(doc, []);
            },

            apply(tr, oldDecos, oldState, newState) {
                const decorations = [];

                newState.doc.descendants((node, pos) => {
                    if (!node.isText) return;
                    const text = node.text;
                    if (!text) return;

                    let m;
                    WIKILINK_RE.lastIndex = 0;

                    while ((m = WIKILINK_RE.exec(text)) !== null) {
                        const matchStart = pos + m.index;
                        const matchEnd = matchStart + m[0].length;
                        const target = m[1].trim();
                        const alias = m[2] ? m[2].trim() : null;

                        // Find the actual file
                        const targetFile = findFileByPath(target);

                        // Display logic:
                        // - When editing (cursor inside): show full path from vault root
                        // - When viewing (cursor outside): show alias OR just the filename
                        let displayText;
                        if (alias) {
                            displayText = alias; // Always use alias if provided
                        } else if (targetFile) {
                            const fileName = targetFile.path.split("/").pop().replace(/\.md$/, "");
                            displayText = fileName;
                        } else {
                            displayText = target; // Fallback to target if not found
                        }

                        const selFrom = newState.selection.from;
                        const selTo = newState.selection.to;
                        const isCursorInside = Math.max(matchStart, selFrom) <= Math.min(matchEnd, selTo);

                        if (!isCursorInside) {
                            // Hide the raw text when cursor is outside
                            decorations.push(
                                Decoration.inline(matchStart, matchEnd, {
                                    style: "display: none !important",
                                })
                            );

                            // Create the clickable link widget
                            const linkSpan = document.createElement("span");
                            linkSpan.textContent = displayText;
                            linkSpan.className = "wikilink";
                            linkSpan.style.color = "#8b6cef";
                            linkSpan.style.cursor = "pointer";
                            linkSpan.style.textDecoration = "none";
                            linkSpan.contentEditable = "false";
                            linkSpan.style.userSelect = "none";

                            // Hover underline
                            linkSpan.addEventListener("mouseenter", () => {
                                linkSpan.style.textDecoration = "underline";
                            });
                            linkSpan.addEventListener("mouseleave", () => {
                                linkSpan.style.textDecoration = "none";
                            });

                            // Click handler
                            linkSpan.addEventListener("click", (ev) => {
                                ev.preventDefault();

                                if (onClickLink && targetFile) {
                                    onClickLink(targetFile.path);
                                } else if (onClickLink) {
                                    console.warn(`File not found for wikilink: ${target}`);
                                }
                            });

                            // Click to edit the raw text
                            linkSpan.addEventListener("dblclick", (ev) => {
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

                            decorations.push(
                                Decoration.widget(matchEnd, linkSpan, { side: 1 })
                            );
                        } else {
                            // Show styled text when cursor is inside for editing
                            // Display full path when editing
                            let editDisplayText = target;
                            if (targetFile && !alias && target !== targetFile.path.replace(/\.md$/, "")) {
                                // Auto-show full path if user typed just filename
                                // This helps them see where the file actually is
                                editDisplayText = `${target} → ${targetFile.path.replace(/\.md$/, "")}`;
                            }

                            decorations.push(
                                Decoration.inline(matchStart, matchEnd, {
                                    style: "color: #8b6cef; text-decoration: underline; text-decoration-thickness: 1px;",
                                })
                            );
                        }
                    }
                });

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
    });
}
