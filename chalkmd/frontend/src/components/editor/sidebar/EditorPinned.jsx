import React from "react";
import {
    BookmarkIcon,
    PanelLeftIcon,
    PanelLeftCloseIcon,
    FolderIcon,
    SearchIcon,
} from "lucide-react";

const EditorPinned = ({ isOpen, setIsOpen }) => {
    const size = 18;
    return (
        <div className="bg-offwhite border-b-[1px] border-[#e0e0e0] text-gray-500 w-full h-10 z-50 top-0 sticky">
            <div className="flex flex-row justify-start items-center gap-5 pt-2.5 pl-3">
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="cursor-pointer"
                >
                    {isOpen ? (
                        <PanelLeftCloseIcon size={size} />
                    ) : (
                        <PanelLeftIcon size={size} />
                    )}
                </div>
                <FolderIcon size={size} className="inline-block" />
                <SearchIcon size={size} className="inline-block" />
                <BookmarkIcon
                    size={size}
                    className="inline-block"
                    onClick={() => setIsOpen(!isOpen)}
                />
            </div>
        </div>
    );
};

export default EditorPinned;
