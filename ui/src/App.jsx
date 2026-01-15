import { useEffect } from "react";
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

    // auto-save 100ms after last change
    useEffect(() => {
        if (!currentFile || !vaultPath) return;

        const timeout = setTimeout(() => {
            WriteFile(currentFile, content).catch((err) =>
                console.error("Auto-save failed:", err)
            );
        }, settings.autoSaveInterval || 100);

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
            <TabProvider>
                <App />
            </TabProvider>
        </VaultProvider>
    );
}

export default AppWithProvider;
