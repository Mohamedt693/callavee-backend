export const parseDeliveryInfo = (deliveryArray) => {
    if (!deliveryArray || deliveryArray.length === 0) return null;

    const fullText = deliveryArray.join(" ").toLowerCase();

    return {
        isFreeShipping: fullText.includes("free delivery"),
        isPrime: fullText.includes("prime"),
    };
};