import Maximize from "../ui/Maximize";
import Minimize from "../ui/Minimize";
import Exit from "../ui/Exit";
import EditorTabBar from "../editor/tab/EditorTabBar";
import { useTabContext } from "./TabContext";

const EditorTitleBar = ({ sidebarWidth }) => {
    const { tabs, activeTabId, setActiveTabId, createTab, closeTab } = useTabContext();
    
    return (
        <div
            className="h-10 w-screen flex items-center bg-topbar absolute top-0 left-0"
            style={{ "--wails-draggable": "drag" }}
        >
            <EditorTabBar 
                tabs={tabs}
                activeTabId={activeTabId}
                onTabClick={setActiveTabId}
                onTabClose={closeTab}
                onNewTab={createTab}
                sidebarWidth={sidebarWidth}
            />
            <div className="flex-1"/>
            <div
                className="h-full flex items-center justify-center gap-2 rounded-sm"
                style={{ "--wails-draggable": "no-drag" }}
            >
                <Minimize />
                <Maximize />
                <Exit />
            </div>
        </div>
    );
};

export default EditorTitleBar;