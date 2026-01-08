import { Decoration } from "@tiptap/pm/view";

const italicHandler = (text, decorations, nodeStart, cursorPos) => {
    const italicRegex = /(?<!\*)\*(?!\*)([^\*]+)\*(?!\*)/g;
    let italicMatch;
    while ((italicMatch = italicRegex.exec(text)) !== null) {
        const start = nodeStart + italicMatch.index;
        const end = start + italicMatch[0].length;
        const contentStart = start + 1;
        const contentEnd = end - 1;
        const inRange = cursorPos >= start && cursorPos <= end;

        if (!inRange) {
            decorations.push(
                Decoration.inline(start, contentStart, {
                    style: "font-size: 0; width: 0;",
                })
            );
            decorations.push(
                Decoration.inline(contentEnd, end, {
                    style: "font-size: 0; width: 0;",
                })
            );
        } else {
            decorations.push(
                Decoration.inline(start, contentStart, {
                    style: "color: #999;",
                })
            );
            decorations.push(
                Decoration.inline(contentEnd, end, {
                    style: "color: #999;",
                })
            );
        }

        decorations.push(
            Decoration.inline(contentStart, contentEnd, {
                style: "font-style: italic;",
            })
        );
    }
};

export default italicHandler;
