import jwt from 'jsonwebtoken';
import AUTH_MESSAGES from '../utils/messages/auth.messages.js';

export const protectAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.error(AUTH_MESSAGES.ERRORS.UNAUTHORIZED, 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decoded;
        next();
    } catch (error) {
        return res.error(AUTH_MESSAGES.ERRORS.INVALID_TOKEN, 401);
    }
};