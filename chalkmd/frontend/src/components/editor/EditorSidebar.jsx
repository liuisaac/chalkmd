import { useState, useRef, useEffect } from "react";
import EditorPinned from "./sidebar/EditorPinned";
import EditorRibbon from "./sidebar/EditorRibbon";
import EditorFooter from "./sidebar/EditorFooter";
import FileTree from "./filetree/FileTree";
import FileTreeRibbon from "./filetree/FileTreeRibbon";

const EditorSidebar = ({ files, onFileClick, setSidebarWidth }) => {
    const minimumWidth = 235;
    const collapseThreshold = 100;
    const [width, setWidth] = useState(minimumWidth);
    const [isResizing, setIsResizing] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const sidebarRef = useRef(null);

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

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing]);

    useEffect(() => {
        if (isOpen && width < minimumWidth) {
            setWidth(minimumWidth);
            setSidebarWidth(minimumWidth);
        }

        if (!isOpen) {
            setWidth(0);
            setSidebarWidth(0); // Add this line
        }
    }, [isOpen]);

    return (
        <>
            {/* EditorPinned stays visible even when sidebar is collapsed */}
            <div 
                className="fixed top-0 left-0 z-50 border-b-[1px] border-r-[1px] border-[#e0e0e0]"
                style={{ width: `${Math.max(width, 44)}px` }}
            >
                <EditorPinned isOpen={isOpen} setIsOpen={setIsOpen} />
            </div>

            <div 
                ref={sidebarRef}
                className="bg-topbar border-r-[1px] border-[#E0E0E0] relative flex flex-col overflow-x-clip h-screen transition-all duration-0"
                style={{ width: `${width}px`, paddingTop: '40px' }}
            >
                <EditorRibbon isOpen={isOpen} setIsOpen={setIsOpen} />
                {
                    isOpen && <FileTreeRibbon />
                }
                
                <div className="flex-1 overflow-y-auto">
                    <FileTree
                        files={files}
                        onFileClick={onFileClick}
                    />
                </div>
                
                <EditorFooter />

                <div
                    className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize transition-colors z-10"
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