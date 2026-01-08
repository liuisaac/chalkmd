import { useEffect } from "react";
import { EditorContent } from "@tiptap/react";
import { useVault } from "../../../App";
import { useTabContext } from "../TabContext";
import CustomEditor, { docToText, textToDoc } from "./wysiwyg/CustomEditor";
import EditorNoteBar from "./EditorNoteBar";

const EditorEngine = () => {
    const { content, setContent, currentFile } = useVault();
    const { updateTabContent } = useTabContext();
    const editor = CustomEditor({ content, setContent, updateTabContent });

    useEffect(() => {
        if (editor) {
            const currentText = docToText(editor);
            if (content !== currentText) {
                editor.commands.setContent(textToDoc(content));
            }
        }
    }, [content, editor]);

    if (!editor) {
        return <div>Loading editor...</div>;
    }

    return (
        <div className="w-full h-full overflow-auto bg-offwhite border-t-[1px] border-[#e0e0e0] text-black text-left font-inconsolata">
            <div className="max-w-[750px] mx-auto">
                <EditorNoteBar />
                <h1 className="text-3xl font-bold mt-6 px-6">
                    {currentFile
                        .replace(/\.[^/.]+$/, "")
                        .split("/")
                        .map((part, index, arr) => (
                            <span key={index}>
                                {part}
                                {index < arr.length - 1 && " / "}
                            </span>
                        ))}
                </h1>
                <EditorContent editor={editor} />
                <style>{`
                    .ProseMirror p {
                        margin: 0.5em 0;
                    }
                    .ProseMirror p.heading-1 {
                        font-size: 2.5rem;
                        font-weight: bold;
                    }
                    .ProseMirror p.heading-2 {
                        font-size: 2rem;
                        font-weight: bold;
                    }
                    .ProseMirror p.heading-3 {
                        font-size: 1.75rem;
                        font-weight: bold;
                    }
                    .ProseMirror p.heading-4 {
                        font-size: 1.5rem;
                        font-weight: bold;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default EditorEngine;
