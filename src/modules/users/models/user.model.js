import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false }, 
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    
    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    
    isSubscribed: { type: Boolean, default: true },
    
    profile: {
        country: { type: String },
        skinType: { 
            type: String, 
            enum: ['oily', 'dry', 'combination', 'sensitive', 'normal'] 
        },
        skinSensitivity: { 
            type: String, 
            enum: ['low', 'medium', 'high'] 
        },
        skinTone: { 
            type: String, 
            enum: ['very-light', 'light', 'medium', 'olive', 'brown', 'dark']
        },
        priceRange: { 
            type: String, 
            enum: ['1-25', '25-50', '50-100+'] 
        }
    },
    
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    avoidList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }],
    lastLogin: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('User', userSchema);