import express from 'express';
import { 
    createUser, verifyOtp, resendOtp, login, logout, googleAuth, refresh,
    updateProfile, getUserProfile, toggleWishlist, toggleAvoidList, getAllUsers, getWishlist, getAvoidList
} from '../controllers/user.controller.js'; 
import { protectUser } from '../middlewares/user.middleware.js'; 
import { protectAdmin } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/register", createUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google-auth", googleAuth);
router.post("/refresh", refresh);

router.get("/profile", protectUser, getUserProfile);
router.put("/update-profile", protectUser, updateProfile);
router.post("/wishlist/toggle", protectUser, toggleWishlist);
router.post("/avoidlist/toggle", protectUser, toggleAvoidList);
router.get("/wishlist", protectUser, getWishlist);
router.get("/avoidlist", protectUser, getAvoidList);

router.get("/", protectAdmin, getAllUsers);

export default router;