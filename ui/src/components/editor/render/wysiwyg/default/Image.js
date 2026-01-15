import { Node, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { NodeSelection } from "@tiptap/pm/state";

const IMAGES_FOLDER = "Z Pasted Images\\";

export const ImageNode = Node.create({
    name: "imageNode",
    group: "block",
    atom: true,
    selectable: true,
    draggable: true,

    addOptions() {
        return {
            readBinaryFile: null,
        };
    },

    addAttributes() {
        return {
            src: {
                default: null,
            },
            alt: {
                default: null,
            },
            width: {
                default: null,
            },
            filename: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="obsidian-image-wrapper"]',
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        const { src, alt, width, filename } = node.attrs;
        
        if (!src && filename) {
            return [
                "div",
                mergeAttributes(HTMLAttributes, {
                    "data-type": "obsidian-image-wrapper",
                    class: "image-node-wrapper",
                    style: "margin: 8px 0;",
                }),
                [
                    "div",
                    {
                        style: width ? `width: ${width}px; max-width: 100%; padding: 10px; background: #f5f5f5; color: #666; border-radius: 4px;` : "max-width: 100%; padding: 10px; background: #f5f5f5; color: #666; border-radius: 4px;",
                    },
                    `Loading: ${filename}`,
                ],
            ];
        }

        if (!src) {
            return [
                "div",
                mergeAttributes(HTMLAttributes, {
                    "data-type": "obsidian-image-wrapper",
                    class: "image-node-wrapper",
                    style: "margin: 8px 0;",
                }),
                [
                    "div",
                    {
                        style: "padding: 10px; background: #ffe0e0; color: #cc0000; border-radius: 4px;",
                    },
                    `Failed to load: ${filename || alt}`,
                ],
            ];
        }
        
        return [
            "div",
            mergeAttributes(HTMLAttributes, {
                "data-type": "obsidian-image-wrapper",
                class: "image-node-wrapper",
                style: "margin: 8px 0;",
            }),
            [
                "img",
                {
                    "data-type": "obsidian-image",
                    src: src,
                    alt: alt || "",
                    draggable: "false",
                    style: width 
                        ? `width: ${width}px; max-width: 100%; height: auto; display: block; border-radius: 4px; cursor: pointer;` 
                        : "max-width: 100%; height: auto; display: block; border-radius: 4px; cursor: pointer;",
                },
            ],
        ];
    },

    addProseMirrorPlugins() {
        const readBinaryFile = this.options.readBinaryFile;
        
        return [
            new Plugin({
                key: new PluginKey("imageLoader"),
                view() {
                    const loadedImages = new Set();
                    
                    return {
                        update(view, prevState) {
                            if (!readBinaryFile) {
                                console.warn("readBinaryFile not available");
                                return;
                            }

                            // Load images that don't have src yet
                            view.state.doc.descendants((node, pos) => {
                                if (node.type.name === "imageNode" && node.attrs.filename && !node.attrs.src) {
                                    const key = `${node.attrs.filename}-${pos}`;
                                    
                                    // Avoid loading the same image multiple times
                                    if (loadedImages.has(key)) return;
                                    loadedImages.add(key);
                                    
                                    loadImage(node.attrs.filename, readBinaryFile).then((dataUrl) => {
                                        // Use setTimeout to ensure this runs after any pending updates
                                        setTimeout(() => {
                                            if (dataUrl) {
                                                const currentNode = view.state.doc.nodeAt(pos);
                                                if (currentNode && currentNode.type.name === "imageNode" && !currentNode.attrs.src) {
                                                    const tr = view.state.tr;
                                                    tr.setNodeMarkup(pos, null, {
                                                        ...currentNode.attrs,
                                                        src: dataUrl,
                                                    });
                                                    view.dispatch(tr);
                                                }
                                            } else {
                                                const currentNode = view.state.doc.nodeAt(pos);
                                                if (currentNode && currentNode.type.name === "imageNode" && !currentNode.attrs.src) {
                                                    const tr = view.state.tr;
                                                    tr.setNodeMarkup(pos, null, {
                                                        ...currentNode.attrs,
                                                        src: "",
                                                    });
                                                    view.dispatch(tr);
                                                }
                                            }
                                        }, 0);
                                    }).catch(err => {
                                        console.error("Failed to load image:", err);
                                    });
                                }
                            });
                        },
                    };
                },
            }),
            new Plugin({
                key: new PluginKey("imageSelection"),
                props: {
                    decorations(state) {
                        const decorations = [];
                        const { selection } = state;
                        
                        if (selection instanceof NodeSelection && selection.node.type.name === "imageNode") {
                            const node = selection.node;
                            const widthPart = node.attrs.width ? `|${node.attrs.width}` : "";
                            const syntax = `![[${node.attrs.filename}${widthPart}]]`;
                            
                            // Create a decoration to show the syntax above the image
                            const decoration = document.createElement("div");
                            decoration.className = "image-syntax-overlay";
                            decoration.contentEditable = "false";
                            decoration.innerHTML = `
                                <div style="
                                    background: #f0f0f0;
                                    border: 2px solid #4A90E2;
                                    border-radius: 4px;
                                    padding: 8px 12px;
                                    margin-bottom: 4px;
                                    font-family: 'Courier New', monospace;
                                    font-size: 14px;
                                    color: #333;
                                    user-select: text;
                                    cursor: text;
                                ">${syntax}</div>
                            `;
                        }
                        
                        return null;
                    },
                },
            }),
        ];
    },

    addKeyboardShortcuts() {
        return {
            // Delete the image node
            Backspace: () => {
                const { state, dispatch } = this.editor.view;
                const { selection } = state;
                
                if (selection instanceof NodeSelection && selection.node.type.name === "imageNode") {
                    const tr = state.tr.deleteSelection();
                    dispatch(tr);
                    return true;
                }
                return false;
            },
            Delete: () => {
                const { state, dispatch } = this.editor.view;
                const { selection } = state;
                
                if (selection instanceof NodeSelection && selection.node.type.name === "imageNode") {
                    const tr = state.tr.deleteSelection();
                    dispatch(tr);
                    return true;
                }
                return false;
            },
            // Navigate with arrow keys
            ArrowUp: () => {
                const { state } = this.editor.view;
                const { selection } = state;
                const { $from } = selection;
                
                // Check if cursor is at the start of a paragraph right after an image
                if ($from.nodeBefore && $from.nodeBefore.type.name === "imageNode") {
                    const pos = $from.pos - $from.nodeBefore.nodeSize;
                    const nodeSelection = NodeSelection.create(state.doc, pos);
                    this.editor.view.dispatch(state.tr.setSelection(nodeSelection));
                    return true;
                }
                return false;
            },
            ArrowDown: () => {
                const { state } = this.editor.view;
                const { selection } = state;
                
                if (selection instanceof NodeSelection && selection.node.type.name === "imageNode") {
                    // Move to after the image
                    const pos = selection.$from.pos + selection.node.nodeSize;
                    this.editor.commands.focus(pos);
                    return true;
                }
                return false;
            },
        };
    },

    addNodeView() {
        return ({ node, getPos, editor }) => {
            const container = document.createElement("div");
            container.className = "image-node-container";
            container.style.margin = "8px 0";
            container.style.position = "relative";
            
            const syntaxDiv = document.createElement("div");
            syntaxDiv.className = "image-syntax";
            syntaxDiv.style.display = "none";
            syntaxDiv.style.background = "#f0f0f0";
            syntaxDiv.style.border = "2px solid #4A90E2";
            syntaxDiv.style.borderRadius = "4px";
            syntaxDiv.style.padding = "8px 12px";
            syntaxDiv.style.marginBottom = "4px";
            syntaxDiv.style.fontFamily = "'Courier New', monospace";
            syntaxDiv.style.fontSize = "14px";
            syntaxDiv.style.color = "#333";
            
            const input = document.createElement("input");
            input.type = "text";
            input.style.width = "100%";
            input.style.background = "transparent";
            input.style.border = "none";
            input.style.outline = "none";
            input.style.fontFamily = "inherit";
            input.style.fontSize = "inherit";
            input.style.color = "inherit";
            
            const widthPart = node.attrs.width ? `|${node.attrs.width}` : "";
            input.value = `![[${node.attrs.filename}${widthPart}]]`;
            
            syntaxDiv.appendChild(input);
            container.appendChild(syntaxDiv);
            
            const imageWrapper = document.createElement("div");
            
            if (!node.attrs.src && node.attrs.filename) {
                imageWrapper.innerHTML = `<div style="padding: 10px; background: #f5f5f5; color: #666; border-radius: 4px;">Loading: ${node.attrs.filename}</div>`;
            } else if (!node.attrs.src) {
                imageWrapper.innerHTML = `<div style="padding: 10px; background: #ffe0e0; color: #cc0000; border-radius: 4px;">Failed to load: ${node.attrs.filename}</div>`;
            } else {
                const img = document.createElement("img");
                img.src = node.attrs.src;
                img.alt = node.attrs.alt || "";
                img.draggable = false;
                img.style.maxWidth = "100%";
                img.style.height = "auto";
                img.style.display = "block";
                img.style.borderRadius = "4px";
                img.style.cursor = "pointer";
                if (node.attrs.width) {
                    img.style.width = `${node.attrs.width}px`;
                }
                
                img.addEventListener("click", () => {
                    const pos = getPos();
                    const nodeSelection = NodeSelection.create(editor.state.doc, pos);
                    editor.view.dispatch(editor.state.tr.setSelection(nodeSelection));
                    editor.view.focus();
                });
                
                imageWrapper.appendChild(img);
            }
            
            container.appendChild(imageWrapper);
            
            // Handle input changes
            const updateFromInput = () => {
                const match = input.value.match(/^!\[\[([^\]|]+)(?:\|(\d+))?\]\]$/);
                if (match) {
                    const filename = match[1];
                    const width = match[2] ? parseInt(match[2]) : null;
                    
                    const pos = getPos();
                    const tr = editor.state.tr;
                    tr.setNodeMarkup(pos, null, {
                        src: null,
                        alt: filename,
                        width: width,
                        filename: filename,
                    });
                    editor.view.dispatch(tr);
                }
            };
            
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    updateFromInput();
                    // Move to next line
                    const pos = getPos() + node.nodeSize;
                    editor.commands.focus(pos);
                }
                if (e.key === "Escape") {
                    // Deselect
                    const pos = getPos() + node.nodeSize;
                    editor.commands.focus(pos);
                }
            });
            
            input.addEventListener("blur", () => {
                updateFromInput();
            });
            
            // Show/hide syntax based on selection
            const updateSelection = () => {
                const { selection } = editor.state;
                const pos = getPos();
                
                if (selection instanceof NodeSelection && 
                    selection.from === pos && 
                    selection.node.type.name === "imageNode") {
                    syntaxDiv.style.display = "block";
                    setTimeout(() => {
                        input.focus();
                        input.select();
                    }, 0);
                } else {
                    syntaxDiv.style.display = "none";
                }
            };
            
            editor.on("selectionUpdate", updateSelection);
            updateSelection();
            
            return {
                dom: container,
                destroy() {
                    editor.off("selectionUpdate", updateSelection);
                },
            };
        };
    },

    addInputRules() {
        return [
            {
                find: /!\[\[([^\]|]+)(?:\|(\d+))?\]\]$/,
                handler: ({ state, range, match }) => {
                    const filename = match[1];
                    const width = match[2] ? parseInt(match[2]) : null;
                    
                    const { tr } = state;
                    const $start = state.doc.resolve(range.from);
                    const nodeStart = $start.before();
                    
                    const imageNode = state.schema.nodes.imageNode.create({
                        src: null,
                        alt: filename,
                        width: width,
                        filename: filename,
                    });
                    
                    tr.replaceWith(nodeStart, $start.after(), imageNode);
                    const newPos = nodeStart + imageNode.nodeSize;
                    tr.setSelection(state.selection.constructor.near(tr.doc.resolve(newPos)));
                    
                    return tr;
                },
            },
        ];
    },
});

async function loadImage(filename, readBinaryFile) {
    try {
        const imagePath = `${IMAGES_FOLDER}${filename}`;
        console.log("Loading image from:", imagePath);
        
        const base64Data = await readBinaryFile(imagePath);
        
        if (!base64Data) {
            console.error("No data returned for image:", filename);
            return null;
        }
        
        const ext = filename.split('.').pop().toLowerCase();
        let mimeType = 'image/png';
        if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
        else if (ext === 'gif') mimeType = 'image/gif';
        else if (ext === 'webp') mimeType = 'image/webp';
        else if (ext === 'svg') mimeType = 'image/svg+xml';
        
        console.log("Image loaded successfully:", filename);
        return `data:${mimeType};base64,${base64Data}`;
    } catch (error) {
        console.error("Error loading image:", filename, error);
        return null;
    }
}

export default ImageNode;