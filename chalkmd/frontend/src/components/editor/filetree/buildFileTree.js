    
    
    export const buildFileTree = (files) => {
        if (!files || files.length === 0) return [];

        const normalizedFiles = files.map((file) => ({
            ...file,
            path: file.path.replace(/\\/g, "/"),
        }));

        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

        normalizedFiles.sort((a, b) => collator.compare(a.path, b.path));

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
                return a.name.localeCompare(b.name, undefined, { 
                    numeric: true, 
                    sensitivity: 'base' 
                });
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