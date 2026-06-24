
export const extractVersions = (variations) => {
    if (!variations || !Array.isArray(variations)) return [];
    
    return variations.map(v => ({
        size: v.size,
        price: v.price,
        currency: v.currency
    }));
};