import Minimize from "../ui/Minimize";
import Exit from "../ui/Exit";

const StartTitleBar = () => {
    return (
        <div
            className="h-8 w-full flex items-center bg-[#e4e4e4] border-b-1 border-gray-500 absolute top-0 left-0"
            style={{ "--wails-draggable": "drag" }}
        >
            <div className="flex-1" />
            <div 
                className="h-full flex items-center justify-center gap-2 rounded-sm"
                style={{ "--wails-draggable": "no-drag" }}
            >
                <Minimize />
                <Exit />
            </div>
        </div>
    );
};

export default StartTitleBar;