import {
    OpenVault,
    ListVaultContents,
    CreateFile,
    CreateFolder,
    RenameFile,
    DeleteFile,
} from "../wailsjs/go/main/App";
import { useState, useEffect, createContext, useContext } from "react";

export const VaultProvider = ({ children }) => {
    const [vaultPath, setVaultPath] = useState(() => {
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
                const existingNames = files.map((f) => f.name.toLowerCase());
                if (!existingNames.includes("Untitled.md")) {
                    nameToCreate = "Untitled.md";
                } else {
                    let counter = 1;
                    while (existingNames.includes(`Untitled ${counter}.md`)) {
                        counter++;
                    }
                    nameToCreate = `Untitled ${counter}.md`;
                }
            }

            await CreateFile(nameToCreate);

            await loadVaultContents();
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

    const deleteFile = async (path) => {
        try {
            await DeleteFile(path);
            await loadVaultContents();
        } catch (error) {
            console.error("Error deleting file:", error);
            throw error;
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
        deleteFile,
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
