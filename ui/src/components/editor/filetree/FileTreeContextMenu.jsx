import {
    FolderPlus,
    LayoutGrid,
    List,
    Copy,
    FolderInput,
    FolderSearch,
    Bookmark,
    ExternalLink,
    PencilRuler,
    Hash,
    Pencil,
    Trash2,
    SquarePenIcon,
} from "lucide-react";
import { useVault } from "../../../VaultProvider";
import ContextMenu from "../../ui/ContextMenu";

const FileTreeContextMenu = ({ x, y, onClose, onRenameInit, onDelete }) => {
    const { setCurrentFile } = useVault();

    const iconSize = 15;
    const itemClass =
        "flex items-center gap-3 rounded-md mx-1 px-2 py-1 hover:bg-black/[0.06] cursor-default font-sans text-[#333333] transition-colors";
    const dividerClass = "border-t border-gray-300 my-1";
    const labelClass = "";

    const handleRenameClick = (e) => {
        e.stopPropagation();
        onRenameInit();
        onClose();
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        onDelete();
        setCurrentFile(null);
        onClose();
    };

    const menu = (
        <>
            <div className={itemClass}>
                <SquarePenIcon size={iconSize} className="text-gray-500" />
                <span className={`${labelClass}`}>New note</span>
            </div>
            <div className={itemClass}>
                <FolderPlus size={iconSize} className="text-gray-500" />
                <span className={`${labelClass}`}>New folder</span>
            </div>
            <div className={itemClass}>
                <LayoutGrid size={iconSize} className="text-gray-500" />
                <span className={`${labelClass}`}>New canvas</span>
            </div>
            <div className={itemClass}>
                <List size={iconSize} className="text-gray-500" />
                <span className={`${labelClass}`}>New base</span>
            </div>

            <div className={dividerClass} />

            <div className={itemClass}>
                <Copy size={iconSize} className="text-gray-500" />
                <span className={`${labelClass}`}>Make a copy</span>
            </div>
            <div className={itemClass}>
                <FolderInput size={iconSize} className="text-gray-500" />
                <span className={`${labelClass}`}>Move folder to...</span>
            </div>
            <div className={itemClass}>
                <FolderSearch size={iconSize} className="text-gray-500" />
                <span className={`${labelClass}`}>Search in folder</span>
            </div>
            <div className={itemClass}>
                <Bookmark size={iconSize} className="text-gray-500" />
                <span className={`${labelClass}`}>Bookmark...</span>
            </div>

            <div className={dividerClass} />

            <div className={itemClass}>
                <Copy size={iconSize} className="text-gray-500" />
                <span className={`${labelClass}`}>Copy path</span>
            </div>
            <div className={itemClass}>
                <Copy size={iconSize} className="text-gray-500" />
                <span className={`${labelClass}`}>Copy relative path</span>
            </div>

            <div className={dividerClass} />

            <div className={itemClass}>
                <ExternalLink size={iconSize} className="text-gray-500" />
                <span className={`${labelClass}`}>
                    Show in system explorer
                </span>
            </div>

            <div className={dividerClass} />

            <div className={itemClass}>
                <PencilRuler size={iconSize} className="text-gray-500" />
                <span className={`${labelClass}`}>Create new drawing</span>
            </div>
            <div className={itemClass}>
                <Hash size={iconSize} className="text-gray-500" />
                <span className={`${labelClass}`}>Change icon</span>
            </div>

            <div className={dividerClass} />

            <div className={itemClass} onClick={handleRenameClick}>
                <Pencil size={iconSize} className="text-gray-500" />
                <span className={`${labelClass}`}>Rename...</span>
            </div>
            <div
                className={`${itemClass} text-red-500 hover:bg-red-100`}
                onClick={handleDeleteClick}
            >
                <Trash2 size={iconSize} className="text-red-400" />
                <span className="text-red-400">Delete</span>
            </div>
        </>
    );

    return <ContextMenu x={x} y={y} onClose={onClose}>{menu}</ContextMenu>;
};

export default FileTreeContextMenu;
