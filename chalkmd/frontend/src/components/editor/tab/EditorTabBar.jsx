import React from "react";
import EditorTab from "./EditorTab";

const EditorTabBar = ({
    tabs,
    activeTabId,
    onTabClick,
    onTabClose,
    onNewTab,
}) => {
    return (
        <div className="w-screen ml-64 flex flex-row items-center justify-start bg-yellow-500 border-b border-gray-700 h-10">
            {tabs.map((tab) => (
                <EditorTab
                    key={tab.id}
                    tab={tab}
                    isActive={tab.id === activeTabId}
                    onClick={() => onTabClick(tab.id)}
                    onClose={onTabClose}
                />
            ))}
            <button
                onClick={onNewTab}
                className="px-4 py-2 text-gray-400 hover:text-gray-200 text-xl"
            >
                +
            </button>
        </div>
    );
};
export default EditorTabBar;
