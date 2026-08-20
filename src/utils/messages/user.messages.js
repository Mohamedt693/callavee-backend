export const USER_MESSAGES = {
    SUCCESS: {
        REGISTERED: "Registered. Please check your email for the OTP.",
        EMAIL_VERIFIED: "Email verified and logged in successfully",
        OTP_RESENT: "New OTP sent to your email",
        LOGIN_SUCCESS: "Login successful",
        TOKEN_REFRESHED: "Token refreshed successfully",
        LOGOUT_SUCCESS: "Logged out successfully",
        GOOGLE_AUTH: "Google auth successful",
        PROFILE_UPDATED: "Profile updated successfully",
        PROFILE_RETRIEVED: "User data retrieved",
        WISHLIST_UPDATED: "Wishlist updated",
        AVOID_LIST_UPDATED: "Avoid List updated",
        WISHLIST_RETRIEVED: "Wishlist retrieved",
        AVOID_LIST_RETRIEVED: "Avoid List retrieved",
        USERS_RETRIEVED: "Users retrieved successfully"
    },
    ERRORS: {
        USER_EXISTS: "User already exists",
        EMAIL_SEND_FAILED: "Failed to send verification email, please try again",
        REGISTRATION_SERVER_ERROR: "Server error during registration",
        USER_NOT_FOUND: "User not found",
        INVALID_OTP: "Invalid or expired OTP",
        VERIFICATION_FAILED: "Verification failed",
        ALREADY_VERIFIED: "User already verified",
        RESEND_OTP_FAILED: "Failed to resend OTP",
        INVALID_CREDENTIALS: "Invalid credentials or not verified",
        LOGIN_SERVER_ERROR: "Server error during login",
        REFRESH_TOKEN_MISSING: "Refresh token missing",
        INVALID_REFRESH_TOKEN: "Invalid or expired refresh token",
        GOOGLE_TOKEN_MISSING: "No token provided",
        GOOGLE_NOT_VERIFIED: "Google account not verified",
        GOOGLE_AUTH_FAILED: "Google auth failed",
        UPDATE_SERVER_ERROR: "Server error during update",
        SERVER_ERROR: "Server error",
        FETCH_USERS_ERROR: "Server error fetching users"
    }
};

export default USER_MESSAGES;