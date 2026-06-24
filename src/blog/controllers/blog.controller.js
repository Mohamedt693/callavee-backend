import { Blog } from '../models/blog.model.js';
import { BLOG_MESSAGES } from '../../utils/messages/blog.messages.js';
import slugify from 'slugify';

const processBlogContent = (content) => {
    const blogContent = content || '';

    const affiliatePattern = /https?:\/\/(?:www\.)?(?:amazon\.to|amazon\.com|noon\.com|travelpayouts\.com|jdoqoc\.com)/gi;
    const matches = blogContent.match(affiliatePattern);
    const affiliateLinksCount = matches ? matches.length : 0;

    const cleanText = blogContent.replace(/<\/?[^>]+(>|$)/g, '');
    const wordCount = cleanText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const readTime = Math.ceil(wordCount / 200) || 1;

    return { affiliateLinksCount, readTime, cleanText };
};

export const createBlog = async (req, res) => {
    try {
        const { 
            title, 
            content, 
            category, 
            tags, 
            relatedProducts, 
            image, 
            status, 
            isFeatured,
            seo
        } = req.body;

        const slug = slugify(title, { lower: true, strict: true, trim: true });

        const { affiliateLinksCount, readTime, cleanText } = processBlogContent(content);

        const publishedAt = status === 'published' ? new Date() : null;

        const finalSeo = {
            metaTitle: seo?.metaTitle || title,
            metaDescription: seo?.metaDescription || cleanText.substring(0, 150),
            canonicalUrl: seo?.canonicalUrl || '',
            ogImage: seo?.ogImage || image || '',
            keywords: seo?.keywords || []
        };

        const newBlog = await Blog.create({ 
            title, 
            slug, 
            content, 
            category, 
            tags, 
            relatedProducts, 
            image,
            readTime,
            status,
            isFeatured, 
            publishedAt,
            seo: finalSeo,
            affiliateLinksCount
        });

        return res.success("Blog created successfully", newBlog, 201);
    } catch (error) {
        return res.error("Failed to create blog", 500, error);
    }
};

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

export const getPostBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const blog = await Blog.findOne({ slug })
            .populate('relatedProducts', 'title images currentPrice rating amazonLink');
        
        if (!blog) return res.error("Article not found", 404);
        
        return res.success("Blog fetched successfully", blog, 200);
    } catch (error) {
        return res.error("Failed to fetch blog", 500, error);
    }
};

export const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('relatedProducts', 'title images currentPrice rating amazonLink');
            
        if (!blog) return res.error("Blog not found", 404);
        
        return res.success("Blog fetched successfully", blog, 200);
    } catch (error) {
        return res.error("Failed to fetch blog", 500, error);
    }
};

export const updateBlog = async (req, res) => {
    try {
        const { 
            title, 
            content, 
            category, 
            tags, 
            relatedProducts, 
            status, 
            isFeatured, 
            image,
            seo 
        } = req.body;
        
        const existingBlog = await Blog.findById(req.params.id);
        if (!existingBlog) return res.error("Blog not found", 404);

        const updateData = { 
            title, 
            category, 
            tags, 
            relatedProducts, 
            status, 
            isFeatured,
            image 
        };
        
        if (status === 'published' && existingBlog.status !== 'published' && !existingBlog.publishedAt) {
            updateData.publishedAt = new Date();
        }

        if (title) {
            updateData.slug = slugify(title, { lower: true, strict: true, trim: true });
        }

        let currentCleanText = '';
        if (content) {
            updateData.content = content;
            const { affiliateLinksCount, readTime, cleanText } = processBlogContent(content);
            updateData.readTime = readTime;
            updateData.affiliateLinksCount = affiliateLinksCount;
            currentCleanText = cleanText;
        } else {
            currentCleanText = existingBlog.content.replace(/<\/?[^>]+(>|$)/g, '');
        }

        if (seo || title || content || image) {
            updateData.seo = {
                metaTitle: seo?.metaTitle || updateData.title || existingBlog.seo.metaTitle || existingBlog.title,
                metaDescription: seo?.metaDescription || (content ? currentCleanText.substring(0, 150) : existingBlog.seo.metaDescription),
                canonicalUrl: seo?.canonicalUrl || existingBlog.seo.canonicalUrl || '',
                ogImage: seo?.ogImage || updateData.image || existingBlog.seo.ogImage || existingBlog.image || '',
                keywords: seo?.keywords || existingBlog.seo.keywords || []
            };
        }

        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        return res.success("Blog updated successfully", updatedBlog, 200);
    } catch (error) {
        return res.error("Failed to update blog", 500, error);
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) return res.error("Blog not found", 404);
        
        return res.success("Blog deleted successfully", null, 200);
    } catch (error) {
        return res.error("Failed to delete blog", 500, error);
    }
};