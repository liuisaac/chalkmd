import React, { useMemo } from "react";
import { parseMarkdown } from "../lib/parseMarkdown";
import { useVault } from "../../../VaultProvider";

const MarkdownEngine = ({ content }) => {
    const { currentFile } = useVault();
    const renderedHtml = useMemo(() => parseMarkdown(content), [content]);

    return (
        <div className="w-full flex flex-col items-center justify-center font-inconsolata">
            <div className="max-w-[750px] flex flex-col items-start justify-start p-6 text-black">
                <h1 className="text-3xl font-bold mb-4">
                    {currentFile
                        .replace(/\.[^/.]+$/, "")
                        .split("/")
                        .pop()}
                </h1>
                <div
                    className="w-full max-w-none leading-relaxed flex flex-col items-start justify-start text-md text-left"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
            </div>
        </div>
    );
};

export default MarkdownEngine;
