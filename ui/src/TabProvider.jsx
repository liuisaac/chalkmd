// Wrapper for useTab

import { createContext, useContext } from 'react';
import { useTabs } from './components/editor/lib/useTabs';

const TabContext = createContext();

export const TabProvider = ({ children }) => {
    const tabState = useTabs();
    return <TabContext.Provider value={tabState}>{children}</TabContext.Provider>;
};

export const useTabContext = () => useContext(TabContext);