import { Calendar, PanelLeftCloseIcon, PanelLeftIcon, Pen, Crop, Table, Network, Copy, Terminal, AlarmClock, BrainCircuit } from "lucide-react";



const EditorRibbon = ({ isOpen, setIsOpen }) => {
    return (
        <div className="bg-topbar w-11 h-screen fixed left-0 top-0 border-r-[1px] border-[#E0E0E0] pt-2.5 gap-4 z-40 flex flex-col items-center justify-start">
            <div className="flex flex-col items-center justify-center text-gray-500 mt-10">
                <Calendar size={18} className="mb-5" />
                <AlarmClock size={18} className="mb-5" />
                <Pen size={18} className="mb-5" />
                <Crop size={18} className="mb-5" />
                <Table size={18} className="mb-5" />
                <Network size={18} className="mb-5" />
                <Copy size={18} className="mb-5" />
                <BrainCircuit size={18} className="mb-5" />
                <Terminal size={18} className="mb-5" />
            </div>
        </div>
    );
};

export default EditorRibbon;
