import { Check } from "lucide-react";
import ContextMenu from "../../ui/ContextMenu";

const FileTreeSortContextMenu = ({ x, y, onClose, active, setActive }) => {
    const itemClass =
        "flex flex-row items-center gap-3 rounded-md mx-1 px-2 py-1 hover:bg-black/[0.06] cursor-default font-sans text-[#333333] transition-colors";
    const dividerClass = "border-t border-gray-300 my-1";
    const labelClass = "";
    const checkSize = 14;
    const checkClass = "ml-auto text-gray-500";

    const menu = (
        <>
            <div className={itemClass} onClick={() => {setActive("name-asc"); onClose()}}>
                <span className={`${labelClass}`}>File name (A to Z)</span>
                {
                    active === "name-asc" && (
                        <Check size={checkSize} className={checkClass} />
                    )
                }
            </div>
            <div className={itemClass} onClick={() => {setActive("name-desc"); onClose()}}>
                <span className={`${labelClass}`}>File name (Z to A)</span>
                {
                    active === "name-desc" && (
                        <Check size={checkSize} className={checkClass} />
                    )
                }
            </div>

            <div className={dividerClass} />

            <div className={itemClass} onClick={() => {setActive("modified-asc"); onClose()}}>
                <span className={`${labelClass}`}>Modified time (new to old)</span>
                {
                    active === "modified-asc" && (
                        <Check size={checkSize} className={checkClass} />
                    )
                }
            </div>
            <div className={itemClass} onClick={() => {setActive("modified-desc"); onClose()}}>
                <span className={`${labelClass}`}>Modified time (old to new)</span>
                {
                    active === "modified-desc" && (
                        <Check size={checkSize} className={checkClass} />
                    )
                }
            </div>

            <div className={dividerClass} />

            <div className={itemClass} onClick={() => {setActive("created-asc"); onClose()}}>
                <span className={`${labelClass}`}>Created time (new to old)</span>
                {
                    active === "created-asc" && (
                        <Check size={checkSize} className={checkClass} />
                    )
                }
            </div>
            <div className={itemClass} onClick={() => {setActive("created-desc"); onClose()}}>
                <span className={`${labelClass}`}>Created time (old to new)</span>
                {
                    active === "created-desc" && (
                        <Check size={checkSize} className={checkClass} />
                    )
                }
            </div>
        </>
    );

    return <ContextMenu x={x} y={y} onClose={onClose}>{menu}</ContextMenu>;
};

export default FileTreeSortContextMenu;
