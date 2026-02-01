// Check if text content is a table (contains newlines and table rows)
function isTableContent(text) {
    if (!text.includes('\n')) return false;
    const lines = text.split('\n').filter(l => l.trim() !== '');
    if (lines.length < 2) return false;
    return lines.every(line => {
        const trimmed = line.trim();
        return trimmed.startsWith('|') && trimmed.endsWith('|');
    });
}

// Check if text content is a code block (starts with ``` and ends with ```)
function isCodeBlockContent(text) {
    if (!text.includes('\n')) return false;
    const lines = text.split('\n');
    if (lines.length < 2) return false;
    return lines[0].trimStart().startsWith('```') && lines[lines.length - 1].trim() === '```';
}

const serialize = (editor, INDENT_SIZE) => {
    if (!editor || editor?.isDestroyed || !editor.state) return "";

    const { doc } = editor.state;
    const lines = [];
    if (doc && typeof doc.forEach === "function") {
        doc.forEach((node) => {
            if (node.type.name === "checkboxItem") {
                const indent = node.attrs.indent || 0;
                const checked = node.attrs.checked || false;
                const spaces = " ".repeat(indent * INDENT_SIZE);
                const content = node.textContent;
                const checkmark = checked ? "x" : " ";
                lines.push(`${spaces}- [${checkmark}] ${content}`);
            } else if (node.type.name === "bulletItem") {
                const indent = node.attrs.indent || 0;
                const spaces = " ".repeat(indent * INDENT_SIZE);
                const content = node.textContent;
                lines.push(`${spaces}- ${content}`);
            } else if (node.type.name === "imageNode") {
                const { filename, width } = node.attrs;
                const widthPart = width ? `|${width}` : "";
                lines.push(`![[${filename}${widthPart}]]`);
            } else {
                const content = node.textContent;
                // Tables and code blocks are stored with embedded newlines - output them as-is
                if (isTableContent(content)) {
                    lines.push(content.replace(/\n$/, ''));
                } else if (isCodeBlockContent(content)) {
                    lines.push(content);
                } else {
                    lines.push(content);
                }
            }
        });
    } else {
        return "";
    }
    return lines.join("\n");
};

export default serialize;