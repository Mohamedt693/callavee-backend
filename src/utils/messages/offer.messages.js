const OFFER_MESSAGES = {
    SUCCESS: {
        CREATED: "Offer added successfully to the product.",
        UPSERTED: "Offer updated or created successfully via scraper.",
        FETCHED_ALL: "Offers retrieved successfully.",
        FETCHED_ONE: "Offer details retrieved successfully.",
        UPDATED: "Offer updated successfully.",
        DELETED: "Offer deleted successfully from the system.",
    },
    ERROR: {
        NOT_FOUND: "Offer not found.",
        SERVER_ERROR: "Internal server error while processing offer data.",
        INVALID_ID: "Invalid offer or product ID provided.",
        CREATION_FAILED: "Failed to create the offer. Please check the provided data.",
    }
};

export default OFFER_MESSAGES;