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
        <div className="bg-topbar text-gray-500 w-full min-w-11 h-10 z-50 top-0 sticky overflow-hidden">
            <div className="flex flex-row justify-start items-center gap-5 pt-2.5 pl-3 w-full">
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="cursor-pointer flex-shrink-0 hover:text-gray-700 transition-colors"
                >
                    {isOpen ? (
                        <PanelLeftCloseIcon size={size} />
                    ) : (
                        <PanelLeftIcon size={size} />
                    )}
                </div>

                <div 
                    className={`flex flex-row gap-5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isOpen 
                            ? "opacity-100 translate-x-0 visible" 
                            : "opacity-0 -translate-x-4 invisible"
                    }`}
                >
                    <FolderIcon size={size} className="flex-shrink-0" />
                    <SearchIcon size={size} className="flex-shrink-0" />
                    <BookmarkIcon
                        size={size}
                        className="flex-shrink-0 cursor-pointer hover:text-gray-700"
                        onClick={() => setIsOpen(!isOpen)}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditorPinned;