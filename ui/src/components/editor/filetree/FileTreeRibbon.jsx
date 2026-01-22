import {
    ArrowUpNarrowWide,
    ChevronsDownUp,
    ChevronsUpDown,
    FolderPlus,
    GalleryVertical,
    SquarePenIcon,
} from "lucide-react";
import { useState } from "react";
import { useVault } from "../../../VaultProvider";
import FileTreeSortContextMenu from "./FileTreeSortContextMenu";

const FileTreeRibbon = ({ sortKey, setSortKey, revealFile, setExpandAll, setCloseAll }) => {
    const size = 25;
    const [expandAll, setExpandAllState] = useState(false);
    const [sortContext, setSortContext] = useState(false);
    const [sortButtonPos, setSortButtonPos] = useState({ x: 0, y: 0 });
    const { createFile, createFolder, currentFile } = useVault();
    const iconStyle =
        "inline-block hover:bg-black/5 rounded-sm p-1 cursor-pointer transition-colors";

    const handleCreateFile = async () => {
        try {
            const path = await createFile();
            console.log("File created at path:", path);
        } catch (error) {
            console.error("Error creating file:", error);
        }
    };

    const handleRevealFile = async () => {
        try {
            revealFile(currentFile);
            console.log("Revealing file...");
        } catch (error) {
            console.error("Error revealing file:", error);
        }
    };

    return (
        <div className="w-full h-10 flex flex-row items-center justify-center bg-topbar sticky top-0 pl-10">
            <div className="w-full flex flex-row items-center justify-center gap-2 text-gray-500">
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

                <div
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setSortButtonPos({ x: rect.left, y: rect.bottom });
                        setSortContext(true);
                    }}
                >
                    <ArrowUpNarrowWide
                        size={size}
                        className={
                            sortContext
                                ? "inline-block bg-black/5 text-black rounded-sm p-1 transition-colors"
                                : iconStyle
                        }
                    />
                </div>

                <GalleryVertical size={size} className={iconStyle} onClick={handleRevealFile} />
                <div
                    className="cursor-pointer" onClick={() => {setExpandAllState(!expandAll)}}
                >
                    {expandAll ? (
                        <ChevronsUpDown size={size} className={iconStyle} onClick={() => setCloseAll(true)} />
                    ) : (
                        <ChevronsDownUp size={size} className={iconStyle} onClick={() => setExpandAll(true)} />
                    )}
                </div>
            </div>
            {sortContext && (
                <>
                    <FileTreeSortContextMenu
                        x={sortButtonPos.x}
                        y={sortButtonPos.y}
                        onClose={() => setSortContext(false)}
                        active={sortKey}
                        setActive={setSortKey}
                    />
                </>
            )}
        </div>
    );
};

export default FileTreeRibbon;
