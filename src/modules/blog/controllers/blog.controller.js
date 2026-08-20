import Blog  from '../models/blog.model.js';
import { BLOG_MESSAGES } from '../../../utils/messages/blog.messages.js';
import slugify from 'slugify';

const processBlogContent = (content) => {
    const blogContent = content || '';

    const affiliateDomains = [
        'amazon.com', 
        'noon.com', 
        'ulta.com', 
        'target.com', 
        'sephora.com',
        'iherb.com', 
        'lookfantastic.com'
    ];

    const affiliatePattern = new RegExp(`https?://(?:www\\.)?(?:${affiliateDomains.join('|').replace(/\./g, '\\.')})`, 'gi');    const matches = blogContent.match(affiliatePattern);
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


export const updateBlog = async (req, res) => {
    try {
        const { title, content, category, tags, relatedProducts, status, isFeatured, image, seo } = req.body;
        
        const existingBlog = await Blog.findById(req.params.id);
        if (!existingBlog) return res.error("Blog not found", 404);

        const updateData = { title, category, tags, relatedProducts, status, isFeatured, image };
        
        if (title && title !== existingBlog.title) {
            const newSlug = slugify(title, { lower: true, strict: true, trim: true });
            const existingSlug = await Blog.findOne({ slug: newSlug, _id: { $ne: req.params.id } });
            if (existingSlug) return res.error("Slug already exists", 400);
            updateData.slug = newSlug;
        }

        if (status === 'published' && existingBlog.status !== 'published') {
            updateData.publishedAt = new Date();
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

        updateData.seo = {
            metaTitle: seo?.metaTitle || title || existingBlog.seo.metaTitle,
            metaDescription: seo?.metaDescription || (content ? currentCleanText.substring(0, 150) : existingBlog.seo.metaDescription),
            canonicalUrl: seo?.canonicalUrl || existingBlog.seo.canonicalUrl || '',
            ogImage: seo?.ogImage || image || existingBlog.seo.ogImage || '',
            keywords: seo?.keywords || existingBlog.seo.keywords || []
        };

        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after', runValidators: true });
        
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