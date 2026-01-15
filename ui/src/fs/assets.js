import {
    ReadBinaryFile,
} from "../../wailsjs/go/internal/App";

const readBinaryFile = async (path) => {
    try {
        const result = await ReadBinaryFile(path);
        return result;
    } catch (err) {
        console.error("Failed to read binary file:", err);
        throw err;
    }
};

export { readBinaryFile };
