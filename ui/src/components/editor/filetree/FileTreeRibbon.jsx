import {
    ArrowUpNarrowWide,
    FolderPlus,
    ListChevronsDownUp,
    ListChevronsUpDown,
    Maximize,
    SquarePenIcon,
} from "lucide-react";
import { useState } from "react";
import { useVault } from "../../../VaultProvider";

const FileTreeRibbon = () => {
    const size = 18;
    const [expandAll, setExpandAll] = useState(false);
    const { createFile, createFolder, setCurrentFile } = useVault();
    const iconStyle = "inline-block";

    const handleCreateFile = async () => {
        try {
            const path = await createFile();
            setCurrentFile(path);
            console.log("File created at path:", path);
        } catch (error) {
            console.error("Error creating file:", error);
        }
    }

    return (
        <div className="w-full h-10 flex flex-row items-center justify-center bg-topbar sticky top-0 pl-10">
            <div className="w-full flex flex-row items-center justify-center gap-4 text-gray-500">
                <SquarePenIcon
                    size={size}
                    className={iconStyle}
                    onClick={handleCreateFile}
                />
                <FolderPlus
                    size={size}
                    className={iconStyle}
                    onClick={() => {
                        console.log("Creating folder...");
                        createFolder();
                    }}
                />
                <ArrowUpNarrowWide size={size} className={iconStyle} />
                <Maximize size={size} className={iconStyle} />
                <div
                    onClick={() => setExpandAll(!expandAll)}
                    className="cursor-pointer"
                >
                    {expandAll ? (
                        <ListChevronsUpDown size={size} className={iconStyle} />
                    ) : (
                        <ListChevronsDownUp size={size} className={iconStyle} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileTreeRibbon;
