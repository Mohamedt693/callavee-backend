import jwt from 'jsonwebtoken';
import AUTH_MESSAGES from '../../../utils/messages/auth.messages.js';

export const protectUser = (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        
        if (!token) {
            return res.error(AUTH_MESSAGES.ERRORS.UNAUTHORIZED, 401);
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        req.user = decoded;
        next();
    } catch (error) {
        return res.error(AUTH_MESSAGES.ERRORS.INVALID_TOKEN, 401);
    }
};