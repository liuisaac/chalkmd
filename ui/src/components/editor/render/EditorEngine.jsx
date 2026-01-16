import { useEffect, useState, useRef } from "react";
import { EditorContent } from "@tiptap/react";
import { useVault } from "../../../VaultProvider";
import { useTabContext } from "../../../TabProvider";
import CustomEditor, { serialize, deserialize } from "./wysiwyg/CustomEditor";
import EditorNoteBar from "./EditorNoteBar";
import { HistoryManager } from "../stores/HistoryManager";
import EditorInfoWidget from "./EditorInfoWidget";

const EditorEngine = () => {
    const { content, setContent, currentFile, renameFile, readBinaryFile } =
        useVault();
    const { updateTabContent } = useTabContext();
    const titleInputRef = useRef(null);
    const [title, setTitle] = useState("");
    const lastSavedFileRef = useRef(currentFile);

    const editor = CustomEditor({
        content,
        setContent,
        updateTabContent,
        filePath: currentFile,
        readBinaryFile,
        editorProps: {
            handleKeyDown: (view, event) => {
                if (event.key === "ArrowUp") {
                    const { selection } = view.state;
                    if (selection.$anchor.pos <= 1) {
                        titleInputRef.current?.focus();
                        return true;
                    }
                }
                return false;
            },
        },
    });

    useEffect(() => {
        // only save history when switching files (not on mount)
        if (
            lastSavedFileRef.current &&
            lastSavedFileRef.current !== currentFile
        ) {
            if (editor && !editor.isDestroyed) {
                HistoryManager.saveHistory(lastSavedFileRef.current, editor);
            }
        }
        lastSavedFileRef.current = currentFile;

        // cleanup on unmount
        return () => {
            if (editor && !editor.isDestroyed && currentFile) {
                HistoryManager.saveHistory(currentFile, editor);
            }
        };
    }, [currentFile, editor]);

    useEffect(() => {
        if (editor && content !== serialize(editor)) {
            editor.commands.setContent(deserialize(content), false);
        }
    }, [content, editor]);

    useEffect(() => {
        if (currentFile) {
            const fileName = currentFile
                .replace(/\.[^/.]+$/, "")
                .split("/")
                .pop();
            setTitle(fileName);
        }
    }, [currentFile]);

    const submitTitleRename = async () => {
        const trimmedTitle = title.trim();
        const currentFileName = currentFile
            .replace(/\.[^/.]+$/, "")
            .split("/")
            .pop();
        if (trimmedTitle && trimmedTitle !== currentFileName) {
            try {
                const parentPath = currentFile.substring(
                    0,
                    currentFile.lastIndexOf("/")
                );
                const extension = currentFile.split(".").pop();
                const newPath = parentPath
                    ? `${parentPath}/${trimmedTitle}.${extension}`
                    : `${trimmedTitle}.${extension}`;
                await renameFile(currentFile, newPath);
            } catch (err) {
                setTitle(currentFileName);
            }
        }
    };

    const handleTitleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === "ArrowDown") {
            e.preventDefault();
            if (e.key === "Enter") e.target.blur();
            editor?.commands.focus("start");
        }
    };

    if (!editor) return <div>Loading editor...</div>;

    return (
        <div className="w-full h-full overflow-auto bg-offwhite border-t-[1px] border-[#e0e0e0] text-black text-left font-inconsolata selection:bg-[#E8DEFD]">
            <div className="max-w-[750px] mx-auto">
                <EditorInfoWidget />
                <EditorNoteBar />
                <div className="px-6 mt-4">
                    <input
                        ref={titleInputRef}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={submitTitleRename}
                        onKeyDown={handleTitleKeyDown}
                        className="w-full text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0 m-0 placeholder-gray-300 font-inconsolata -tracking-[0.01em]"
                        placeholder="Untitled"
                    />
                </div>
                <div className="text-light text-[#222222]">
                    <EditorContent editor={editor} />
                </div>
                <style>{`
                    .ProseMirror { 
                        padding: 1.5rem 1.5rem; 
                        outline: none; 
                        font-weight: 350; /* Adjust between 300 and 400 for precision */
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                        text-rendering: optimizeLegibility;
                    }
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
