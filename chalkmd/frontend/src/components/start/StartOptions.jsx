import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useVault } from "../../VaultProvider";

const OptionCard = ({
    title,
    description,
    buttonText,
    onClick,
    primary = false,
}) => {
    return (
        <div className="flex items-center justify-between py-4 px-5 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors group">
            <div className="flex flex-col items-start pr-4">
                <h3 className="text-[15px] text-gray-900">{title}</h3>
                <p className="text-[12px] text-gray-500 leading-relaxed">
                    {description}
                </p>
            </div>
            <button
                onClick={onClick}
                className={`px-6 py-2 rounded-md text-[13px] font-medium transition-colors whitespace-nowrap ${
                    primary
                        ? "bg-offpurple hover:bg-offpurple text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
            >
                {buttonText}
            </button>
        </div>
    );
};

const StartCreateVault = ({ onBack, onCreate }) => {
    const [vaultName, setVaultName] = useState("");
    const [vaultLocation, setVaultLocation] = useState("");

    const handleSelectLocation = async () => {
        try {
            const { SelectVaultFolder } = await import(
                "../../../wailsjs/go/main/App"
            );
            const path = await SelectVaultFolder();
            if (path) {
                setVaultLocation(path);
            }
        } catch (error) {
            alert("Error selecting folder: " + error);
        }
    };

    const handleCreate = () => {
        if (!vaultName.trim()) {
            alert("Please enter a vault name");
            return;
        }
        if (!vaultLocation) {
            alert("Please select a vault location");
            return;
        }
        onCreate(vaultLocation, vaultName);
    };

    return (
        <div className="w-full px-8 h-72">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft size={18} />
                <span className="text-md -ml-2">Back</span>
            </button>

            <div className="space-y-6 text-gray-900 flex flex-col items-start justify-start">
                <span className="font-semibold -mt-4">Create local vault</span>
                <div className="flex flex-row justify-between w-full">
                    <div className="flex flex-col items-start">
                        <span className="block text-[14px] font-medium">
                            Vault name
                        </span>
                        <span className="block text-[10px] text-gray-500 mb-2">
                            Pick a name for your awesome vault.
                        </span>
                    </div>
                    <input
                        type="text"
                        value={vaultName}
                        onChange={(e) => setVaultName(e.target.value)}
                        placeholder="My Vault"
                        className="w-40 px-2 rounded-lg border border-gray-200 focus:border-gray-400 focus:outline-none transition-colors text-[14px]"
                    />
                </div>

                <div className="flex flex-row justify-between w-full">
                    <div className="flex flex-col items-start">
                        <span className="block text-[14px] font-medium">
                            Location
                        </span>
                        <span className="block text-[10px] text-gray-500 mb-2">
                            {vaultLocation ? "Selected: " + vaultLocation : "Pick a place to put your new vault."}
                        </span>
                    </div>
                    <button
                        onClick={handleSelectLocation}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-[13px] font-medium text-gray-900 transition-colors whitespace-nowrap"
                    >
                        Browse
                    </button>
                </div>

                <div className="w-full flex-1">
                    <button
                        onClick={handleCreate}
                        className="w-36 px-4 py-2 bg-offpurple hover:bg-purple-700 rounded-lg text-[14px] font-medium text-white transition-colors"
                    >
                        Create Vault
                    </button>
                </div>
            </div>
        </div>
    );
};

const StartOptions = () => {
    const { openVault } = useVault();
    const [showCreateVault, setShowCreateVault] = useState(false);

    const handleOpenVault = async () => {
        try {
            const { SelectVaultFolder } = await import(
                "../../../wailsjs/go/main/App"
            );
            const path = await SelectVaultFolder();
            if (!path) return;

            await openVault(path);
        } catch (error) {
            alert("Error opening vault: " + error);
        }
    };

    const handleCreateVault = async (parentPath, vaultName) => {
        try {
            const { CreateVault, OpenVault } = await import(
                "../../../wailsjs/go/main/App"
            );

            const vaultPath = await CreateVault(parentPath, vaultName);
            await OpenVault(vaultPath);
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
