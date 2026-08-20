import { OAuth2Client } from 'google-auth-library';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import User from "../models/user.model.js";
import Subscriber from "../../subsciptions/models/subscription.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { sendVerificationEmail } from "../../../services/email.service.js";
import { USER_MESSAGES } from '../../../utils/messages/user.messages.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configuration for cookies
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
};

const createUser = async (req, res) => {
    try {
        const { displayName, email, password, isSubscribed } = req.body;

        const isUserExists = await User.findOne({ email });
        if (isUserExists) return res.error(USER_MESSAGES.ERRORS.USER_EXISTS, 400);

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        const newUser = await User.create({
            displayName,
            email,
            password: hashedPassword,
            otp,
            otpExpires,
            isVerified: false,
            isSubscribed: isSubscribed ?? true
        });

        if (newUser.isSubscribed) {
            await Subscriber.create({ email });
        }

        try {
            await sendVerificationEmail(email, otp);
        } catch (emailError) {
            await User.findByIdAndDelete(newUser._id);
            await Subscriber.findOneAndDelete({ email });
            return res.error(USER_MESSAGES.ERRORS.EMAIL_SEND_FAILED, 500);
        }

        return res.success(USER_MESSAGES.SUCCESS.REGISTERED, { userId: newUser._id }, 201);
    } catch (error) {
        return res.error(USER_MESSAGES.ERRORS.REGISTRATION_SERVER_ERROR, 500, error);
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email }).select('+otp +otpExpires');

        if (!user) return res.error(USER_MESSAGES.ERRORS.USER_NOT_FOUND, 404);

        const storedOtp = String(user.otp || "").trim();
        const receivedOtp = String(otp || "").trim();

        if (storedOtp !== receivedOtp || user.otpExpires < Date.now()) {
            return res.error(USER_MESSAGES.ERRORS.INVALID_OTP, 400);
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
        res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return res.success(USER_MESSAGES.SUCCESS.EMAIL_VERIFIED, {
            user: { id: user._id, displayName: user.displayName, email: user.email, avatar: user.avatar }
        });
    } catch (error) {
        return res.error(USER_MESSAGES.ERRORS.VERIFICATION_FAILED, 500, error);
    }
};

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.error(USER_MESSAGES.ERRORS.USER_NOT_FOUND, 404);
        if (user.isVerified) return res.error(USER_MESSAGES.ERRORS.ALREADY_VERIFIED, 400);

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = newOtp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendVerificationEmail(email, newOtp);
        return res.success(USER_MESSAGES.SUCCESS.OTP_RESENT);
    } catch (error) {
        return res.error(USER_MESSAGES.ERRORS.RESEND_OTP_FAILED, 500, error);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");
        if (!user || !user.isVerified || !(await bcrypt.compare(password, user.password))) {
            return res.error(USER_MESSAGES.ERRORS.INVALID_CREDENTIALS, 401);
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
        res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return res.success(USER_MESSAGES.SUCCESS.LOGIN_SUCCESS, {
            user: { id: user._id, displayName: user.displayName, email: user.email, avatar: user.avatar }
        });
    } catch (error) {
        return res.error(USER_MESSAGES.ERRORS.LOGIN_SERVER_ERROR, 500, error);
    }
};

const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.error(USER_MESSAGES.ERRORS.REFRESH_TOKEN_MISSING, 401);

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.error(USER_MESSAGES.ERRORS.USER_NOT_FOUND, 404);

        const newAccessToken = generateAccessToken(user._id);

        res.cookie("accessToken", newAccessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
        return res.success(USER_MESSAGES.SUCCESS.TOKEN_REFRESHED);
    } catch (error) {
        return res.error(USER_MESSAGES.ERRORS.INVALID_REFRESH_TOKEN, 403);
    }
};

const logout = async (req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.success(USER_MESSAGES.SUCCESS.LOGOUT_SUCCESS);
};

const googleAuth = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.error(USER_MESSAGES.ERRORS.GOOGLE_TOKEN_MISSING, 400);

        const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
        const { email, name, picture, sub: googleId, email_verified } = ticket.getPayload();

        if (!email_verified) return res.error(USER_MESSAGES.ERRORS.GOOGLE_NOT_VERIFIED, 403);

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({ email, displayName: name, avatar: picture, googleId, isVerified: true });
            await Subscriber.create({ email });
        } else if (!user.googleId) {
            user.googleId = googleId;
            if (picture && !user.avatar) user.avatar = picture;
            await user.save();
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
        res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return res.success(USER_MESSAGES.SUCCESS.GOOGLE_AUTH, {
            user: { id: user._id, displayName: user.displayName, email: user.email, avatar: user.avatar }
        });
    } catch (error) {
        return res.error(`${USER_MESSAGES.ERRORS.GOOGLE_AUTH_FAILED}: ${error.message}`, 401);
    }
};

