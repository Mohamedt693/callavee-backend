const INGREDIENT_MESSAGES = {
    SUCCESS: {
        CREATED: "Ingredient profile created and indexed successfully.",
        FETCHED_ALL: "Ingredient directory retrieved successfully.",
        FETCHED_ONE: "Ingredient analysis and associated products retrieved.",
        UPDATED: "Ingredient technical data updated successfully.",
        DELETED: "Ingredient profile removed from the database.",
    },
    ERROR: {
        NOT_FOUND: "Ingredient profile not found in our database.",
        REQUIRED_FIELDS: "Missing essential data (name, description, and at least one function).",
        DUPLICATE: "An ingredient with this name already exists.",
        INVALID_RATING: "Invalid safety rating. Must be 'high', 'medium', 'low', or 'unknown'.",
        INVALID_SLUG: "The requested ingredient slug is invalid or broken.",
        SERVER_ERROR: "Internal server error while accessing ingredient data.",
        LINK_ERROR: "Invalid research link format provided."
    }
};

export default INGREDIENT_MESSAGES;