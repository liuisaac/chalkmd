import ReactDOM from "react-dom";
import { useLayoutEffect, useRef, useState } from "react";

const ContextMenu = ({ children, x, y, onClose }) => {
    const menuRef = useRef(null);
    const [pos, setPos] = useState({ top: y, left: x, visibility: "hidden" });

    useLayoutEffect(() => {
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const screenHeight = window.innerHeight;
            const screenWidth = window.innerWidth;

            let finalY = y;
            let finalX = x;

            if (y + rect.height > screenHeight) {
                finalY = y - rect.height;
            }
            if (x + rect.width > screenWidth) {
                finalX = x - rect.width;
            }

            finalY = Math.max(5, finalY);
            setPos({ top: finalY, left: finalX, visibility: "visible" });
        }
    }, [x, y]);

    return ReactDOM.createPortal(
        <>
            <div
                className="fixed inset-0 z-[9998] bg-transparent"
                onClick={onClose}
                onContextMenu={(e) => {
                    e.preventDefault();
                    onClose();
                }}
            />

            <div
                ref={menuRef}
                className="fixed z-[9999] bg-[#F2F2F2] border border-gray-300 shadow-xl rounded-md py-1 min-w-[210px] text-[12px] pointer-events-auto select-none transition-opacity duration-75"
                style={{
                    top: pos.top,
                    left: pos.left,
                    visibility: pos.visibility,
                    opacity: pos.visibility === "visible" ? 1 : 0,
                }}
            >
                {children}
            </div>
        </>,
        document.body
    );
};

export default ContextMenu;
