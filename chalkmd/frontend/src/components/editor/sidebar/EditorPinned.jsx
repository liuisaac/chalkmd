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
        <div className={`bg-topbar text-gray-500 w-full min-w-11 h-10 z-50 top-0 sticky overflow-hidden`}>
            <div className="flex flex-row justify-start items-center gap-5 pt-2.5 pl-3 w-full">
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="cursor-pointer flex-shrink-0"
                >
                    {isOpen ? (
                        <PanelLeftCloseIcon size={size} />
                    ) : (
                        <PanelLeftIcon size={size} />
                    )}
                </div>
                {isOpen && (
                    <>
                        <FolderIcon size={size} className="inline-block" />
                        <SearchIcon size={size} className="inline-block" />
                        <BookmarkIcon
                            size={size}
                            className="inline-block cursor-pointer"
                            onClick={() => setIsOpen(!isOpen)}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default EditorPinned;