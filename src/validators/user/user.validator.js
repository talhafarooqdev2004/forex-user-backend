import Joi from 'joi';

export const createUserSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    gender: Joi.string().required(),
    password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required',
    }),

    confirmPassword: Joi.string()
        .required()
        .valid(Joi.ref('password'))
        .messages({
            'any.only': 'Confirm password must match password',
            'any.required': 'Confirm password is required',
        }),
});

export const UserLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
        // ✅ Add a minimum length that matches your registration criteria
        .min(6) // Assuming your passwords must be at least 6 characters
        .required()
        .messages({
            'any.required': 'Password is required',
            'string.min': 'Password must be at least 6 characters long',
        }),
});

export const updateUserSchema = Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    gender: Joi.string().valid('male', 'female', 'other').allow(null, ''),
    phone: Joi.string().max(20).allow(null, ''),
    // Allow both URLs and base64 data URLs (data:image/...)
    // Base64 images can be quite long, so we allow up to 2MB of base64 data (~1.5MB actual image)
    image: Joi.alternatives().try(
        Joi.string().uri().max(2000), // Regular URLs (e.g., Google profile images)
        Joi.string().pattern(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/).max(2000000) // Base64 data URLs (up to ~2MB)
    ).allow(null, '')
}).min(1);