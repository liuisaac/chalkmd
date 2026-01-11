const defaultShortcuts = (editor) => {
    return {
        "Mod-b": () => {
            const { from, to } = editor.state.selection;
            const text = editor.state.doc.textBetween(from, to);

            if (text) {
                editor.commands.insertContentAt(
                    { from, to },
                    `**${text}**`
                );
            } else {
                editor.commands.insertContent("****");
                // Move cursor between the asterisks
                const pos = editor.state.selection.from - 2;
                editor.commands.setTextSelection(pos);
            }
            return true;
        },
        "Mod-i": () => {
            const { from, to } = editor.state.selection;
            const text = editor.state.doc.textBetween(from, to);

            if (text) {
                editor.commands.insertContentAt({ from, to }, `*${text}*`);
            } else {
                editor.commands.insertContent("**");
                const pos = editor.state.selection.from - 1;
                editor.commands.setTextSelection(pos);
            }
            return true;
        },
        "Mod-e": () => {
            const { from, to } = editor.state.selection;
            const text = editor.state.doc.textBetween(from, to);

            if (text) {
                editor.commands.insertContentAt(
                    { from, to },
                    `\`${text}\``
                );
            } else {
                editor.commands.insertContent("``");
                const pos = editor.state.selection.from - 1;
                editor.commands.setTextSelection(pos);
            }
            return true;
        },
        "Mod-Shift-s": () => {
            const { from, to } = editor.state.selection;
            const text = editor.state.doc.textBetween(from, to);

            if (text) {
                editor.commands.insertContentAt(
                    { from, to },
                    `~~${text}~~`
                );
            } else {
                editor.commands.insertContent("~~~~");
                const pos = editor.state.selection.from - 2;
                editor.commands.setTextSelection(pos);
            }
            return true;
        },
    };
};


export { defaultShortcuts };