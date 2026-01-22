import {
    OpenNewInstance
} from "../../wailsjs/go/internal/App";

const spawnInstance = async () => {
    try {
        await OpenNewInstance();
    } catch (error) {
        console.error("Error spawning new instance:", error);
        throw error;
    }
};

export { spawnInstance };
