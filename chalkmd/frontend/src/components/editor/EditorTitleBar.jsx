import Maximize from "../ui/Maximize";
import Minimize from "../ui/Minimize";
import Exit from "../ui/Exit";

const EditorTitleBar = () => {
    return (
        <div
            className="h-10 w-full flex items-center bg-offwhite border-b-[1px] border-[#E0E0E0] absolute top-0 left-0"
            style={{ "--wails-draggable": "drag" }}
        >
            <div className="flex-1" />
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