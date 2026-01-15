import { useState } from "react";
import { useVault } from "../../../VaultProvider";
import StartCreateVault from "./StartCreateVault";
import OptionCard from "./OptionCard";

const StartOptions = () => {
    const { openVault, createVault, selectVaultFolder, setVaultPath } = useVault();
    const [showCreateVault, setShowCreateVault] = useState(false);

    const handleOpenVault = async () => {
        try {
            const path = await selectVaultFolder();
            if (!path) return;

            await openVault(path);
        } catch (error) {
            alert("Error opening vault: " + error);
        }
    };

    const handleCreateVault = async (parentPath, vaultName) => {
        try {
            const vaultPath = await createVault(parentPath, vaultName);
            await openVault(vaultPath, setVaultPath);
            setVaultPath(vaultPath);
            await loadVaultContents();
        } catch (error) {
            alert("Error creating vault: " + error);
        }
    };

    return (
        <div className="relative w-full h-64 overflow-hidden">
            <div
                className={`transition-transform duration-300 ease-in-out ${
                    showCreateVault ? "-translate-x-full" : "translate-x-0"
                }`}
            >
                <div className="px-8">
                    <div className="space-y-4">
                        <OptionCard
                            title="Create new vault"
                            description="Create a new vault under a folder."
                            buttonText="Create"
                            onClick={() => setShowCreateVault(true)}
                            primary
                        />

                        <OptionCard
                            title="Open folder as vault"
                            description="Choose an existing folder of Markdown files."
                            buttonText="Open"
                            onClick={handleOpenVault}
                        />
                    </div>
                </div>
            </div>

            <div
                className={`absolute top-0 left-0 w-full transition-transform duration-300 ease-in-out ${
                    showCreateVault ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <StartCreateVault
                    onBack={() => setShowCreateVault(false)}
                    onCreate={handleCreateVault}
                />
            </div>
        </div>
    );
};

export default StartOptions;
