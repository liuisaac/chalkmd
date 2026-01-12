import { Decoration } from "@tiptap/pm/view";

const boldHandler = (text, decorations, nodeStart, cursorPos) => {
    const boldRegex = /\*\*([^\*]+)\*\*/g;
    let boldMatch;
    while ((boldMatch = boldRegex.exec(text)) !== null) {
        const start = nodeStart + boldMatch.index;
        const end = start + boldMatch[0].length;
        const contentStart = start + 2;
        const contentEnd = end - 2;
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
                style: "font-weight: bold;",
            })
        );
    }
};

export default boldHandler;
