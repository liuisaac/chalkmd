import { TabProvider } from "./TabContext";
import EditorTitleBar from "./EditorTitleBar";
import EditorSidebar from "./EditorSidebar";
import EditorEngine from "./render/EditorEngine";
import { useVault } from "../../VaultProvider";
import { ReadFile } from "../../../wailsjs/go/main/App";
import { useState } from "react";

const Editor = () => {
    const { files, currentFile, setCurrentFile, setContent } = useVault();
    const [sidebarWidth, setSidebarWidth] = useState(235);

    const handleFileClick = async (file) => {
        if (file.isDir) return;

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
        <TabProvider>
            <div className="h-screen bg-offwhite flex flex-col font-sans overflow-hidden">
                <EditorTitleBar sidebarWidth={sidebarWidth} />
                <div className="flex overflow-hidden m-0 p-0 min-w-0">
                    <EditorSidebar
                        files={files}
                        onFileClick={handleFileClick}
                        setSidebarWidth={setSidebarWidth}
                    />
                    <div className="flex-1 pt-10 overflow-y-auto">
                        {currentFile ? <EditorEngine /> : <EmptyEditor />}
                    </div>
                </div>
            </div>
        </TabProvider>
    );
};

const EmptyEditor = () => {
    return (
        <div className="text-[#9164eb] w-full h-full flex flex-col justify-center gap-5 text-light border-t-[1px] border-[#e0e0e0] text-center">
            <span className="hover:text-[#aa8de4] select-none">
                Create a new note (Ctrl + N)
            </span>
            <span className="hover:text-[#aa8de4] select-none">
                Go to file (Ctrl + O)
            </span>
            <span className="hover:text-[#aa8de4] select-none">
                See recent files (Ctrl + O)
            </span>
            <span className="hover:text-[#aa8de4] select-none">Close</span>
        </div>
    );
};

export default Editor;
