import {
    OpenVault,
    ListVaultContents,
    CreateFile,
    CreateFolder,
    RenameFile,
    DeleteFile,
    WriteFile,
    ReadFile,
    ReadBinaryFile,
    MoveFile,
} from "../wailsjs/go/internal/App";
import { useState, useEffect, createContext, useContext } from "react";

// settings, eventually extensions
import settings from "../../settings.json";

export const VaultProvider = ({ children }) => {
    const isDevelopment = settings.developmentMode || false;
    const isTestingStartup =
        settings.developmentSettings?.bypassLocalStorage || false;

    const [vaultPath, setVaultPath] = useState(() => {
        if (isDevelopment && isTestingStartup) {
            return null;
        }
        return localStorage.getItem("vaultPath") || null;
    });

    const [files, setFiles] = useState([]);
    const [currentFile, setCurrentFile] = useState(null);
    const [content, setContent] = useState("");
    const [expandedFolders, setExpandedFolders] = useState(new Set());

    useEffect(() => {
        if (vaultPath) {
            localStorage.setItem("vaultPath", vaultPath);
        } else {
            localStorage.removeItem("vaultPath");
        }
    }, [vaultPath]);

    useEffect(() => {
        const savedPath = localStorage.getItem("vaultPath");
        if (savedPath) {
            OpenVault(savedPath)
                .then(() => loadVaultContents())
                .catch((error) => {
                    console.error("Error loading saved vault:", error);
                    setVaultPath(null);
                });
        }
    }, []);

    useEffect(() => {
        if (!currentFile || !vaultPath || content === "") return;

        const timeout = setTimeout(() => {
            WriteFile(currentFile, content).catch((err) =>
                console.error("Auto-save failed:", err)
            );
        }, 1000);

        return () => clearTimeout(timeout);
    }, [content, currentFile, vaultPath]);

    const loadVaultContents = async () => {
        try {
            const fileList = await ListVaultContents();
            setFiles(fileList);
        } catch (error) {
            console.error("Error loading vault:", error);
            throw error;
        }
    };

    const openVault = async (path) => {
        try {
            await OpenVault(path);
            setVaultPath(path);
            await loadVaultContents();
        } catch (error) {
            throw new Error("Error opening vault: " + error);
        }
    };

    const createFile = async (fileName) => {
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
            return relativePath;
        } catch (error) {
            console.error("Error creating file:", error);
            throw error;
        }
    };

    const createFolder = async (folderName) => {
        try {
            let nameToCreate = folderName;

            if (!nameToCreate) {
                const existingNames = files.map((f) => f.name.toLowerCase());
                if (!existingNames.includes("Untitled")) {
                    nameToCreate = "Untitled";
                } else {
                    let counter = 1;
                    while (existingNames.includes(`Untitled ${counter}`)) {
                        counter++;
                    }
                    nameToCreate = `Untitled ${counter}`;
                }
            }

            await CreateFolder(nameToCreate);
            await loadVaultContents();
        } catch (error) {
            console.error("Error creating folder:", error);
            throw error;
        }
    };

    const renameFile = async (oldPath, newPath) => {
        try {
            await RenameFile(oldPath, newPath);
            await loadVaultContents();
        } catch (error) {
            console.error("Error renaming file:", error);
            throw error;
        }
    };

    const moveFile = async (oldPath, newPath) => {
        try {
            await MoveFile(oldPath, newPath);
            await loadVaultContents();
        } catch (error) {
            console.error("Error moving file:", error);
            throw error;
        }
    };

    const deleteFile = async (path) => {
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

    const readBinaryFile = async (path) => {
        try {
            const result = await ReadBinaryFile(path);
            return result;
        } catch (err) {
            console.error("Failed to read binary file:", err);
            throw err;
        }
    };

    const value = {
        vaultPath,
        setVaultPath,
        files,
        setFiles,
        currentFile,
        setCurrentFile,
        content,
        setContent,
        expandedFolders,
        setExpandedFolders,
        loadVaultContents,
        openVault,
        createFile,
        createFolder,
        renameFile,
        moveFile,
        deleteFile,
        readFile,
        readBinaryFile,
    };

    return (
        <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
    );
};

const VaultContext = createContext();

export const useVault = () => {
    const context = useContext(VaultContext);
    if (!context) {
        throw new Error("useVault must be used within VaultProvider");
    }
    return context;
};
