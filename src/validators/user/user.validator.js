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
    name: Joi.string().min(2).max(100),
    email: Joi.string().email()
}).min(1);