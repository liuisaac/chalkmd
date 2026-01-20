import {
    CreateFile,
    CreateFolder,
    RenameFile,
    DeleteFile,
    ReadFile,
    MoveFile,
} from "../../wailsjs/go/internal/App";

const createFile = async (fileName, files, vaultPath, setCurrentFile, loadVaultContents) => {
    try {
        let nameToCreate = fileName;

        if (!nameToCreate) {
            const existingNames = files
                .filter(
                    (f) =>
                        !f.isDir &&
                        !f.path.includes("/") &&
                        !f.path.includes("\\")
                )
                .map((f) => f.path.toLowerCase());

            if (!existingNames.includes("untitled.md")) {
                nameToCreate = "Untitled.md";
            } else {
                let counter = 1;
                while (existingNames.includes(`untitled ${counter}.md`)) {
                    counter++;
                }
                nameToCreate = `Untitled ${counter}.md`;
            }
        }

        const fullPath = await CreateFile(nameToCreate);
        await loadVaultContents();

        const relativePath = fullPath.substring(vaultPath.length + 1);
        setCurrentFile(relativePath);
        return relativePath;
    } catch (error) {
        console.error("Error creating file:", error);
        throw error;
    }
};

const createFolder = async (folderName, files, loadVaultContents) => {
    try {
        let nameToCreate = folderName;

        if (!nameToCreate) {
            const existingNames = files.map((f) => f.name.toLowerCase());
            console.log("Existing folder names:", existingNames);
            if (!existingNames.includes("untitled")) {
                nameToCreate = "Untitled";
            } else {
                let counter = 1;
                while (existingNames.includes(`untitled ${counter}`)) {
                    counter++;
                }
                nameToCreate = `Untitled ${counter}`;
            }
        }
        console.log("Creating folder with name:", nameToCreate);

        await CreateFolder(nameToCreate);
        await loadVaultContents();
    } catch (error) {
        console.error("Error creating folder:", error);
        throw error;
    }
};

const renameFile = async (oldPath, newPath, loadVaultContents) => {
    try {
        await RenameFile(oldPath, newPath);
        console.log("Renamed file from", oldPath, "to", newPath);
        await loadVaultContents();
    } catch (error) {
        console.error("Error renaming file:", error);
        throw error;
    }
};

const moveFile = async (oldPath, newPath, loadVaultContents) => {
    try {
        await MoveFile(oldPath, newPath);
        await loadVaultContents();
    } catch (error) {
        console.error("Error moving file:", error);
        throw error;
    }
};

const deleteFile = async (path, loadVaultContents) => {
    try {
        await DeleteFile(path);
        await loadVaultContents();
    } catch (error) {
        console.error("Error deleting file:", error);
        throw error;
    }
};

const readFile = async (path) => {
    try {
        const result = await ReadFile(path);
        return result;
    } catch (err) {
        console.error("Failed to read file:", err);
        throw err;
    }
};

export { createFile, createFolder, renameFile, moveFile, deleteFile, readFile };