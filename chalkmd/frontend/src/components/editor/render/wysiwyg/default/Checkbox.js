import { Decoration } from "@tiptap/pm/view";

const checkboxHandler = (text, decorations, nodeStart, isActive, state, pos, node, editor) => {
    const checkboxMatch = text.match(/^- \[([ x])\] /);
    if (checkboxMatch) {
        const checked = checkboxMatch[1] === "x";

        if (!isActive) {
            decorations.push(
                Decoration.inline(
                    nodeStart,
                    nodeStart + checkboxMatch[0].length,
                    {
                        style: "font-size: 0; width: 0;",
                    }
                )
            );
            decorations.push(
                Decoration.widget(nodeStart, () => {
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.checked = checked;
                    checkbox.style.marginRight = "0.5em";
                    checkbox.onclick = (e) => {
                        e.preventDefault();
                        const newText = checked
                            ? text.replace("- [x]", "- [ ]")
                            : text.replace("- [ ]", "- [x]");
                        const tr = state.tr.replaceWith(
                            pos,
                            pos + node.nodeSize,
                            state.schema.text(newText)
                        );
                        editor.view.dispatch(tr);
                    };
                    return checkbox;
                })
            );
        } else {
            decorations.push(
                Decoration.inline(
                    nodeStart,
                    nodeStart + checkboxMatch[0].length,
                    {
                        style: "color: #999;",
                    }
                )
            );
        }
    }
};

export default checkboxHandler;