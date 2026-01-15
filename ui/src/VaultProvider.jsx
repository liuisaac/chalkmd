import { useState, useEffect, createContext, useContext } from "react";

// fs handlers
import {
    createFile,
    createFolder,
    renameFile,
    moveFile,
    deleteFile,
    readFile,
} from "./fs/file";

import {
    loadVaultContents as LoadVaultContents,
    createVault,
    openVault as OpenVault,
    selectVaultFolder,
} from "./fs/vault";

import { readBinaryFile } from "./fs/assets";

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
                .then(() => LoadVaultContents(setFiles))
                .catch((error) => {
                    console.error("Error loading saved vault:", error);
                    setVaultPath(null);
                });
        }
    }, []);

    const openVault = async (x) => {OpenVault(x, setVaultPath, setFiles);}
    const loadVaultContents = async () => {LoadVaultContents(setFiles);}

    const value = {
        vaultPath,
        setVaultPath,
        selectVaultFolder,
        files,
        setFiles,
        currentFile,
        setCurrentFile,
        content,
        setContent,
        expandedFolders,
        setExpandedFolders,
        loadVaultContents,
        createVault,
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
