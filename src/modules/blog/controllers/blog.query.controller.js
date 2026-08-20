import Blog from '../models/blog.model.js';
import { BLOG_MESSAGES } from '../../../utils/messages/blog.messages.js';



export const getBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { category, status, search } = req.query;
        let filterQuery = {};

        if (search) {
            filterQuery.$or = [
                { title: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) filterQuery.category = category;
        if (status) filterQuery.status = status;

        const total = await Blog.countDocuments(filterQuery);
        
        const blogs = await Blog.find(filterQuery)
            .sort({ isFeatured: -1, createdAt: -1 }) 
            .skip(skip)
            .limit(limit);

        return res.success(BLOG_MESSAGES.SUCCESS.FETCHED, {
            blogs,
            pagination: { 
                total, 
                page, 
                pages: Math.ceil(total / limit),
                limit 
            }
        }, 200);

    } catch (error) {
        return res.error(BLOG_MESSAGES.ERROR.FETCH_FAILED, 500, error);
    }
};

export const getPublicBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { category, search } = req.query;
        let filterQuery = { status: 'published' };

        if (search) {
            filterQuery.$or = [
                { title: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) filterQuery.category = category;

        const total = await Blog.countDocuments(filterQuery);
        
        const blogs = await Blog.find(filterQuery)
            .sort({ isFeatured: -1, createdAt: -1 }) 
            .skip(skip)
            .limit(limit);

        return res.success(BLOG_MESSAGES.SUCCESS.FETCHED, {
            blogs,
            pagination: { 
                total, 
                page, 
                pages: Math.ceil(total / limit),
                limit 
            }
        }, 200);

    } catch (error) {
        return res.error(BLOG_MESSAGES.ERROR.FETCH_FAILED, 500, error);
    }
};

export const getPostBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const blog = await Blog.findOneAndUpdate(
            { slug },
            { $inc: { viewsCount: 1 } },
            { new: true }
        ).populate({
            path: 'relatedProducts',
            select: 'title slug images review rating',
            populate: {
                path: 'offers', 
                model: 'Offer',
                select: 'link price store size packageQuantity',
                populate: {
                    path: 'store',
                    model: 'Store',
                    select: 'name slug logo baseUrl'
                }
            }
        });
        
        if (!blog) return res.error("Article not found", 404);
        
        return res.success("Blog fetched successfully", blog, 200);
    } catch (error) {
        return res.error("Failed to fetch blog", 500, error);
    }
};

export const getPostById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate({
                path: 'relatedProducts',
                select: 'title images currentPrice rating amazonLink',
                populate: {
                    path: 'offers',
                    model: 'Offer',
                    select: 'link price store size packageQuantity',
                    populate: {
                        path: 'store',
                        model: 'Store',
                        select: 'name slug logo baseUrl'
                    }
                }
            });
            
        if (!blog) return res.error("Blog not found", 404);
        
        return res.success("Blog fetched successfully", blog, 200);
    } catch (error) {
        return res.error("Failed to fetch blog", 500, error);
    }
};