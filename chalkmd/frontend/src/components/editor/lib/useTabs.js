import React from 'react';

export const useTabs = () => {
  const [tabs, setTabs] = React.useState([
    { id: 1, file: null, content: '' }
  ]);
  const [activeTabId, setActiveTabId] = React.useState(1);
  const [nextId, setNextId] = React.useState(2);

  const activeTab = tabs.find(t => t.id === activeTabId);

  const createTab = () => {
    const newTab = { id: nextId, file: null, content: '' };
    setTabs([...tabs, newTab]);
    setActiveTabId(nextId);
    setNextId(nextId + 1);
  };

  const closeTab = (tabId) => {
    if (tabs.length === 1) return; // Always keep at least one tab
    
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    // Switch to adjacent tab if closing active tab
    if (tabId === activeTabId) {
      const newActiveIndex = Math.max(0, tabIndex - 1);
      setActiveTabId(newTabs[newActiveIndex].id);
    }
  };

  const updateTabContent = (content) => {
    setTabs(tabs.map(t => 
      t.id === activeTabId ? { ...t, content } : t
    ));
  };

  const loadFileInTab = (filePath, fileContent) => {
    setTabs(tabs.map(t => 
      t.id === activeTabId ? { ...t, file: filePath, content: fileContent } : t
    ));
  };

  return {
    tabs,
    activeTab,
    activeTabId,
    createTab,
    closeTab,
    setActiveTabId,
    updateTabContent,
    loadFileInTab
  };
};