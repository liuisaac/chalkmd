import { TabProvider } from './TabContext';
import EditorTitleBar from "./EditorTitleBar";
import EditorSidebar from "./EditorSidebar";
import EditorEngine from "./render/EditorEngine";
import { useVault } from '../../App';
import {
    ReadFile
} from "../../../wailsjs/go/main/App";

const Editor = () => {
    const { files, currentFile, setCurrentFile, setContent } = useVault();

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
                <EditorTitleBar />
                <div className="flex flex-1 overflow-hidden">
                    <EditorSidebar files={files} onFileClick={handleFileClick} />
                    <div className="flex-1 pt-10 overflow-y-scroll">
                        {currentFile ? (
                            <EditorEngine />
                        ) : (
                            <div className="text-gray-400 w-full h-full flex flex-col items-center justify-center">
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