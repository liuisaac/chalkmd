import Maximize from "../ui/Maximize";
import Minimize from "../ui/Minimize";
import Exit from "../ui/Exit";
import EditorTabBar from "../editor/tab/EditorTabBar";
import { useTabContext } from "./TabContext";

const EditorTitleBar = () => {
    const { tabs, activeTabId, setActiveTabId, createTab, closeTab } = useTabContext();
    
    return (
        <div
            className="h-10 w-full flex items-center bg-offwhite border-b-[1px] border-[#E0E0E0] absolute top-0 left-0"
            style={{ "--wails-draggable": "drag" }}
        >
            <EditorTabBar 
                tabs={tabs}
                activeTabId={activeTabId}
                onTabClick={setActiveTabId}
                onTabClose={closeTab}
                onNewTab={createTab}
            />
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