const updateProfile = async (req, res) => {
    try {
        const { displayName, profile, isSubscribed } = req.body;
        const allowedProfileFields = ['country', 'skinType', 'skinSensitivity', 'skinTone', 'priceRange'];
        const updateFields = {};

        if (displayName) updateFields.displayName = displayName;
        if (isSubscribed !== undefined) updateFields.isSubscribed = isSubscribed;

        if (profile && typeof profile === 'object') {
            allowedProfileFields.forEach(key => {
                if (profile[key] !== undefined) updateFields[`profile.${key}`] = profile[key];
            });
        }

        const user = await User.findByIdAndUpdate(req.user.id, { $set: updateFields }, { new: true, runValidators: true }).select("-password");

        if (!user) return res.error(USER_MESSAGES.ERRORS.USER_NOT_FOUND, 404);

        if (user.isSubscribed) {
            await Subscriber.updateOne({ email: user.email }, { $set: { email: user.email } }, { upsert: true });
        } else {
            await Subscriber.deleteOne({ email: user.email });
        }

        return res.success(USER_MESSAGES.SUCCESS.PROFILE_UPDATED, { user });
    } catch (error) {
        return res.error(USER_MESSAGES.ERRORS.UPDATE_SERVER_ERROR, 500, error);
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({ path: "wishlist", select: "title images slug review.summary rating", populate: { path: "offers", select: "link", options: { limit: 1 } } })
            .populate("avoidList", "name slug");

        if (!user) return res.error(USER_MESSAGES.ERRORS.USER_NOT_FOUND, 404);
        return res.success(USER_MESSAGES.SUCCESS.PROFILE_RETRIEVED, { user });
    } catch (error) {
        return res.error(USER_MESSAGES.ERRORS.SERVER_ERROR, 500, error);
    }
};

const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findOne({ _id: req.user.id, wishlist: productId });
        const update = user ? { $pull: { wishlist: productId } } : { $addToSet: { wishlist: productId } };

        const updatedUser = await User.findByIdAndUpdate(req.user.id, update, { new: true })
            .populate({ path: "wishlist", select: "title images slug review.summary rating", populate: { path: "offers", select: "link", options: { limit: 1 } } });

        return res.success(USER_MESSAGES.SUCCESS.WISHLIST_UPDATED, { wishlist: updatedUser.wishlist });
    } catch (error) {
        return res.error(USER_MESSAGES.ERRORS.SERVER_ERROR, 500, error);
    }
};

const toggleAvoidList = async (req, res) => {
    try {
        const { ingredientId } = req.body;
        const user = await User.findOne({ _id: req.user.id, avoidList: ingredientId });
        const update = user ? { $pull: { avoidList: ingredientId } } : { $addToSet: { avoidList: ingredientId } };

        const updatedUser = await User.findByIdAndUpdate(req.user.id, update, { new: true }).populate("avoidList", "name slug");

        return res.success(USER_MESSAGES.SUCCESS.AVOID_LIST_UPDATED, { avoidList: updatedUser.avoidList });
    } catch (error) {
        return res.error(USER_MESSAGES.ERRORS.SERVER_ERROR, 500, error);
    }
};

const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({ 
                path: "wishlist", 
                select: "title images slug review.summary rating", 
                populate: { path: "offers", select: "link", options: { limit: 1 } } 
            });

        if (!user) return res.error(USER_MESSAGES.ERRORS.USER_NOT_FOUND, 404);
        return res.success(USER_MESSAGES.SUCCESS.WISHLIST_RETRIEVED, { wishlist: user.wishlist });
    } catch (error) {
        return res.error(USER_MESSAGES.ERRORS.SERVER_ERROR, 500, error);
    }
};

const getAvoidList = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate("avoidList", "name slug");

        if (!user) return res.error(USER_MESSAGES.ERRORS.USER_NOT_FOUND, 404);
        return res.success(USER_MESSAGES.SUCCESS.AVOID_LIST_RETRIEVED, { avoidList: user.avoidList });
    } catch (error) {
        return res.error(USER_MESSAGES.ERRORS.SERVER_ERROR, 500, error);
    }
};

const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, country, skinType, skinTone, priceRange } = req.query;
        const filter = {};

        if (search) filter.displayName = { $regex: search, $options: "i" };
        if (country) filter["profile.country"] = country;
        if (skinType) filter["profile.skinType"] = skinType;
        if (skinTone) filter["profile.skinTone"] = skinTone;
        if (priceRange) filter["profile.priceRange"] = priceRange;

        const users = await User.find(filter).select("-password -otp -otpExpires").populate("wishlist", "title price").populate("avoidList", "name").limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 });
        const total = await User.countDocuments(filter);

        return res.success(USER_MESSAGES.SUCCESS.USERS_RETRIEVED, { users, totalPages: Math.ceil(total / limit), currentPage: Number(page), totalUsers: total });
    } catch (error) {
        return res.error(USER_MESSAGES.ERRORS.FETCH_USERS_ERROR, 500, error);
    }
};

export {
    createUser, verifyOtp, resendOtp, login, logout, googleAuth,
    updateProfile, getUserProfile, toggleWishlist, toggleAvoidList, getAllUsers, refresh, getWishlist,
    getAvoidList
};