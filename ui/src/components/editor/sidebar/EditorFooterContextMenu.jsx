import {
    Vault,
} from "lucide-react";
import ContextMenu from "../../ui/ContextMenu";
import { useVault } from "../../../VaultProvider";
import { useEffect, useState } from "react";

const EditorFooterContextMenu = ({ x, y, onClose }) => {
    const iconSize = 15;
    const itemClass =
        "flex items-center gap-3 rounded-md mx-1 px-2 py-1 hover:bg-black/[0.06] cursor-default font-sans text-[#333333] transition-colors";
    const dividerClass = "border-t border-gray-300 my-1";
    const labelClass = "";
    const { vaultPath, setVaultPath, spawnInstance: WindowFork } = useVault();

    const [history, setHistory] = useState(
        JSON.parse(localStorage.getItem("vaultHistory")) || []
    );

    useEffect(() => {
        setHistory(JSON.parse(localStorage.getItem("vaultHistory")) || []);
    }, [vaultPath]);

    const handleNewWindow = () => {
        localStorage.removeItem("vaultPath");
        WindowFork();
        onClose();
    };

    const handleOpenVault = (path) => {
        localStorage.setItem("vaultPath", path);
        WindowFork();
        onClose();
    }

    const menu = (
        <>
            {history.map((path, index) => (
                <div
                    className={itemClass}
                    key={index}
                    onClick={() => {
                        handleOpenVault(path);
                    }}
                >
                    <span className={`${labelClass}`}>{path.split("\\").pop()}</span>
                </div>
            ))}

            <div className={dividerClass} />

            <div className={itemClass} onClick={() => {
                handleNewWindow();
            }}>
                <Vault size={iconSize} className="text-gray-500" />
                <span className={`${labelClass}`}>Manage vaults...</span>
            </div>
        </>
    );

    return <ContextMenu x={x} y={y} onClose={onClose}>{menu}</ContextMenu>;
};

export default EditorFooterContextMenu;
