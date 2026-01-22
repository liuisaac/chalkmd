import { useState, useRef, useEffect } from "react";
import EditorPinned from "./sidebar/EditorPinned";
import EditorRibbon from "./sidebar/EditorRibbon";
import EditorFooter from "./sidebar/EditorFooter";
import FileTree from "./filetree/FileTree";
import FileTreeRibbon from "./filetree/FileTreeRibbon";

const EditorSidebar = ({ onFileClick, setSidebarWidth }) => {
    const minimumWidth = 235;
    const collapseThreshold = 100;
    const [width, setWidth] = useState(minimumWidth);
    const [isResizing, setIsResizing] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const [sortKey, setSortKey] = useState("name-asc");
    const [revealedFile, setRevealedFile] = useState(null);
    const [expandAll, setExpandAll] = useState(false);
    const [closeAll, setCloseAll] = useState(false);

    const sidebarRef = useRef(null);

    const transitionStyle = isResizing
        ? "none"
        : "all 300ms cubic-bezier(0.4, 0, 0.2, 1)";

    const revealFile = (file) => {
        console.log("Revealing file:", file);
        setRevealedFile(file);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            const newWidth = e.clientX;

            if (newWidth < collapseThreshold) {
                setIsOpen(false);
                setWidth(0);
                setSidebarWidth(0);
                return;
            }

            if (newWidth >= minimumWidth && newWidth <= 600) {
                setIsOpen(true);
                setWidth(newWidth);
                setSidebarWidth(newWidth);
            }
        };

        const handleMouseUp = () => setIsResizing(false);

        if (isResizing) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "ew-resize";
            document.body.style.userSelect = "none";
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [isResizing, setSidebarWidth]);

    useEffect(() => {
        if (isOpen && width < minimumWidth) {
            setWidth(minimumWidth);
            setSidebarWidth(minimumWidth);
        }
        if (!isOpen) {
            setWidth(0);
            setSidebarWidth(0);
        }
    }, [isOpen, setSidebarWidth]);

    useEffect(() => {
        if (expandAll) {
            setCloseAll(false);
        }
    }, [expandAll]);

    useEffect(() => {
        if (closeAll) {
            setExpandAll(false);
        }
    }, [closeAll]);

    return (
        <>
            <div
                className="fixed top-0 left-0 z-50 border-b-[1px] border-r-[1px] border-[#e0e0e0] min-w-11"
                style={{
                    width: `${Math.max(width, 44)}px`,
                    transition: transitionStyle,
                }}
            >
                <EditorPinned isOpen={isOpen} setIsOpen={setIsOpen} />
            </div>

            <div
                ref={sidebarRef}
                className="bg-topbar border-r-[1px] border-[#E0E0E0] relative flex flex-col h-screen overflow-hidden"
                style={{
                    width: `${width}px`,
                    transition: transitionStyle,
                }}
            >
                <div
                    style={{
                        width: isOpen ? "100%" : "0px",
                        minWidth: `${minimumWidth}px`,
                        height: "100%",
                        transition: transitionStyle,
                        opacity: isOpen ? 1 : 0,
                        filter: isOpen ? "blur(0px)" : "blur(4px)",
                        transform: isOpen
                            ? "translateX(0px)"
                            : "translateX(-10px)",
                    }}
                    className="flex flex-col"
                >
                    <EditorRibbon isOpen={isOpen} />

                    <div
                        style={{ paddingTop: "40px" }}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        <FileTreeRibbon
                            sortKey={sortKey}
                            setSortKey={setSortKey}
                            revealFile={revealFile}
                            setExpandAll={setExpandAll}
                            setCloseAll={setCloseAll}
                        />

                        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full custom-sidebar-scrollbar text-left">
                            <div className="flex flex-col min-h-full">
                                <FileTree
                                    onFileClick={onFileClick}
                                    sortKey={sortKey}
                                    revealedFile={revealedFile}
                                    setRevealedFile={setRevealedFile}
                                    expandAll={expandAll}
                                    closeAll={closeAll}
                                />
                            </div>
                        </div>

                        <EditorFooter />
                    </div>
                </div>

                <div
                    className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize z-10"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        setIsResizing(true);
                    }}
                />
            </div>
        </>
    );
};

export default EditorSidebar;
