import { Plugin } from "@tiptap/pm/state";
import { DecorationSet } from "@tiptap/pm/view";
import boldHandler from "../default/Bold";
import headerHandler from "../default/Header";
import italicHandler from "../default/Italic";
import { handleImagePaste } from "./ClipboardImagePlugin";

const plugins = (editor, writeBinaryFile) => {
  console.log("PluginEntry: writeBinaryFile is", writeBinaryFile ? "defined" : "UNDEFINED");
  
  return new Plugin({
    props: {
      decorations: (state) => {
        const decorations = [];
        const { doc, selection } = state;
        const cursorPos = selection.from;

        doc.descendants((node, pos) => {
          if (node.type.name === "paragraph") {
            const text = node.textContent;
            const nodeStart = pos + 1;
            const isActive = cursorPos > pos && cursorPos < pos + node.nodeSize;

            headerHandler(text, decorations, isActive, nodeStart);
            boldHandler(text, decorations, nodeStart, cursorPos);
            italicHandler(text, decorations, nodeStart, cursorPos);
          }
        });

        return DecorationSet.create(doc, decorations);
      },

      handlePaste: handleImagePaste(writeBinaryFile),
    },
  });
};

export default plugins;