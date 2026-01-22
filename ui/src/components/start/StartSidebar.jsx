import { useEffect, useState } from "react";
import { useVault } from "../../VaultProvider";

const StartSidebar = () => {
    const { vaultPath } = useVault();
    const [history, setHistory] = useState(
        JSON.parse(localStorage.getItem("vaultHistory")) || []
    );

    useEffect(() => {
        setHistory(JSON.parse(localStorage.getItem("vaultHistory")) || []);
    }, [vaultPath]);

    return (
        <div className="w-[280px] h-screen bg-white border-r border-gray-200 flex flex-col">
            {history.length > 0 ? (
                <ul>
                    {history.map((path, index) => (
                        <div className="p-4 border-b border-gray-200 flex flex-col items-start">
                            <div
                                className="flex items-center justify-between mb-2 w-full"
                                key={index}
                            >
                                <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider select-none">
                                    {path.split("\\").pop()}
                                </h2>
                                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 16 16"
                                    >
                                        <circle cx="8" cy="3" r="1.5" />
                                        <circle cx="8" cy="8" r="1.5" />
                                        <circle cx="8" cy="13" r="1.5" />
                                    </svg>
                                </button>
                            </div>
                            <div className="text-xs text-gray-500 select-none">
                                {path.split("\\").slice(0, -1).join("\\")}
                            </div>
                        </div>
                    ))}
                </ul>
            ) : (
                <div className="p-4 border-b border-gray-200 select-none">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider select-none">
                            Vault
                        </h2>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                            >
                                <circle cx="8" cy="3" r="1.5" />
                                <circle cx="8" cy="8" r="1.5" />
                                <circle cx="8" cy="13" r="1.5" />
                            </svg>
                        </button>
                    </div>
                    <div className="text-xs text-gray-500 select-none">
                        No vault selected
                    </div>
                </div>
            )}
            <div className="flex-1" />
        </div>
    );
};

export default StartSidebar;
