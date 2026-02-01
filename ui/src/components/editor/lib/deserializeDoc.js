// Check if a line is a valid table row (starts and ends with |)
function isTableRow(line) {
    const trimmed = line.trim();
    return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2;
}

// Check if a line is a code block fence
function isCodeBlockStart(line) {
    return line.trimStart().startsWith('```');
}

function isCodeBlockEnd(line) {
    return line.trim() === '```';
}

const deserialize = (text, INDENT_SIZE) => {
    if (typeof text !== "string" || !text) {
        return {
            type: "doc",
            content: [{ type: "paragraph" }],
        };
    }

    const lines = text.split("\n");
    const content = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Check for code block: collect lines from ``` to closing ```
        // A code block starts with ``` (possibly followed by language), need at least one more line
        if (isCodeBlockStart(line) && i + 1 < lines.length) {
            // Opening fence with possible language (e.g. ```javascript or just ```)
            const codeLines = [line];
            i++;
            while (i < lines.length) {
                codeLines.push(lines[i]);
                if (isCodeBlockEnd(lines[i])) {
                    i++;
                    break;
                }
                i++;
            }
            // Join code block lines with newlines into a single text node
            const codeText = codeLines.join('\n');
            content.push({
                type: "paragraph",
                content: [{ type: "text", text: codeText }],
            });
            continue;
        }

        // Check for table: collect consecutive table rows into a single paragraph
        if (isTableRow(line)) {
            const tableLines = [];
            while (i < lines.length && isTableRow(lines[i])) {
                tableLines.push(lines[i]);
                i++;
            }
            // Join table lines with newlines and store as single text node
            const tableText = tableLines.join('\n') + '\n';
            content.push({
                type: "paragraph",
                content: [{ type: "text", text: tableText }],
            });
            continue;
        }

        const imageMatch = line.match(/^!\[\[([^\]|]+)(?:\|(\d+))?\]\]$/);
        if (imageMatch) {
            const filename = imageMatch[1];
            const width = imageMatch[2] ? parseInt(imageMatch[2]) : null;
            content.push({
                type: "paragraph",
                content: [{ type: "text", text: line }],  // ← Just plain text!
            });
            i++;
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
            i++;
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
            i++;
            continue;
        }

        content.push({
            type: "paragraph",
            content: line ? [{ type: "text", text: line }] : [],
        });
        i++;
    }
    return {
        type: "doc",
        content: content.length > 0 ? content : [{ type: "paragraph" }],
    };
};

export default deserialize;