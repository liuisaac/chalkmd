import { Quit } from "../../../wailsjs/runtime/runtime";

const Exit = () => {
    return (
        <button
            onClick={Quit}
            className="w-12 h-full flex items-center justify-center text-black"
        >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                    d="M1 1l10 10M11 1L1 11"
                    stroke="currentColor"
                    strokeWidth="1"
                />
            </svg>
        </button>
    );
};

export default Exit;
