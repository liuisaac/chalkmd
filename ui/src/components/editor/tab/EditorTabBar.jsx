import EditorTab from "./EditorTab";
import { PlusIcon } from "lucide-react";
import { useState, useEffect } from "react";

const EditorTabBar = ({
    tabs,
    activeTabId,
    onTabClick,
    onTabClose,
    onNewTab,
    sidebarWidth,
}) => {
    const limitedTabs = tabs.slice(0, 20);
    const isDocked = sidebarWidth === 0;

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const transitionStyle = isDocked
        ? "margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1), max-width 300ms cubic-bezier(0.4, 0, 0.2, 1)"
        : "none";

    const maxContainerWidth = windowWidth - sidebarWidth - 205;
    const parentWidth = maxContainerWidth - 50;

    return (
        <div
            className="flex-1 flex flex-row items-center justify-start bg-transparent h-10"
            style={{
                marginLeft: `${Math.max(44, sidebarWidth)}px`,
                maxWidth: `${maxContainerWidth}px`,
                transition: transitionStyle,
                "--wails-draggable": "no-drag",
            }}
        >
            <div className="pl-4 flex flex-row items-end justify-start flex-1 overflow-x-auto overflow-y-hidden gap-[2px] bg-transparent">
                {limitedTabs.map((tab) => (
                    <EditorTab
                        key={tab.id}
                        tab={tab}
                        active={activeTabId}
                        onClick={() => onTabClick(tab.id)}
                        onClose={onTabClose}
                        totalTabs={limitedTabs.length}
                        parentWidth={parentWidth}
                    />
                ))}
                <div
                    onClick={onNewTab}
                    className="w-8 py-2 text-gray-500 text-xl flex-shrink-0 group"
                >
                    <PlusIcon
                        size={26}
                        className="inline-block mx-auto group-hover:bg-black/5 p-1 rounded-[4px] -mb-1"
                    />
                </div>
            </div>
        </div>
    );
};

export default EditorTabBar;
