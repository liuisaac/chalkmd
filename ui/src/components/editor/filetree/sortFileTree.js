export const sortItems = (items, sortType = 'name-asc') => {
    items.sort((a, b) => {
        if (a.isDir && !b.isDir) return -1;
        if (!a.isDir && b.isDir) return 1;

        if (sortType.startsWith('name-')) {
            const nameA = a.name;
            const nameB = b.name;

            const parse = (name) => {
                if (!name || typeof name !== 'string') {
                    return { name: name || 'Unknown', number: 0 };
                }
                const match = name.match(/^(.+?)( \d+)?(\.\w+)?$/);
                if (match) {
                    return {
                        base: match[1],
                        num: match[2] ? parseInt(match[2].trim()) : null,
                        ext: match[3] || ''
                    };
                }
                return { base: name, num: null, ext: '' };
            };

            const parsedA = parse(nameA);
            const parsedB = parse(nameB);

            if (parsedA.base === parsedB.base && parsedA.ext === parsedB.ext) {
                if (parsedA.num === null && parsedB.num !== null) return -1;
                if (parsedA.num !== null && parsedB.num === null) return 1;
                if (parsedA.num !== null && parsedB.num !== null) {
                    return sortType === 'name-asc' ? parsedA.num - parsedB.num : parsedB.num - parsedA.num;
                }
            }

            const comparison = nameA.localeCompare(nameB, undefined, {
                numeric: true,
                sensitivity: 'base'
            });
            return sortType === 'name-asc' ? comparison : -comparison;
        } else if (sortType.startsWith('created-')) {
            const comparison = a.created - b.created;
            return sortType === 'created-asc' ? comparison : -comparison;
        } else if (sortType.startsWith('modified-')) {
            const comparison = a.modified - b.modified;
            return sortType === 'modified-asc' ? comparison : -comparison;
        }

        return 0;
    });

    items.forEach((item) => {
        if (item.children && item.children.length > 0) {
            sortItems(item.children, sortType);
        }
    });

    return items;
};