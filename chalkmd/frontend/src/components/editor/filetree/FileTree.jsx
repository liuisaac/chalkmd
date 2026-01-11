import { useState, useRef } from "react";
import FileTreeContextMenu from "./FileTreeContextMenu";
import FileTreeItem from "./FileTreeItem";
import { buildFileTree } from "./buildFileTree";
import { useVault } from "../../../VaultProvider";

const FileTree = ({ files, onFileClick }) => {
    const [menu, setMenu] = useState(null);
    const [editingPath, setEditingPath] = useState(null);
    const treeRef = useRef(null);
    const { deleteFile } = useVault();

    const handleContextMenu = (e, path = null) => {
        if (treeRef.current && treeRef.current.contains(e.target)) {
            e.preventDefault();
            e.stopPropagation();
            setMenu({ x: e.clientX, y: e.clientY, path });
        }
    };

    const handleRenameInit = () => {
        if (menu?.path) {
            setEditingPath(menu.path);
            setMenu(null);
        }
    };

    const handleDelete = async () => {
        if (menu?.path) {
            try {
                await deleteFile(menu.path);
                setMenu(null);
            } catch (err) {
                console.error('Failed to delete file:', err);
            }
        }
    };

    const fileTree = buildFileTree(files);

    if (fileTree.length === 0) {
        return (
            <div className="text-[14px] text-gray-600 px-2 py-4">
                No files found
            </div>
        );
    }

    return (
        <div
            ref={treeRef}
            className="w-full h-full min-h-screen pl-12 select-none flex flex-col truncate"
            onContextMenu={(e) => handleContextMenu(e, null)}
        >
            <div className="overflow-y-auto flex-1">
                {fileTree.map((item, index) => (
                    <FileTreeItem
                        key={item.path || index}
                        item={item}
                        onFileClick={onFileClick}
                        activeContextPath={menu?.path}
                        editingPath={editingPath}
                        onRenameComplete={() => setEditingPath(null)}
                        onContextMenu={handleContextMenu}
                    />
                ))}
            </div>

            {menu && (
                <FileTreeContextMenu
                    x={menu.x}
                    y={menu.y}
                    onClose={() => setMenu(null)}
                    onRenameInit={handleRenameInit}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default FileTree;