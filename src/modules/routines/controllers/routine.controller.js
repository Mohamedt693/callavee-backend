import Routine from "../models/routine.model.js";



export const saveRoutine = async (req, res) => {
    try {
        const { products } = req.body; 
        
        const routine = await Routine.findOneAndUpdate(
            { userId: req.user.id },
            { products: products || [] },
            { new: true, upsert: true, runValidators: true }
        );

        return res.success("Routine updated successfully", routine, 200);
    } catch (error) {
        return res.error("Server error", 500, error);
    }
};



export const getMyRoutine = async (req, res) => {
    try {
        const routine = await Routine.findOne({ userId: req.user.id })
            .populate('products.productId'); 
        
        if (!routine) {
            return res.error("No routine found", 404);
        }
        
        return res.success("Routine retrieved successfully", routine, 200);
    } catch (error) {
        return res.error("Server error while fetching routine", 500, error);
    }
};


export const deleteRoutine = async (req, res) => {
    try {
        const routine = await Routine.findOneAndDelete({ userId: req.user.id });
        
        if (!routine) return res.error("No routine to delete", 404);
        
        return res.success("Routine deleted successfully", null, 200);
    } catch (error) {
        return res.error("Server error while deleting routine", 500, error);
    }
};


export const getDashboardAnalytics = async (req, res) => {
    try {
        const productStats = await Routine.aggregate([
            { $unwind: "$products" },
            { $group: { _id: "$products.productId", count: { $sum: 1 } } },
            { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "productDetails" } },
            { $unwind: "$productDetails" },
            { 
                $project: { 
                    name: "$productDetails.title", 
                    brand: "$productDetails.brand", 
                    count: 1 
                } 
            },
            { $sort: { count: -1 } },
            { $limit: 10 } 
        ]);

        return res.success("Analytics retrieved successfully", productStats, 200);
    } catch (error) {
        return res.error("Error generating analytics", 500, error);
    }
};