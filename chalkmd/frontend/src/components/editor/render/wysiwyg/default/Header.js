import { Decoration } from "@tiptap/pm/view";

const headerHandler = (text, decorations, isActive, nodeStart) => {
    const headerRegex = /^(#{1,6})\s/;
    const match = text.match(headerRegex);

    if (match) {
        const hashEnd = match[0].length;
        const startPos = nodeStart + match.index;
        const endPos = startPos + hashEnd;

        if (!isActive) {
            decorations.push(
                Decoration.inline(startPos, endPos, {
                    style: "font-size: 0; width: 0; display: inline-block; overflow: hidden; vertical-align: middle;",
                })
            );
        } else {
            decorations.push(
                Decoration.inline(startPos, endPos, {
                    style: "color: #999; font-weight: normal;",
                })
            );
        }
    }
};

export default headerHandler;