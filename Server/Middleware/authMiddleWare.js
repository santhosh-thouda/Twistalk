import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_KEY;

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (token) {
            const decoded = jwt.verify(token, secret);
            req.user = { id: decoded?.id };
        } else {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: 'Token is not valid' });
    }
};

// For backward compatibility (if used elsewhere)
export default verifyToken;