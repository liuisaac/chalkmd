import React from "react";
import { useVault } from "../../App";
import { ReadFile } from "../../../wailsjs/go/main/App";
import EditorTitleBar from "./EditorTitleBar";
import EditorSidebar from "./EditorSidebar";

const Editor = () => {
    const { files, currentFile, setCurrentFile, content, setContent } = useVault();
    
    const handleFileClick = async (file) => {
        if (file.isDir) return; // Don't try to open folders
        
        console.log("File clicked:", file);
        
        try {
            setCurrentFile(file.path);
            const fileContent = await ReadFile(file.path);
            setContent(fileContent);
        } catch (error) {
            console.error("Error loading file:", error);
        }
    };

    return (
        <div className="h-screen bg-offwhite flex flex-col font-sans">
            <EditorTitleBar />
            <div className="flex flex-1 overflow-hidden">
                <EditorSidebar 
                    files={files} 
                    onFileClick={handleFileClick}
                />
                <div className="flex-1 p-8 pt-10 overflow-y-scroll">
                    {currentFile ? (
                        <div>
                            <div className="text-sm text-gray-500 mb-4">Editing: {currentFile}</div>
                            <div className="whitespace-pre-wrap text-black">{content}</div>
                        </div>
                    ) : (
                        <div className="text-gray-400">Select a file to start editing</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Editor;