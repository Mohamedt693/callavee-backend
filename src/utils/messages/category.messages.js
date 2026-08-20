export const CATEGORY_MESSAGES = {
    SUCCESS: {
        CREATED: "Category created successfully",
        UPDATED: "Category updated successfully",
        DELETED: "Category deleted successfully",
        RETRIEVED: "Categories retrieved successfully"
    },
    ERRORS: {
        HAS_CHILDREN: "Cannot delete: Category has sub-categories",
        IS_USED_IN_PRODUCTS: "Cannot delete: This category is assigned to one or more products",
        NOT_FOUND: "Category not found",
        FAILED_TO_CREATE: "Failed to create category",
        FAILED_TO_UPDATE: "Failed to update category",
        FAILED_TO_DELETE: "Failed to delete category",
        FAILED_TO_FETCH: "Failed to fetch categories"
    }
};

export default CATEGORY_MESSAGES;