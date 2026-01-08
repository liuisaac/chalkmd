import React from "react";
import EditorTab from "./EditorTab";
import { PlusIcon } from "lucide-react";

const EditorTabBar = ({
    tabs,
    activeTabId,
    onTabClick,
    onTabClose,
    onNewTab,
    sidebarWidth,
}) => {
    // Limit to 50 tabs
    const limitedTabs = tabs.slice(0, 20);
    
    return (
        <div 
            className="flex-1 flex flex-row items-center justify-start bg-topbar h-10"
            style={{ 
                marginLeft: `${Math.max(44, sidebarWidth)}px`,
                maxWidth: `calc(100vw - ${sidebarWidth}px - 205px)`
            }}
        >
            <div className="pl-4 flex flex-row items-end justify-start flex-1 overflow-x-auto overflow-y-hidden gap-[2px]">
                {limitedTabs.map((tab) => (
                    <EditorTab
                        key={tab.id}
                        tab={tab}
                        active={activeTabId}
                        onClick={() => onTabClick(tab.id)}
                        onClose={onTabClose}
                        totalTabs={limitedTabs.length}
                        parentWidth={window.innerWidth - 205 - sidebarWidth}
                    />
                ))}
                <div
                    onClick={onNewTab}
                    disabled={tabs.length >= 50}
                    className="w-8 py-2 text-gray-500 text-xl flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <PlusIcon size={26} className="inline-block mx-auto cursor-pointer group-hover:bg-black/5 p-1 rounded-[4px] -mb-1" />
                </div>
            </div>
        </div>
    );
};

export default EditorTabBar;