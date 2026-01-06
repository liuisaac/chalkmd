import { useState, useEffect, useRef, createContext, useContext } from "react";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import {
    OpenVault,
    ListVaultContents,
    WriteFile,
} from "../wailsjs/go/main/App";
import Start from "./components/start/Start";
import Editor from "./components/editor/Editor";

const VaultContext = createContext();

export const useVault = () => {
    const context = useContext(VaultContext);
    if (!context) {
        throw new Error("useVault must be used within VaultProvider");
    }
    return context;
};

const VaultProvider = ({ children }) => {
    const [vaultPath, setVaultPath] = useState(() => {
        // Initialize from localStorage
        return localStorage.getItem("vaultPath") || null;
    });
    const [files, setFiles] = useState([]);
    const [currentFile, setCurrentFile] = useState(null);
    const [content, setContent] = useState("");
    const [expandedFolders, setExpandedFolders] = useState(new Set());

    // Save to localStorage whenever vaultPath changes
    useEffect(() => {
        if (vaultPath) {
            localStorage.setItem("vaultPath", vaultPath);
        } else {
            localStorage.removeItem("vaultPath");
        }
    }, [vaultPath]);

    // Auto-load vault on mount if saved path exists
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
    };

    return (
        <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
    );
};

function App() {
    const testingEditor = false; // Set to false when done testing
    const testingPath = "C:/Users/liuis/Desktop/Storage/Vault";

    const { vaultPath, currentFile, content, setContent, openVault } =
        useVault();

    const editorRef = useRef(null);
    const viewRef = useRef(null);

    // For testing: automatically open test vault
    useEffect(() => {
        if (testingEditor && testingPath && !vaultPath) {
            openVault(testingPath).catch(console.error);
        }
    }, [testingEditor, testingPath, vaultPath, openVault]);

    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = `
      * {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      *::-webkit-scrollbar {
        display: none;
      }
    `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    useEffect(() => {
        if (editorRef.current && !viewRef.current) {
            viewRef.current = new EditorView({
                doc: content,
                extensions: [
                    basicSetup,
                    markdown(),
                    oneDark,
                    EditorView.updateListener.of((update) => {
                        if (update.docChanged) {
                            setContent(update.state.doc.toString());
                        }
                    }),
                ],
                parent: editorRef.current,
            });
        }

        return () => {
            if (viewRef.current) {
                viewRef.current.destroy();
                viewRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (
            viewRef.current &&
            viewRef.current.state.doc.toString() !== content
        ) {
            viewRef.current.dispatch({
                changes: {
                    from: 0,
                    to: viewRef.current.state.doc.length,
                    insert: content,
                },
            });
        }
    }, [content]);

    // Auto-save
    useEffect(() => {
        if (!currentFile || !vaultPath) return;

        const timeout = setTimeout(() => {
            WriteFile(currentFile, content).catch((err) =>
                console.error("Auto-save failed:", err)
            );
        }, 1000);

        return () => clearTimeout(timeout);
    }, [content, currentFile, vaultPath]);

    if (!vaultPath) {
        return <Start />;
    }

    return <Editor />;
}

function AppWithProvider() {
    return (
        <VaultProvider>
            <App />
        </VaultProvider>
    );
}

export default AppWithProvider;
