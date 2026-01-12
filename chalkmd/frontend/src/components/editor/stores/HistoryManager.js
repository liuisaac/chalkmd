export const HistoryManager = {
    storage: new Map(),

    saveHistory(path, editor) {
        if (!path || !editor || editor.isDestroyed || !editor.view) return;
        
        try {
            this.storage.set(path, {
                json: editor.getJSON(),
                selection: editor.state.selection.toJSON(),
                scroll: editor.view.dom ? editor.view.dom.scrollTop : 0,
            });
        } catch (e) {
            console.warn("Failed to save history:", e);
        }
    },

    getHistory(path) {
        return this.storage.get(path);
    }
};