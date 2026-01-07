import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    EllipsisVertical,
} from "lucide-react";
import { useVault } from "../../../App";

const EditorNoteBar = () => {
    const { currentFile } = useVault();
    return (
        <div className="bg-offwhite w-full h-12 flex flex-row items-center justify-between text-gray-600 sticky top-0 select-none">
            <div className="text-gray-400 flex flex-row items-center justify-center pl-5">
                <ArrowLeft
                    size={18}
                    className="inline-block mr-2 cursor-pointer"
                />
                <ArrowRight size={18} className="inline-block cursor-pointer" />
            </div>
            <div className="text-[14px]">
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
