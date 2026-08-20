import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    content: { type: String, required: true },
    
    author: { 
        type: String, 
        default: 'Admin' 
    },
    
    category: { 
        type: String, 
        required: true,
        enum: [
            'Routine', 
            'Skin-Concerns', 
            'Ingredients', 
            'Product-Reviews', 
            'Tips', 
            'Guides', 
            'Trends', 
            'Before-After', 
            'Q&A'
        ]
    }, 
    tags: [{ type: String }],

    relatedProducts: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' 
    }],
    
    image: { type: String },
    readTime: { type: Number, default: 0 }, 
    
    status: { 
        type: String, 
        enum: ['draft', 'published', 'archived'], 
        default: 'draft' 
    },
    
    isFeatured: { type: Boolean, default: false },
    publishedAt: { type: Date },

    seo: {
        metaTitle: { type: String },
        metaDescription: { type: String },
        canonicalUrl: { type: String },
        ogImage: { type: String },
        keywords: [{ type: String }]
    },
    
    affiliateLinksCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 }
}, { timestamps: true });

blogSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });


export default mongoose.model('Blog', blogSchema);
