import Maximize from "../ui/Maximize";
import Minimize from "../ui/Minimize";
import Exit from "../ui/Exit";
import EditorTabBar from "../editor/tab/EditorTabBar";
import { useTabContext } from "../../TabProvider";

const EditorTitleBar = ({ sidebarWidth }) => {
    const { tabs, activeTabId, createTab, closeTab, switchTab } =
        useTabContext();

    return (
        <div
            className="h-10 w-screen flex items-center bg-midbar absolute top-0 left-0"
            style={{ "--wails-draggable": "drag" }}
        >
            <EditorTabBar
                tabs={tabs}
                activeTabId={activeTabId}
                onTabClick={switchTab}
                onTabClose={closeTab}
                onNewTab={createTab}
                sidebarWidth={sidebarWidth}
            />
            <div className="w-full min-w-0" />
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
