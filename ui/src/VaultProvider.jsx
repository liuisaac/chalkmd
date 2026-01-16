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

    const openVault = async (x) => {
        OpenVault(x, setVaultPath, setFiles);
    };
    const loadVaultContents = async () => {
        LoadVaultContents(setFiles);
    };

    // persist vaultPath to localStorage
    useEffect(() => {
        if (vaultPath) {
            localStorage.setItem("vaultPath", vaultPath);
        } else {
            localStorage.removeItem("vaultPath");
        }
    }, [vaultPath]);

    // attempt to autoopen vault on startup
    useEffect(() => {
        const savedPath = localStorage.getItem("vaultPath");
        if (savedPath) {
            openVault(savedPath)
                .then(() => loadVaultContents())
                .catch((error) => {
                    console.error("Error loading saved vault:", error);
                    setVaultPath(null);
                });
        }
    }, []);

    const vaultMethods = {
        vaultPath,
        setVaultPath,
        selectVaultFolder,
        loadVaultContents,
        createVault,
        openVault,
    }

    const fileMethods = {
        files,
        setFiles,
        expandedFolders,
        setExpandedFolders,
        createFile,
        createFolder,
        renameFile,
        moveFile,
        deleteFile,
        readFile,
    };

    const assetMethods = {
        readBinaryFile,
    };

    const value = {
        currentFile,
        setCurrentFile,
        content,
        setContent,
        ...vaultMethods,
        ...fileMethods,
        ...assetMethods,
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
