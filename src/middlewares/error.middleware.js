import { ApiError } from '../exceptions/ApiError.js';
import { logger } from '../utils/logger.util.js';
import { errorResponse } from '../utils/response.util.js';

export const errorMiddleware = (err, req, res, next) => {
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url
    });

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json(
            errorResponse(err.message, err.errors)
        );
    }

    // Unknown errors
    return res.status(500).json(
        errorResponse('Internal server error')
    );
};