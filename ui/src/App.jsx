import { useEffect, useRef } from "react";
import { WriteFile } from "../wailsjs/go/internal/App";
import { TabProvider } from "./TabProvider";
import { VaultProvider, useVault } from "./VaultProvider";

// main pages
import Start from "./components/start/Start";
import Editor from "./components/editor/Editor";

// settings, eventually extensions
import settings from "../../settings.json";

import "./style.css";

function App() {
    const { vaultPath, currentFile, content } = useVault();
    
    // Track pending save to prevent race conditions
    const pendingSaveRef = useRef(null);

    // auto-save 100ms after last change
    // IMPORTANT: Capture values at effect creation time to prevent race conditions
    // where switching files causes content to be written to the wrong file
    useEffect(() => {
        if (!currentFile || !vaultPath) return;

        // Capture values at the moment the effect runs, not when timeout fires
        const fileToSave = currentFile;
        const contentToSave = content;
        
        // Cancel any pending save for a different file
        if (pendingSaveRef.current) {
            clearTimeout(pendingSaveRef.current.timeout);
        }

        const timeout = setTimeout(async () => {
            try {
                await WriteFile(fileToSave, contentToSave);
                // Clear the ref after successful save
                if (pendingSaveRef.current?.file === fileToSave) {
                    pendingSaveRef.current = null;
                }
            } catch (err) {
                console.error("Auto-save failed:", err, { file: fileToSave });
            }
        }, settings.autoSaveInterval || 100);
        
        pendingSaveRef.current = { timeout, file: fileToSave };

        return () => {
            clearTimeout(timeout);
        };
    }, [content, currentFile, vaultPath]);

    if (!vaultPath) {
        return <Start />;
    }

    return <Editor />;
}

function AppWithProvider() {
    return (
        <VaultProvider>
            <TabProvider>
                <App />
            </TabProvider>
        </VaultProvider>
    );
}

export default AppWithProvider;
