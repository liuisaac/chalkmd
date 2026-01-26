const deserialize = (text, INDENT_SIZE) => {
    if (typeof text !== "string" || !text) {
        return {
            type: "doc",
            content: [{ type: "paragraph" }],
        };
    }

    const lines = text.split("\n");
    const content = [];
    for (const line of lines) {
        const imageMatch = line.match(/^!\[\[([^\]|]+)(?:\|(\d+))?\]\]$/);
        if (imageMatch) {
            const filename = imageMatch[1];
            const width = imageMatch[2] ? parseInt(imageMatch[2]) : null;
            content.push({
                type: "paragraph",
                content: [{ type: "text", text: line }],  // ← Just plain text!
            });
            continue;
        }

        const checkboxMatch = line.match(/^(\s*)- \[([ x])\]\s?(.*)$/);
        if (checkboxMatch) {
            const spaces = checkboxMatch[1].length;
            const indentLevel = Math.floor(spaces / INDENT_SIZE);
            const checked = checkboxMatch[2] === "x";
            const itemText = checkboxMatch[3];
            content.push({
                type: "checkboxItem",
                attrs: { indent: indentLevel, checked: checked },
                content: itemText ? [{ type: "text", text: itemText }] : [],
            });
            continue;
        }

        const bulletMatch = line.match(/^(\s*)- (.*)$/);
        if (bulletMatch) {
            const spaces = bulletMatch[1].length;
            const indentLevel = Math.floor(spaces / INDENT_SIZE);
            const itemText = bulletMatch[2];
            content.push({
                type: "bulletItem",
                attrs: { indent: indentLevel },
                content: itemText ? [{ type: "text", text: itemText }] : [],
            });
            continue;
        }

        content.push({
            type: "paragraph",
            content: line ? [{ type: "text", text: line }] : [],
        });
    }
    return {
        type: "doc",
        content: content.length > 0 ? content : [{ type: "paragraph" }],
    };
};

export default deserialize