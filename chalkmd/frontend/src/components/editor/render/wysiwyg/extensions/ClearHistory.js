import { Extension } from '@tiptap/core';

const ClearHistoryExtension = Extension.create({
    name: 'clearHistoryExtension',
    addCommands() {
        return {
            clearHistory: () => ({ state, dispatch }) => {
                // This is a common way to signal a history reset, 
                // though usually requires re-initializing the plugin state.
                // With the Key-based isolation, this is mostly a fallback.
                const historyPlugin = state.plugins.find(p => p.spec.key && p.spec.key.key === 'history$');
                if (dispatch && historyPlugin) {
                     // Standard ProseMirror history doesn't easily support 'clear'.
                     // The best way is creating a fresh state, which our React Key approach does.
                     return true;
                }
                return false;
            }
        };
    }
});

export default ClearHistoryExtension;