import { TabProvider } from './TabContext';
import EditorTitleBar from "./EditorTitleBar";
import EditorSidebar from "./EditorSidebar";
import EditorEngine from "./render/EditorEngine";
import { useVault } from '../../App';
import {
    ReadFile
} from "../../../wailsjs/go/main/App";
import { useState } from 'react';

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
                <div className="flex flex-1 overflow-hidden">
                    <EditorSidebar files={files} onFileClick={handleFileClick} setSidebarWidth={setSidebarWidth} />
                    <div className="flex-1 pt-10 overflow-y-scroll">
                        {currentFile ? (
                            <EditorEngine />
                        ) : (
                            <div className="text-gray-400 w-full h-full flex flex-col items-center justify-center border-t-[1px] border-[#e0e0e0]">
                                Select a file to start editing
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TabProvider>
    );
};

export default Editor;