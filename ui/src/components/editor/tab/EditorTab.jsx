import { useEffect, useState } from "react";
import { useVault } from "../../../VaultProvider";
import { useTabContext } from "../../../TabProvider";

const EditorTab = ({
    tab,
    active,
    onClick,
    onClose,
    totalTabs,
    parentWidth,
}) => {
    const { currentFile } = useVault();
    const { pushToHistory, isNavigating } = useTabContext();
    const upperSize = 180,
        lowerSize = 10;

    const totalRequiredWidth = totalTabs * upperSize;

    const width =
        totalRequiredWidth <= parentWidth
            ? upperSize
            : Math.max(lowerSize, parentWidth / totalTabs - 2);

    const curveRadius = 9;
    const borderWidth = 0.5;
    const showLabel = width > 30;

    const [isActive, setIsActive] = useState(tab.id === active);
    const [currentContent, setCurrentContent] = useState("");

    useEffect(() => {
        setIsActive(tab.id === active);
    }, [active]);

    useEffect(() => {
        if (isActive && currentFile && !isNavigating) {
            pushToHistory(currentFile);
            setCurrentContent(currentFile);
        } else if (isActive && !currentFile && !isNavigating) {
            setCurrentContent("New Tab");
        }
    }, [currentFile, isActive, isNavigating]);

    return (
        <div
            className={`relative flex min-w-0 h-full items-center px-2 py-2 group text-left self-end border-[#e0e0e0] ${
                isActive
                    ? "bg-offwhite text-[#5C5C5C] rounded-t-md border-t-[1.5px] border-l-[1.5px] border-r-[1.5px]"
                    : "bg-transparent text-[#5C5C5C] hover:rounded-md mb-1"
            } ${tab.id != active - 1 && " border-r-[1.5px]"}`}
            onClick={onClick}
            style={{
                width: `${width}px`,
                flexShrink: 0,
                zIndex: tab.id === active ? 40 : 30,
            }}
        >
            {isActive && (
                <>
                    <div
                        className="absolute pointer-events-none z-50"
                        style={{
                            bottom: `1px`,
                            left: `${-curveRadius}px`,
                            width: `${curveRadius}px`,
                            height: `${curveRadius}px`,
                            background: `radial-gradient(circle at top left, transparent ${
                                curveRadius - borderWidth
                            }px, #e0e0e0 ${
                                curveRadius - borderWidth
                            }px, #e0e0e0 ${curveRadius}px, transparent ${curveRadius}px), radial-gradient(circle at top left, transparent ${
                                curveRadius - borderWidth
                            }px, #FAFAFA ${curveRadius - borderWidth}px)`,
                        }}
                    />
                    <div
                        className="absolute pointer-events-none z-50"
                        style={{
                            bottom: `1px`,
                            right: `${-curveRadius}px`,
                            width: `${curveRadius}px`,
                            height: `${curveRadius}px`,
                            background: `radial-gradient(circle at top right, transparent ${
                                curveRadius - borderWidth
                            }px, #e0e0e0 ${
                                curveRadius - borderWidth
                            }px, #e0e0e0 ${curveRadius}px, transparent ${curveRadius}px), radial-gradient(circle at top right, transparent ${
                                curveRadius - borderWidth
                            }px, #FAFAFA ${curveRadius - borderWidth}px)`,
                        }}
                    />
                </>
            )}
            <div
                className={`-mt-1 z-50 w-full flex flex-row items-center justify-between pt-1 ${
                    !isActive ? "-mb-1" : "mb-0 -ml-[1px]"
                } ${showLabel ? "pl-1" : ""}`}
            >
                {showLabel && (
                    <span
                        className={`relative z-10 text-[12px] ${
                            isActive ? "text-[#5C5C5C]" : "text-[#acacac]"
                        } truncate flex-1 mr-1 select-none`}
                    >
                        {currentContent
                            ? currentContent.split("/").pop().replace(".md", "")
                            : "New Tab"}
                    </span>
                )}
                {isActive && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose(tab.id);
                        }}
                        className={`relative z-10 ${
                            isActive
                                ? "opacity-100 hover:bg-black/[0.07] rounded-[3px]"
                                : "opacity-0 hover:text-black"
                        } group-hover:opacity-100 text-[#5C5C5C] font-bold flex-shrink-0 text-xs px-1 py-[1px] select-none cursor-default`}
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

export default EditorTab;
