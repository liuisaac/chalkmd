import React, { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

const FileTreeItem = ({ item, level = 0, onFileClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleClick = () => {
        if (item.isDir) {
            setIsExpanded(!isExpanded);
        } else {
            onFileClick(item);
        }
    };

    const displayName = item.isDir 
        ? item.name 
        : item.name.replace(/\.[^/.]+$/, "");

    return (
        <div>
            <div
                className="flex items-center px-2 py-1 cursor-pointer text-[13px] group relative"
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={handleClick}
            >
                {level > 0 && (
                    <div
                        className="absolute left-0 top-0 bottom-0 w-px bg-gray-200"
                        style={{ left: `${(level - 1) * 16 + 16}px` }}
                    />
                )}

                <div className="w-4 h-4 flex items-center justify-center mr-1 flex-shrink-0 text-gray-500">
                    {item.isDir ? (
                        isExpanded ? (
                            <ChevronDown size={14} />
                        ) : (
                            <ChevronRight size={14} />
                        )
                    ) : null}
                </div>

                <span className="text-gray-500 truncate">{displayName}</span>
            </div>

            {item.isDir && isExpanded && item.children && (
                <div>
                    {item.children.map((child, index) => (
                        <FileTreeItem
                            key={child.path || index}
                            item={child}
                            level={level + 1}
                            onFileClick={onFileClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileTreeItem;