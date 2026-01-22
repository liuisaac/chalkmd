import { ChevronsUpDown, CircleQuestionMark, SettingsIcon } from "lucide-react";
import { useVault } from "../../../VaultProvider";
import { useState } from "react";

import EditorFooterContextMenu from "./EditorFooterContextMenu";

const EditorFooter = () => {
    const { vaultPath } = useVault();
    const [menu, setMenu] = useState(null);

    const handleContextMenu = (e, path = null) => {
        e.preventDefault();
        e.stopPropagation();
        setMenu({ x: e.clientX, y: e.clientY, path });
    }

    return (
        <div className="bg-topbar border-t-[1px] border-[#e0e0e0] text-gray-500 w-full h-12 max-h-12 z-30 sticky bottom-0"
        onContextMenu={(e) => handleContextMenu(e, null)}>
            <div className="flex flex-row justify-between items-center gap-5 pl-14 text-sm pt-3">
                <div className="flex flex-row items-center gap-1" onClick={(e) => handleContextMenu(e, null)}>
                    <ChevronsUpDown size={18} className="inline-block" />
                    <span className="text-black text-[12px] select-none">
                        {vaultPath.split("\\").pop() || "Vault"}
                    </span>
                </div>
                <div className="flex flex-row items-center gap-3 pr-4">
                    <div className="flex flex-row items-center gap-2">
                        <CircleQuestionMark
                            size={18}
                            className="inline-block"
                        />
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <SettingsIcon size={18} className="inline-block" />
                    </div>
                </div>
            </div>
            {menu && (
                <EditorFooterContextMenu
                    x={menu.x}
                    y={menu.y}
                    onClose={() => setMenu(false)}
                />
            )}
        </div>
    );
};

export default EditorFooter;
