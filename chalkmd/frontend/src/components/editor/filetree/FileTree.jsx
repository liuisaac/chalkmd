import FileTreeItem from "./FileTreeItem";

const FileTree = ({ files, onFileClick }) => {
    const buildFileTree = () => {
        if (!files || files.length === 0) return [];

        const normalizedFiles = files.map((file) => ({
            ...file,
            path: file.path.replace(/\\/g, "/"),
        }));

        normalizedFiles.sort((a, b) => a.path.localeCompare(b.path));

        const root = [];
        const pathMap = {};

        normalizedFiles.forEach((file) => {
            const parts = file.path.split("/").filter((p) => p);
            const fileName = parts[parts.length - 1];

            const item = {
                ...file,
                name: fileName,
                children: file.isDir ? [] : undefined,
            };

            pathMap[file.path] = item;

            if (parts.length === 1) {
                root.push(item);
            } else {
                const parentPath = parts.slice(0, -1).join("/");
                const parent = pathMap[parentPath];

                if (parent && parent.children) {
                    parent.children.push(item);
                } else {
                    root.push(item);
                }
            }
        });

        const sortItems = (items) => {
            items.sort((a, b) => {
                if (a.isDir && !b.isDir) return -1;
                if (!a.isDir && b.isDir) return 1;
                return a.name.localeCompare(b.name);
            });

            items.forEach((item) => {
                if (item.children && item.children.length > 0) {
                    sortItems(item.children);
                }
            });
        };

        sortItems(root);
        return root;
    };

    const fileTree = buildFileTree();

    if (fileTree.length === 0) {
        return (
            <div className="text-[14px] text-gray-600 px-2 py-4">
                No files found
            </div>
        );
    }
    return (
        <div className="h-full min-h-screen w-full ml-12 select-none flex flex-col">
            <div className="overflow-y-auto flex-1">
                {fileTree.map((item, index) => (
                    <FileTreeItem
                        key={item.path || index}
                        item={item}
                        onFileClick={onFileClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default FileTree;