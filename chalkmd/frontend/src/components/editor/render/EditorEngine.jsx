import { useEffect, useState, useRef } from "react";
import { EditorContent } from "@tiptap/react";
import { useVault } from "../../../VaultProvider";
import { useTabContext } from "../../../TabProvider";
import CustomEditor, { docToText, textToDoc } from "./wysiwyg/CustomEditor";
import EditorNoteBar from "./EditorNoteBar";

const EditorEngine = () => {
    const { content, setContent, currentFile, renameFile } = useVault();
    const { updateTabContent } = useTabContext();
    
    const titleInputRef = useRef(null);
    const [title, setTitle] = useState("");

    // Setup the editor with a specific keydown handler in editorProps
    const editor = CustomEditor({ 
        content, 
        setContent, 
        updateTabContent,
        // We inject the ArrowUp logic directly into the editor's prop configuration
        editorProps: {
            handleKeyDown: (view, event) => {
                if (event.key === "ArrowUp") {
                    const { state } = view;
                    const { selection } = state;
                    
                    // If the cursor is at the very start (position 1), move to title
                    if (selection.$anchor.pos <= 1) {
                        titleInputRef.current?.focus();
                        return true; // "true" stops the event from bubbling
                    }
                }
                return false;
            }
        }
    });

    useEffect(() => {
        if (currentFile) {
            const fileName = currentFile.replace(/\.[^/.]+$/, "").split("/").pop();
            setTitle(fileName);
        }
    }, [currentFile]);

    const submitTitleRename = async () => {
        const trimmedTitle = title.trim();
        const currentFileName = currentFile.replace(/\.[^/.]+$/, "").split("/").pop();

        if (trimmedTitle && trimmedTitle !== currentFileName) {
            try {
                const parentPath = currentFile.substring(0, currentFile.lastIndexOf("/"));
                const extension = currentFile.split('.').pop();
                const newPath = parentPath 
                    ? `${parentPath}/${trimmedTitle}.${extension}` 
                    : `${trimmedTitle}.${extension}`;
                
                await renameFile(currentFile, newPath);
            } catch (err) {
                console.error("Failed to rename:", err);
                setTitle(currentFileName);
            }
        }
    };

    const handleTitleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.target.blur();
            editor?.commands.focus('start');
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            editor?.commands.focus('start');
        }
    };

    // Keep content in sync
    useEffect(() => {
        if (editor) {
            const currentText = docToText(editor);
            if (content !== currentText) {
                editor.commands.setContent(textToDoc(content));
            }
        }
    }, [content, editor]);

    if (!editor) return <div>Loading editor...</div>;

    return (
        <div className="w-full h-full overflow-auto bg-offwhite border-t-[1px] border-[#e0e0e0] text-black text-left font-inconsolata">
            <div className="max-w-[750px] mx-auto">
                <EditorNoteBar />
                
                <div className="px-6 mt-4">
                    <input
                        ref={titleInputRef}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={submitTitleRename}
                        onKeyDown={handleTitleKeyDown}
                        className="w-full text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0 m-0 placeholder-gray-300 font-sans"
                        placeholder="Untitled"
                    />
                </div>

                <EditorContent editor={editor} />
                
                <style>{`
                    .ProseMirror { padding: 1.5rem 1.5rem; outline: none; }
                    .ProseMirror p { margin: 0.2em 0; }
                    .ProseMirror p.heading-1 { font-size: 1.75rem; font-weight: bold; }
                    .ProseMirror p.heading-2 { font-size: 1.65rem; font-weight: bold; }
                `}</style>
            </div>
        </div>
    );
};

export default EditorEngine;