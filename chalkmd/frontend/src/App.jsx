import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import {
    WriteFile,
} from "../wailsjs/go/main/App";
import Start from "./components/start/Start";
import Editor from "./components/editor/Editor";
import { VaultProvider, useVault } from "./VaultProvider";

function App() {
    const testingEditor = false; // Set to false when done testing
    const thumbColor = "#d0d0d0";
    const testingPath = "C:/Users/liuis/Desktop/Storage/Vault";

    const { vaultPath, currentFile, content, setContent, openVault } =
        useVault();

    const editorRef = useRef(null);
    const viewRef = useRef(null);

    // testing: automatically open test vault
    useEffect(() => {
        if (testingEditor && testingPath && !vaultPath) {
            openVault(testingPath).catch(console.error);
        }
    }, [testingEditor, testingPath, vaultPath, openVault]);

    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = `
        /* Firefox */
        * {
            scrollbar-color: ${thumbColor} transparent;
            scrollbar-width: thin;
        }

        /* Webkit (Chrome/Safari/Edge) */
        *::-webkit-scrollbar {
            width: 8px;
            height: 8px; /* For horizontal scrollbars */
        }

        /* Targeted removal of all button elements */
        *::-webkit-scrollbar-button:single-button,
        *::-webkit-scrollbar-button:start:decrement,
        *::-webkit-scrollbar-button:end:increment,
        *::-webkit-scrollbar-button:vertical:start:increment,
        *::-webkit-scrollbar-button:vertical:end:decrement {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
        }

        /* Removes the little square where horizontal and vertical scrollbars meet */
        *::-webkit-scrollbar-corner {
            background: transparent;
        }

        *::-webkit-scrollbar-track {
            background: transparent;
        }

        *::-webkit-scrollbar-thumb {
            background-color: ${thumbColor};
            border-radius: 10px;
            border: 2px solid transparent;
            background-clip: content-box;
        }

        *::-webkit-scrollbar-thumb:hover {
            background-color: #374151;
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
        }, 100);

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
