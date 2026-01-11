import React, { useCallback } from "react";
import History from "../tab/history";
import { useVault } from "../../../VaultProvider";
export const useTabs = () => {
    const { setCurrentFile, setContent, readFile } = useVault();
    const [tabs, setTabs] = React.useState([
        { id: 1, file: null, content: "", history: new History(50) },
    ]);
    const [activeTabId, setActiveTabId] = React.useState(1);
    const [nextId, setNextId] = React.useState(2);
    const [isNavigating, setIsNavigating] = React.useState(false);

    const activeTab = tabs.find((t) => t.id === activeTabId);

    const createTab = useCallback(() => {
        setNextId((currentNextId) => {
            setTabs((currentTabs) => {
                const newTab = {
                    id: currentNextId,
                    file: null,
                    content: "",
                    history: new History(50),
                };
                setActiveTabId(currentNextId);
                return [...currentTabs, newTab];
            });
            return currentNextId + 1;
        });
    }, []);

    const closeTab = useCallback(
        (tabId) => {
            setTabs((currentTabs) => {
                if (currentTabs.length === 1) return currentTabs;

                const tabIndex = currentTabs.findIndex((t) => t.id === tabId);
                const newTabs = currentTabs.filter((t) => t.id !== tabId);

                if (tabId === activeTabId) {
                    const newActiveIndex = Math.max(0, tabIndex - 1);
                    setActiveTabId(newTabs[newActiveIndex].id);
                }

                return newTabs;
            });
        },
        [activeTabId]
    );

    const updateTabContent = useCallback(
        (content) => {
            setTabs((currentTabs) =>
                currentTabs.map((t) => {
                    if (t.id === activeTabId) {
                        // REMOVE THIS LINE:
                        // t.history.push(content);

                        // Only update the state content, NOT the navigation history
                        return { ...t, content };
                    }
                    return t;
                })
            );
        },
        [activeTabId]
    );

    const loadFileInTab = useCallback(
        (filePath, fileContent) => {
            setTabs((currentTabs) => {
                return currentTabs.map((t) => {
                    if (t.id === activeTabId) {
                        t.history.push(filePath);
                        return { ...t, file: filePath, content: fileContent };
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

            // 1. Get the file from history BEFORE updating state
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
                // 2. Update the tabs state to reflect the new file for this tab
                setTabs((currentTabs) =>
                    currentTabs.map((t) =>
                        t.id === activeTabId
                            ? { ...t, file: fileToNavigateTo }
                            : t
                    )
                );

                // 3. Update the global vault/editor state
                console.log("Reading file content for:", fileToNavigateTo);
                const fileContent = await readFile(fileToNavigateTo);

                setCurrentFile(fileToNavigateTo);
                setContent(fileContent);

                console.log("Navigation complete");
            } catch (error) {
                console.error("Error during navigation:", error);
            } finally {
                // Small timeout prevents "double-pushing" the same file
                // back into history while the editor is loading
                setTimeout(() => setIsNavigating(false), 100);
            }
        },
        [activeTabId, activeTab, isNavigating]
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
    };
};
