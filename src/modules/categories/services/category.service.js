
export const calculateTotal = (catId, allCats) => {
    return allCats
        .filter((c) => c.path.includes(`,${catId},`) || String(c._id) === String(catId))
        .reduce((sum, c) => sum + (c.directCount || 0), 0);
};

export const buildTree = (items, parentId = null, calculateTotalFn) => {
    return items
        .filter((item) => String(item.parent || "") === String(parentId || ""))
        .map((item) => ({
            ...item,
            totalProducts: calculateTotalFn(item._id, items),
            children: buildTree(items, item._id, calculateTotalFn),
        }));
};