import { ApiError } from '../exceptions/ApiError.js';

export const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return next(new ApiError(422, 'Validation failed', errors));
        }

        req.body = value; // Use validated/sanitized data
        next();
    };
};