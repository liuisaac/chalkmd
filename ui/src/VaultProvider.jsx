import { useState, useEffect, createContext, useContext } from "react";

// fs handlers
import {
    createFile as CreateFile,
    createFolder as CreateFolder,
    renameFile as RenameFile,
    moveFile as MoveFile,
    deleteFile as DeleteFile,
    readFile,
} from "./fs/file";

import {
    loadVaultContents as LoadVaultContents,
    createVault,
    openVault as OpenVault,
    selectVaultFolder,
} from "./fs/vault";

import { readBinaryFile, writeBinaryFile } from "./fs/assets";

import { spawnInstance } from "./fs/window";

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
        await OpenVault(x, setVaultPath, setFiles);
    };

    const loadVaultContents = async () => {
        await LoadVaultContents(setFiles);
    };

    const createFile = async (x) => {
        await CreateFile(x, files, vaultPath, setCurrentFile, loadVaultContents);
    };

    const createFolder = async (x) => {
        await CreateFolder(x, files, loadVaultContents);
    };

    const renameFile = async (oldPath, newPath) => {
        await RenameFile(oldPath, newPath, loadVaultContents);
    };

    const moveFile = async (oldPath, newPath) => {
        await MoveFile(oldPath, newPath, loadVaultContents);
    };

    const deleteFile = async (x) => {
        await DeleteFile(x, loadVaultContents);
    };

    // persist vaultPath to localStorage
    useEffect(() => {
        if (vaultPath) {
            localStorage.setItem("vaultPath", vaultPath);

            const history = JSON.parse(localStorage.getItem("vaultHistory")) || [];
            const existingIndex = history.indexOf(vaultPath);
            if (existingIndex > -1) {
                history.splice(existingIndex, 1);
            }
            history.unshift(vaultPath);
            localStorage.setItem("vaultHistory", JSON.stringify(history));
        } else {
            localStorage.removeItem("vaultPath");
        }
    }, [vaultPath]);

    // attempt to autoopen vault on startup
    
    useEffect(() => {
        const initializeVault = async () => {
            const savedPath = localStorage.getItem("vaultPath");
            if (savedPath) {
                try {
                    console.log("Auto-opening saved vault at:", savedPath);
                    await openVault(savedPath);
                    await loadVaultContents();
                } catch (error) {
                    console.error("Error opening saved vault:", error);
                    setVaultPath(null);
                }
            }
        };
        
        initializeVault();
    }, []);

    const vaultMethods = {
        vaultPath,
        setVaultPath,
        selectVaultFolder,
        loadVaultContents,
        createVault,
        openVault,
    };

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
        writeBinaryFile,
    };

    const value = {
        currentFile,
        setCurrentFile,
        content,
        setContent,
        spawnInstance,
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
