import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    EllipsisVertical,
} from "lucide-react";
import { useVault } from "../../../VaultProvider";
import { useTabContext } from "../../../TabProvider";

const EditorNoteBar = () => {
    const { currentFile } = useVault();
    const { navigateHistory, canGoBack, canGoForward } = useTabContext();

    const forward = () => {
        navigateHistory("forward");
    };

    const backward = () => {
        navigateHistory("backward");
    };

    return (
        <div className="bg-offwhite w-full h-12 flex flex-row items-center justify-between text-gray-600 sticky top-0 select-none z-30 font-sans">
            <div className="text-gray-400 flex flex-row items-center justify-center pl-5">
                <ArrowLeft
                    size={18}
                    className={`inline-block mr-2 cursor-pointer transition-colors ${
                        canGoBack
                            ? "text-gray-800"
                            : "text-gray-300 pointer-events-none"
                    }`}
                    onClick={backward}
                />
                <ArrowRight
                    size={18}
                    className={`inline-block cursor-pointer transition-colors ${
                        canGoForward
                            ? "text-gray-800"
                            : "text-gray-300 pointer-events-none"
                    }`}
                    onClick={forward}
                />
            </div>
            <div className="text-[14px] truncate px-4">
                {currentFile
                    .replace(/\.[^/.]+$/, "")
                    .split("/")
                    .map((part, index, arr) => (
                        <span key={index}>
                            {part}
                            {index < arr.length - 1 && " / "}
                        </span>
                    ))}
            </div>
            <div className="text-gray-400 flex flex-row items-center justify-center">
                <BookOpen
                    size={18}
                    className="inline-block mr-2 cursor-pointer"
                />
                <EllipsisVertical
                    size={18}
                    className="inline-block mr-5 cursor-pointer"
                />
            </div>
        </div>
    );
};

export default EditorNoteBar;
