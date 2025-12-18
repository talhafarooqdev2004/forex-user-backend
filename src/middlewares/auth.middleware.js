import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { ApiError } from '../exceptions/ApiError.js';

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            throw new ApiError(401, 'Authentication token required');
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        req.user = decoded; // Attach user to request
        next();
    } catch (error) {
        next(new ApiError(401, 'Invalid or expired token'));
    }
};

// Check specific permissions
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, 'Insufficient permissions'));
        }
        next();
    };
};