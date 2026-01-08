import { Decoration } from "@tiptap/pm/view";

const headerHandler = (text, decorations, isActive, nodeStart) => {
    const headerMatch = text.match(/^(#{1,6})\s/);
    if (headerMatch) {
        const hashEnd = headerMatch[0].length;

        if (!isActive) {
            decorations.push(
                Decoration.inline(nodeStart, nodeStart + hashEnd, {
                    style: "font-size: 0; width: 0; display: inline-block; overflow: hidden;",
                })
            );
        } else {
            decorations.push(
                Decoration.inline(nodeStart, nodeStart + hashEnd, {
                    style: "color: #999;",
                })
            );
        }
    }
};

export default headerHandler;
