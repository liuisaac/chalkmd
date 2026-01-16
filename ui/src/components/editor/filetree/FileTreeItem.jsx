import { useEffect, useState, useRef, memo, useMemo, useCallback } from "react";
import ReactDOM from "react-dom";
import { ChevronRight, FileIcon } from "lucide-react";
import { useVault } from "../../../VaultProvider";

const DragPreview = ({ x, y, path, target }) => {
    const fileName = path.split("/").pop().split(".").slice(0, -1).join(".");
    const targetName = target === "" ? "Vault" : `"${target.split("/").pop()}"`;

    return ReactDOM.createPortal(
        <div
            className="fixed z-[10000] bg-black/85 shadow-xl rounded-md py-2 px-3 max-w-[250px] text-[13px] pointer-events-none select-none"
            style={{
                left: x + 10,
                top: y + 10,
            }}
        >
            <div className="flex flex-row items-center gap-1">
                <FileIcon size={16} className="text-[#BDBDBD]" />
                <div className="font-semibold text-white tracking-wide">
                    {fileName}
                </div>
            </div>
            <div className="font-semibold text-[#BDBDBD] truncate mt-1">
                Move into {targetName}
            </div>
        </div>,
        document.body
    );
};

const FileTreeItem = memo(
    ({
        item,
        level = 0,
        onFileClick,
        activeContextPath,
        onContextMenu,
        editingPath,
        onRenameComplete,
        onMove,
        dragState,
        onDragStateChange,
        parentPath = "",
        isInDropTargetFolder = false,
    }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const [tempName, setTempName] = useState(item.name);
        const [dragPreviewPos, setDragPreviewPos] = useState(null);
        const { currentFile, renameFile } = useVault();
        const inputRef = useRef(null);
        const dragImageRef = useRef(null);

        const isEditing = editingPath === item.path;
        const isContextActive = activeContextPath === item.path;
        const isSelected = !item.isDir && item.path === currentFile;
        const isDragging = dragState?.path === item.path;

        const dropTargetPath = item.isDir ? item.path : parentPath;
        const isOverRoot = dragState?.overPath === "";
        const isThisDropTarget =
            dragState?.overPath === dropTargetPath &&
            dragState?.path !== item.path &&
            !isOverRoot;
        const isDropTarget = isThisDropTarget && item.isDir;

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
                    const selectEnd =
                        item.isDir || dotIndex === -1
                            ? item.name.length
                            : dotIndex;
                    input.setSelectionRange(0, selectEnd);
                }
            }
        }, [isEditing, item.name, item.isDir]);

        const handleSubmitRename = useCallback(async () => {
            if (!isEditing) return;
            const trimmed = tempName.trim();
            if (trimmed && trimmed !== item.name) {
                try {
                    const parentPath = item.path
                        .split("/")
                        .slice(0, -1)
                        .join("/");
                    const newPath = parentPath
                        ? `${parentPath}/${trimmed}`
                        : trimmed;
                    await renameFile(item.path, newPath);
                } catch (err) {
                    setTempName(item.name);
                }
            }
            onRenameComplete();
        }, [
            isEditing,
            tempName,
            item.path,
            item.name,
            renameFile,
            onRenameComplete,
        ]);

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

        const handleDragStart = (e) => {
            e.stopPropagation();

            if (!dragImageRef.current) {
                dragImageRef.current = document.createElement("div");
                dragImageRef.current.style.opacity = "0";
                dragImageRef.current.style.position = "absolute";
                dragImageRef.current.style.top = "-9999px";
                document.body.appendChild(dragImageRef.current);
            }

            e.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", item.path);

            onDragStateChange({ path: item.path, overPath: null });
            setDragPreviewPos({ x: e.clientX, y: e.clientY });
        };

        const handleDrag = (e) => {
            if (e.clientX === 0 && e.clientY === 0) return;
            setDragPreviewPos({ x: e.clientX, y: e.clientY });
        };

        const handleDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
            onDragStateChange((prev) => ({
                ...prev,
                overPath: dropTargetPath,
            }));
            e.dataTransfer.dropEffect = "move";
        };

        const handleDragLeave = (e) => {
            e.stopPropagation();
            if (e.currentTarget.contains(e.relatedTarget)) return;
            onDragStateChange((prev) => ({ ...prev, overPath: null }));
        };

        const handleDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const draggedPath = e.dataTransfer.getData("text/plain");
            if (draggedPath && draggedPath !== item.path) {
                onMove(draggedPath, dropTargetPath);
            }
            onDragStateChange({ path: null, overPath: null });
            setDragPreviewPos(null);
        };

        const handleDragEnd = () => {
            onDragStateChange({ path: null, overPath: null });
            setDragPreviewPos(null);
            if (dragImageRef.current) {
                document.body.removeChild(dragImageRef.current);
                dragImageRef.current = null;
            }
        };

        const shouldHighlightBackground =
            (isDropTarget || isInDropTargetFolder || isThisDropTarget) &&
            !isOverRoot;
        const shouldHighlightText = isDropTarget && item.isDir;

        const currentTarget =
            dragState?.overPath !== null ? dragState?.overPath : dropTargetPath;

        return (
            <div className="flex flex-col w-full">
                <div
                    draggable
                    onDragStart={handleDragStart}
                    onDrag={handleDrag}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center px-2 py-[2px] cursor-pointer text-[13px] rounded mx-1 select-none will-change-colors ${
                        isDragging
                            ? "bg-[#9873F7] text-white z-30"
                            : shouldHighlightBackground
                            ? shouldHighlightText
                                ? "bg-[#7c3aed15] text-[#7c3aed]"
                                : "bg-[#7c3aed15] text-gray-500"
                            : isContextActive || isEditing
                            ? "bg-[#7c3aed15] text-[#7c3aed]"
                            : isSelected
                            ? "bg-black/[0.06] text-black"
                            : "hover:bg-black/[0.03] text-gray-500"
                    }`}
                    style={{ paddingLeft: `${level * 16 + 8}px` }}
                    onClick={toggleFolder}
                    onContextMenu={(e) => onContextMenu(e, item.path)}
                >
                    <div
                        className={`w-4 h-4 flex items-center justify-center mr-1 transform transition-transform duration-75 ${
                            isExpanded ? "rotate-90" : ""
                        }`}
                    >
                        {item.isDir && (
                            <ChevronRight size={14} className="opacity-70" />
                        )}
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
                                    onMove={onMove}
                                    dragState={dragState}
                                    onDragStateChange={onDragStateChange}
                                    parentPath={item.path}
                                    isInDropTargetFolder={
                                        isDropTarget ||
                                        (isInDropTargetFolder && !isOverRoot)
                                    }
                                />
                            ))}
                        </div>
                    </div>
                )}

                {isDragging && dragPreviewPos && (
                    <DragPreview
                        x={dragPreviewPos.x}
                        y={dragPreviewPos.y}
                        path={item.path}
                        target={currentTarget}
                    />
                )}
            </div>
        );
    }
);

export default FileTreeItem;
