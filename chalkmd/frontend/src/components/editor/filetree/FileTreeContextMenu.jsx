import { useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
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

const FileTreeContextMenu = ({ x, y, onClose, onRenameInit, onDelete }) => {
    const menuRef = useRef(null);
    const [pos, setPos] = useState({ top: y, left: x, visibility: "hidden" });

    const iconSize = 15;
    const itemClass =
        "flex items-center gap-3 rounded-md mx-1 px-2 py-1 hover:bg-black/[0.06] cursor-default font-sans text-[#333333] transition-colors";
    const dividerClass = "h-[1px] bg-gray-200/60 my-1 mx-1";
    const labelClass = "";

    useLayoutEffect(() => {
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const screenHeight = window.innerHeight;
            const screenWidth = window.innerWidth;

            let finalY = y;
            let finalX = x;

            if (y + rect.height > screenHeight) {
                finalY = y - rect.height;
            }
            if (x + rect.width > screenWidth) {
                finalX = x - rect.width;
            }

            finalY = Math.max(5, finalY);
            setPos({ top: finalY, left: finalX, visibility: "visible" });
        }
    }, [x, y]);

    const handleRenameClick = (e) => {
        e.stopPropagation();
        onRenameInit();
        onClose();
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        onDelete();
    };

    return ReactDOM.createPortal(
        <>
            <div
                className="fixed inset-0 z-[9998] bg-transparent"
                onClick={onClose}
                onContextMenu={(e) => {
                    e.preventDefault();
                    onClose();
                }}
            />

            <div
                ref={menuRef}
                className="fixed z-[9999] bg-[#F2F2F2] border border-gray-300 shadow-xl rounded-md py-1 min-w-[210px] text-[12px] pointer-events-auto select-none transition-opacity duration-75"
                style={{ 
                    top: pos.top, 
                    left: pos.left, 
                    visibility: pos.visibility,
                    opacity: pos.visibility === "visible" ? 1 : 0 
                }}
            >
                {/* Section 1: Creation */}
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

                {/* Section 2: Actions */}
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

                {/* Section 3: Paths */}
                <div className={itemClass}>
                    <Copy size={iconSize} className="text-gray-500" />
                    <span className={`${labelClass}`}>Copy path</span>
                </div>
                <div className={itemClass}>
                    <Copy size={iconSize} className="text-gray-500" />
                    <span className={`${labelClass}`}>Copy relative path</span>
                </div>

                <div className={dividerClass} />

                {/* Section 4: System */}
                <div className={itemClass}>
                    <ExternalLink size={iconSize} className="text-gray-500" />
                    <span className={`${labelClass}`}>Show in system explorer</span>
                </div>

                <div className={dividerClass} />

                {/* Section 5: Specials */}
                <div className={itemClass}>
                    <PencilRuler size={iconSize} className="text-gray-500" />
                    <span className={`${labelClass}`}>Create new drawing</span>
                </div>
                <div className={itemClass}>
                    <Hash size={iconSize} className="text-gray-500" />
                    <span className={`${labelClass}`}>Change icon</span>
                </div>

                <div className={dividerClass} />

                {/* Section 6: Modify/Delete */}
                <div className={itemClass} onClick={handleRenameClick}>
                    <Pencil size={iconSize} className="text-gray-500" />
                    <span className={`${labelClass}`}>Rename...</span>
                </div>
                <div className={`${itemClass} text-red-500 hover:bg-red-100`} onClick={handleDeleteClick}>
                    <Trash2 size={iconSize} className="text-red-400" />
                    <span className="text-red-400">Delete</span>
                </div>
            </div>
        </>,
        document.body
    );
};

export default FileTreeContextMenu;