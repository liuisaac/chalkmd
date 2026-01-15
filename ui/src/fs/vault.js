import {
    OpenVault,
    ListVaultContents,
    SelectVaultFolder,
} from "../../wailsjs/go/internal/App";

const loadVaultContents = async (setFiles) => {
    try {
        const fileList = await ListVaultContents();
        setFiles(fileList);
    } catch (error) {
        console.error("Error loading vault:", error);
        throw error;
    }
};

//  TODO: implement createVault flow
const createVault = async (parentPath, vaultName) => {
    try {
        // const vaultPath = await CreateVault(parentPath, vaultName);
        return "";
    } catch (error) {
        throw new Error("Error creating vault: " + error);
    }
};

const openVault = async (path, setVaultPath, setFiles) => {
    try {
        await OpenVault(path);
        setVaultPath(path);
        await loadVaultContents(setFiles);
    } catch (error) {
        throw new Error("Error opening vault: " + error);
    }
};

const selectVaultFolder = async () => {
    try {
        const folderPath = await SelectVaultFolder();
        return folderPath;
    } catch (error) {
        throw new Error("Error selecting vault folder: " + error);
    }
};

export { loadVaultContents, createVault, openVault, selectVaultFolder };
