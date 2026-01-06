import { WindowToggleMaximise } from "../../../wailsjs/runtime/runtime";

const Maximize = () => {
    return (
        <button
            onClick={WindowToggleMaximise}
            className="w-12 h-full flex items-center justify-center text-black"
        >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect 
                    x="1" 
                    y="1" 
                    width="10" 
                    height="10" 
                    stroke="currentColor" 
                    strokeWidth="1" 
                    fill="none"
                />
            </svg>
        </button>
    );
};

export default Maximize;