import { Extension } from '@tiptap/core';

const ClearHistoryExtension = Extension.create({
    name: 'clearHistoryExtension',
    addCommands() {
        return {
            clearHistory: () => ({ state, dispatch }) => {
                const historyPlugin = state.plugins.find(p => p.spec.key && p.spec.key.key === 'history$');
                if (dispatch && historyPlugin) {
                     return true;
                }
                return false;
            }
        };
    }
});

export default ClearHistoryExtension;