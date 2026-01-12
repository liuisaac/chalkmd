import React, { useCallback } from "react";
import History from "../tab/history";
import { useVault } from "../../../VaultProvider";

export const useTabs = () => {
    const { setCurrentFile, setContent, readFile } = useVault();
    const [tabs, setTabs] = React.useState([
        { 
            id: 1, 
            file: null, 
            content: "", 
            history: new History(50),
            // NEW: Store editor state per tab
            editorState: null 
        },
    ]);
    const [activeTabId, setActiveTabId] = React.useState(1);
    const [nextId, setNextId] = React.useState(2);
    const [isNavigating, setIsNavigating] = React.useState(false);

    const activeTab = tabs.find((t) => t.id === activeTabId);

    const createTab = useCallback(() => {
        const newId = nextId;

        const newTab = {
            id: newId,
            file: null,
            content: "",
            history: new History(50),
            editorState: null, // NEW
        };

        setTabs((prev) => [...prev, newTab]);
        setActiveTabId(newId);
        setNextId((id) => id + 1);
        setIsNavigating(true);
        setCurrentFile(null);
        setContent("");

        setTimeout(() => setIsNavigating(false), 50);
    }, [nextId, setCurrentFile, setContent]);

    const closeTab = useCallback(
        (tabId) => {
            setTabs((currentTabs) => {
                if (currentTabs.length === 1) return currentTabs;

                const tabIndex = currentTabs.findIndex((t) => t.id === tabId);
                const newTabs = currentTabs.filter((t) => t.id !== tabId);

                if (tabId === activeTabId) {
                    const newActiveIndex = Math.max(0, tabIndex - 1);
                    const nextTab = newTabs[newActiveIndex];

                    setActiveTabId(nextTab.id);

                    setIsNavigating(true);
                    setCurrentFile(nextTab.file);
                    setContent(nextTab.content || "");

                    setTimeout(() => setIsNavigating(false), 50);
                }

                return newTabs;
            });
        },
        [activeTabId, setCurrentFile, setContent]
    );

    const updateTabContent = useCallback(
        (content) => {
            setTabs((currentTabs) =>
                currentTabs.map((t) => {
                    if (t.id === activeTabId) {
                        return { ...t, content };
                    }
                    return t;
                })
            );
        },
        [activeTabId]
    );

    // NEW: Save editor state for current tab
    const saveEditorState = useCallback(
        (editorState) => {
            setTabs((currentTabs) =>
                currentTabs.map((t) => {
                    if (t.id === activeTabId) {
                        return { ...t, editorState };
                    }
                    return t;
                })
            );
        },
        [activeTabId]
    );

    // NEW: Get editor state for current tab
    const getEditorState = useCallback(() => {
        const tab = tabs.find((t) => t.id === activeTabId);
        return tab?.editorState || null;
    }, [tabs, activeTabId]);

    const loadFileInTab = useCallback(
        (filePath, fileContent) => {
            setTabs((currentTabs) => {
                return currentTabs.map((t) => {
                    if (t.id === activeTabId) {
                        t.history.push(filePath);
                        return { 
                            ...t, 
                            file: filePath, 
                            content: fileContent,
                            editorState: null // Clear editor state for new file
                        };
                    }
                    return t;
                });
            });
        },
        [activeTabId]
    );

    const navigateHistory = useCallback(
        async (direction) => {
            if (!activeTab || isNavigating) return;

            const fileToNavigateTo =
                direction === "forward"
                    ? activeTab.history.forward()
                    : activeTab.history.backward();

            console.log(`Target file from history:`, fileToNavigateTo);

            if (!fileToNavigateTo) {
                console.log("No further history in this direction");
                return;
            }

            setIsNavigating(true);

            try {
                setTabs((currentTabs) =>
                    currentTabs.map((t) =>
                        t.id === activeTabId
                            ? { ...t, file: fileToNavigateTo }
                            : t
                    )
                );

                console.log("Reading file content for:", fileToNavigateTo);
                const fileContent = await readFile(fileToNavigateTo);

                setCurrentFile(fileToNavigateTo);
                setContent(fileContent);

                console.log("Navigation complete");
            } catch (error) {
                console.error("Error during navigation:", error);
            } finally {
                setTimeout(() => setIsNavigating(false), 100);
            }
        },
        [activeTabId, activeTab, isNavigating, readFile, setCurrentFile, setContent]
    );

    const pushToHistory = useCallback(
        (filePath) => {
            setTabs((currentTabs) =>
                currentTabs.map((t) => {
                    if (t.id === activeTabId) {
                        t.history.push(filePath);
                        return { ...t };
                    }
                    return t;
                })
            );
        },
        [activeTabId]
    );

    const switchTab = useCallback(
        (tabId) => {
            const targetTab = tabs.find((t) => t.id === tabId);
            if (!targetTab) return;
            setIsNavigating(true);
            setActiveTabId(tabId);
            setCurrentFile(targetTab.file);
            setContent(targetTab.content);
            setTimeout(() => setIsNavigating(false), 50);
        },
        [tabs, setCurrentFile, setContent]
    );

    const canGoBack = activeTab ? activeTab.history.canGoBack() : false;
    const canGoForward = activeTab ? activeTab.history.canGoForward() : false;

    return {
        tabs,
        activeTab,
        activeTabId,
        createTab,
        closeTab,
        setActiveTabId,
        updateTabContent,
        loadFileInTab,
        pushToHistory,
        navigateHistory,
        isNavigating,
        canGoBack,
        canGoForward,
        switchTab,
        saveEditorState, // NEW
        getEditorState,  // NEW
    };
};