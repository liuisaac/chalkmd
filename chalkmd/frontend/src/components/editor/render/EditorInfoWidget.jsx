import { GalleryVerticalEnd, PenLine } from "lucide-react";
import { useVault } from "../../../VaultProvider";

const EditorInfoWidget = () => {
    const { content } = useVault();

    const wordCount = (text) => {
        if (!text || text.trim() === "") return 0;
        return text.trim().split(/\s+/).length;
    };

    const characterCount = (text) => {
        if (!text) return 0;
        return text.length;
    };

    return (
        <div className="fixed right-0 bottom-0 pr-2 pl-4 pb-1 h-7 bg-topbar rounded-tl-md text-gray-500 border border-[#d3d3d3] text-[12px] flex flex-row items-end justify-center gap-2">
            <span className="select-none">0 backlinks</span>

            <PenLine size={13} className="inline-block ml-2 mb-1" />

            <span className="select-none tabular-nums min-w-[55px] text-right">
                {wordCount(content)} words
            </span>

            <span className="select-none tabular-nums min-w-[85px] text-right">
                {characterCount(content)} characters
            </span>

            <GalleryVerticalEnd
                size={14}
                className="inline-block mx-2 mb-0.5"
            />
        </div>
    );
};

export default EditorInfoWidget;
