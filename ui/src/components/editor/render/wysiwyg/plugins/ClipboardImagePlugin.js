import settings from "../../../../../../../settings.json";

const IMAGES_FOLDER = settings.imageFolder || "";

function generateImageFilename(extension = "png") {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `pasted-image-${timestamp}-${random}.${extension}`;
}

async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(",")[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export const handleImagePaste = (writeBinaryFile) => {
    return (view, event, slice) => {
        console.log("handlePaste triggered!");
        
        const items = event.clipboardData?.items;
        if (!items) {
            console.log("No clipboard items");
            return false;
        }

        console.log("Clipboard items:", items.length);

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            console.log("Item type:", item.type);
            
            if (item.type.indexOf("image") === 0) {
                console.log("Image detected!");
                event.preventDefault();
                
                const blob = item.getAsFile();
                if (!blob) {
                    console.log("Failed to get blob");
                    continue;
                }

                console.log("Blob obtained:", blob.type, blob.size);

                let extension = "png";
                if (item.type === "image/jpeg") extension = "jpg";
                else if (item.type === "image/gif") extension = "gif";
                else if (item.type === "image/webp") extension = "webp";

                const filename = generateImageFilename(extension);
                const fullPath = `${IMAGES_FOLDER}${filename}`;

                console.log("Will save to:", fullPath);

                if (!writeBinaryFile) {
                    console.error("writeBinaryFile is not defined!");
                    return true;
                }

                blobToBase64(blob)
                    .then(async (base64Data) => {
                        console.log("Base64 conversion successful, length:", base64Data.length);
                        
                        try {
                            await writeBinaryFile(fullPath, base64Data);
                            console.log("Image saved successfully!");
                            
                            const { state, dispatch } = view;
                            const { selection } = state;
                            const imageLink = `![[${filename}]]`;
                            
                            const tr = state.tr.insertText(
                                imageLink,
                                selection.from,
                                selection.to
                            );
                            
                            dispatch(tr);
                            console.log("Image link inserted!");
                        } catch (error) {
                            console.error("Failed to save pasted image:", error);
                        }
                    })
                    .catch((error) => {
                        console.error("Failed to convert image:", error);
                    });

                return true;
            }
        }

        return false;
    };
};