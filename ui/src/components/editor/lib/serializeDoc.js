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
                lines.push(node.textContent);
            }
        });
    } else {
        return "";
    }
    return lines.join("\n");
};

export default serialize;