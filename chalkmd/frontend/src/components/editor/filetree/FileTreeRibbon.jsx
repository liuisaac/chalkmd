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
    const { createFile, createFolder } = useVault();
    return (
        <div className="w-full h-10 flex flex-row items-center justify-center bg-topbar sticky top-0 pl-10">
            <div className="w-full flex flex-row items-center justify-center gap-4 text-gray-500">
                <SquarePenIcon size={size} className="inline-block cursor-pointer" onClick={() => {console.log("Creating file..."); createFile()}} />
                <FolderPlus size={size} className="inline-block cursor-pointer" onClick={() => {console.log("Creating folder..."); createFolder()}} />
                <ArrowUpNarrowWide size={size} className="inline-block cursor-pointer" />
                <Maximize size={size} className="inline-block cursor-pointer" />
                <div onClick={() => setExpandAll(!expandAll)} className="cursor-pointer">
                    {expandAll ? (
                        <ListChevronsUpDown
                            size={size}
                            className="inline-block"
                        />
                    ) : (
                        <ListChevronsDownUp
                            size={size}
                            className="inline-block"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileTreeRibbon;