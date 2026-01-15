import { WindowMinimise } from "../../../wailsjs/runtime/runtime";

const Minimize = () => {
    return (
        <button
            onClick={WindowMinimise}
            className="w-12 h-full flex items-center justify-center text-black"
        >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M0 6h12" stroke="currentColor" strokeWidth="1" />
            </svg>
        </button>
    );
};

export default Minimize;