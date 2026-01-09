import { useEffect, useState, useRef, memo, useMemo, useCallback } from "react";
import { ChevronRight } from "lucide-react";
import { useVault } from "../../../VaultProvider";

const FileTreeItem = memo(({ 
    item, 
    level = 0, 
    onFileClick, 
    activeContextPath, 
    onContextMenu, 
    editingPath,       
    onRenameComplete 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [tempName, setTempName] = useState(item.name);
    const { currentFile, renameFile } = useVault();
    const inputRef = useRef(null);

    const isEditing = editingPath === item.path;
    const isContextActive = activeContextPath === item.path;
    const isSelected = !item.isDir && item.path === currentFile;

    const displayName = useMemo(() => {
        if (item.isDir) return item.name;
        const lastDot = item.name.lastIndexOf(".");
        return lastDot === -1 ? item.name : item.name.slice(0, lastDot);
    }, [item.isDir, item.name]);

    useEffect(() => {
        if (isEditing) {
            setTempName(item.name);
            const input = inputRef.current;
            if (input) {
                input.focus();
                const dotIndex = item.name.lastIndexOf(".");
                const selectEnd = (item.isDir || dotIndex === -1) ? item.name.length : dotIndex;
                input.setSelectionRange(0, selectEnd);
            }
        }
    }, [isEditing, item.name, item.isDir]);

    const handleSubmitRename = useCallback(async () => {
        if (!isEditing) return;
        const trimmed = tempName.trim();
        if (trimmed && trimmed !== item.name) {
            try {
                const parentPath = item.path.split('/').slice(0, -1).join('/');
                const newPath = parentPath ? `${parentPath}/${trimmed}` : trimmed;
                await renameFile(item.path, newPath);
            } catch (err) {
                setTempName(item.name);
            }
        }
        onRenameComplete();
    }, [isEditing, tempName, item.path, item.name, renameFile, onRenameComplete]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.stopPropagation();
            handleSubmitRename();
        }
        if (e.key === "Escape") {
            e.stopPropagation();
            setTempName(item.name);
            onRenameComplete();
        }
    };

    const toggleFolder = (e) => {
        e.stopPropagation();
        if (isEditing) return;
        if (item.isDir) {
            setIsExpanded(!isExpanded);
        } else {
            onFileClick(item);
        }
    };

    return (
        <div className="flex flex-col w-full">
            <div
                className={`flex items-center px-2 py-[2px] cursor-pointer text-[13px] rounded mx-1 select-none will-change-colors ${
                    isContextActive || isEditing ? "bg-[#7c3aed15] text-[#7c3aed]" : 
                    isSelected ? "bg-black/[0.06] text-black" : "hover:bg-black/[0.03] text-gray-500"
                }`}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={toggleFolder}
                onContextMenu={(e) => onContextMenu(e, item.path)} 
            >
                <div className={`w-4 h-4 flex items-center justify-center mr-1 transform transition-transform duration-75 ${
                    isExpanded ? "rotate-90" : ""
                }`}>
                    {item.isDir && <ChevronRight size={14} className="opacity-70" />}
                </div>

                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onBlur={handleSubmitRename}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-transparent text-[#7c3aed] outline-none border-none w-full leading-6 text-[13px] px-0 selection:bg-[#9333ea] selection:text-white"
                        />
                    ) : (
                        <span className="truncate block leading-6">
                            {displayName}
                        </span>
                    )}
                </div>
            </div>

            {item.isDir && isExpanded && item.children && (
                <div className="relative">
                    <div 
                        className="absolute left-0 top-0 bottom-0 w-[1px] bg-gray-200 pointer-events-none"
                        style={{ left: `${level * 16 + 15}px` }} 
                    />
                    <div className="flex flex-col">
                        {item.children.map((child) => (
                            <FileTreeItem
                                key={child.path}
                                item={child}
                                level={level + 1}
                                onFileClick={onFileClick}
                                activeContextPath={activeContextPath} 
                                onContextMenu={onContextMenu}
                                editingPath={editingPath}
                                onRenameComplete={onRenameComplete}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

export default FileTreeItem;