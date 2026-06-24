import { generateToken } from '../../utils/functions/generateToken.js';
import AUTH_MESSAGES from '../../utils/messages/auth.messages.js';

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
            return res.error(AUTH_MESSAGES.ERRORS.INVALID_CREDENTIALS, 401);
        }

        const token = generateToken({ role: 'admin' });

        return res.success(AUTH_MESSAGES.SUCCESS.LOGIN, { token });

    } catch (error) {
        console.error("Login Error:", error);
        return res.error(AUTH_MESSAGES.ERRORS.SERVER_ERROR, 500, error);
    }
};