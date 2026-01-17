import {
    ReadBinaryFile,
    WriteBinaryFile
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

const writeBinaryFile = async (path, data) => {
    try {
        const result = await WriteBinaryFile(path, data);
        return result;
    } catch (err) {
        console.error("Failed to write binary file:", err);
        throw err;
    }
};

export { readBinaryFile, writeBinaryFile };
