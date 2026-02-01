import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

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

    // Refs for debouncing and serializing vault reloads
    // This prevents race conditions when multiple file operations happen rapidly
    const reloadTimeoutRef = useRef(null);
    const reloadPromiseRef = useRef(null);
    const reloadGenerationRef = useRef(0);

    const openVault = async (x) => {
        await OpenVault(x, setVaultPath, setFiles);
    };

    // Debounced and serialized vault reload to prevent race conditions
    // Multiple rapid file operations won't cause stale file lists to overwrite newer ones
    const loadVaultContents = useCallback(async () => {
        // Cancel any pending reload
        if (reloadTimeoutRef.current) {
            clearTimeout(reloadTimeoutRef.current);
        }
        
        // Increment generation to track which reload is current
        const generation = ++reloadGenerationRef.current;
        
        return new Promise((resolve, reject) => {
            reloadTimeoutRef.current = setTimeout(async () => {
                try {
                    // If another reload was scheduled, skip this one
                    if (generation !== reloadGenerationRef.current) {
                        resolve();
                        return;
                    }
                    
                    // Wait for any in-progress reload to complete
                    if (reloadPromiseRef.current) {
                        await reloadPromiseRef.current;
                    }
                    
                    // Check again after waiting
                    if (generation !== reloadGenerationRef.current) {
                        resolve();
                        return;
                    }
                    
                    // Perform the actual reload
                    reloadPromiseRef.current = LoadVaultContents(setFiles);
                    await reloadPromiseRef.current;
                    reloadPromiseRef.current = null;
                    resolve();
                } catch (error) {
                    reloadPromiseRef.current = null;
                    console.error("Error reloading vault contents:", error);
                    reject(error);
                }
            }, 50); // 50ms debounce to batch rapid operations
        });
    }, []);

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
