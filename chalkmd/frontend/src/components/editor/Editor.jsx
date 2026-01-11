import { useTabContext } from "../../TabProvider";
import EditorTitleBar from "./EditorTitleBar";
import EditorSidebar from "./EditorSidebar";
import EditorEngine from "./render/EditorEngine";
import { useVault } from "../../VaultProvider";
import { useEffect, useState } from "react";

const Editor = () => {
    const { files, currentFile, setCurrentFile, setContent, readFile } = useVault();
    const { loadFileInTab } = useTabContext();
    const [sidebarWidth, setSidebarWidth] = useState(235);

    const handleFileClick = async (file) => {
        if (file.isDir) return;

        console.log("File clicked:", file);

        try {
            setCurrentFile(file.path);
            const fileContent = await readFile(file.path);
            setContent(fileContent);
            loadFileInTab(file.path, fileContent);
        } catch (error) {
            console.error("Error loading file:", error);
        }
    };

    useEffect(() => {
        if (currentFile) {
            const loadFileContent = async () => {
                const fileContent = await readFile(currentFile);
                setContent(fileContent);
            };
            loadFileContent();
        }
    }, [currentFile]);

    return (
        <div className="h-screen w-screen bg-offwhite flex flex-col font-sans overflow-hidden fixed right-0">
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
