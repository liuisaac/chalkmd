import { Decoration } from "@tiptap/pm/view";

const bulletHandler = (text, decorations, isActive, nodeStart) => {
    const bulletMatch = text.match(/^- /);
    if (bulletMatch) {
        if (!isActive) {
            decorations.push(
                Decoration.inline(nodeStart, nodeStart + 2, {
                    style: "font-size: 0; width: 0;",
                })
            );
            // Add bullet
            decorations.push(
                Decoration.widget(nodeStart, () => {
                    const bullet = document.createElement("span");
                    bullet.textContent = "• ";
                    bullet.style.marginRight = "0.5em";
                    return bullet;
                })
            );
        } else {
            decorations.push(
                Decoration.inline(nodeStart, nodeStart + 2, {
                    style: "color: #999;",
                })
            );
        }
    }
};

export default bulletHandler;
