import { Decoration } from "@tiptap/pm/view";

const bulletHandler = (text, decorations, isActive, nodeStart) => {
    const bulletMatch = text.match(/^- /);
    if (bulletMatch) {
        decorations.push(
            Decoration.inline(nodeStart, nodeStart + 2, {
                style: "font-size: 0; width: 0;",
            })
        );
        // Add bullet
        decorations.push(
            Decoration.widget(nodeStart, () => {
                const bullet = document.createElement("span");
                bullet.textContent = "-";
                if (!isActive) {
                    bullet.style.color = "#a0a0a0";
                } else {
                    bullet.style.color = "#8250ff";
                }
                bullet.style.marginRight = "0.2em";
                bullet.style.userSelect = "none";
                bullet.style.pointerEvents = "none";
                bullet.style.position = "relative";
                bullet.style.top = "0.1em";
                return bullet;
            })
        );
    }
};

export default bulletHandler;
