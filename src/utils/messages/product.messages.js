const PRODUCT_MESSAGES = {
  SUCCESS: {
    CREATED: "Product added successfully to Lily Closet database!",
    FETCHED_ALL: "All products retrieved successfully.",
    FETCHED_ONE: "Product details retrieved successfully.",
    UPDATED: "Product updated successfully.",
    DELETED: "Product deleted successfully from the system.",
    AVAILABILITY_TOGGLED: "Store availability updated successfully."
  },
  ERROR: {
    NOT_FOUND: "Product or store not found.",
    REQUIRED_FIELDS: "Missing required fields (title, brand, features, categories, skinType, and at least one store data).",
    INVALID_BUDGET: "Invalid budget category. Must be 'economy', 'mid-range', or 'premium'.",
    SERVER_ERROR: "Internal server error while processing product data.",
    INVALID_ID: "Invalid product or store ID provided."
  }
};

export default PRODUCT_MESSAGES;