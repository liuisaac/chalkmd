import {
    BookmarkIcon,
    PanelLeftIcon,
    PanelLeftCloseIcon,
    SearchIcon,
    FolderClosedIcon,
} from "lucide-react";
import { PINNED_STATES } from "../../../constants/pinnedStates";

const EditorPinned = ({ isOpen, setIsOpen, active, setActive }) => {
    const size = 18;
    const strokeWidth = 1.75;

    return (
        <div
            className="bg-midbar text-gray-500 w-full min-w-11 h-10 z-50 top-0 sticky overflow-hidden"
            style={{ "--wails-draggable": "drag" }}
        >
            <div className="flex flex-row justify-start items-center gap-5 pt-2.5 pl-3 w-full -mt-0.5">
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="cursor-pointer flex-shrink-0 hover:text-gray-700 transition-colors"
                >
                    {isOpen ? (
                        <PanelLeftCloseIcon
                            size={18}
                            strokeWidth={strokeWidth}
                        />
                    ) : (
                        <PanelLeftIcon size={18} strokeWidth={strokeWidth} />
                    )}
                </div>

                <div
                    className={`flex flex-row gap-1 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isOpen
                            ? "opacity-100 translate-x-0 visible"
                            : "opacity-0 -translate-x-4 invisible"
                    }`}
                >
                    <div
                        className={`rounded-[3px] py-1 px-2 flex-shrink-0 ${
                            active === PINNED_STATES.FOLDER
                                ? "text-black bg-black/[0.07]"
                                : "text-gray-500"
                        }`}
                        onClick={() => setActive(PINNED_STATES.FOLDER)}
                    >
                        <FolderClosedIcon
                            size={size}
                            strokeWidth={strokeWidth}
                        />
                    </div>
                    <div
                        className={`rounded-[3px] py-1 px-2 flex-shrink-0 ${
                            active === PINNED_STATES.SEARCH
                                ? "text-black bg-black/[0.07]"
                                : "text-gray-500"
                        }`}
                        onClick={() => setActive(PINNED_STATES.SEARCH)}
                    >
                        <SearchIcon size={size} strokeWidth={strokeWidth} />
                    </div>
                    <div
                        className={`rounded-[3px] py-1 px-2 flex-shrink-0 ${
                            active === PINNED_STATES.BOOKMARK
                                ? "text-black bg-black/[0.07]"
                                : "text-gray-500"
                        }`}
                        onClick={() => setActive(PINNED_STATES.BOOKMARK)}
                    >
                        <BookmarkIcon size={size} strokeWidth={strokeWidth} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorPinned;
