import Joi from 'joi';

export const registerSchema = Joi.object({
    username: Joi.string().min(3).max(50).required().messages({
        'string.min': 'Username must be at least 3 characters.',
        'any.required': 'Username is required.'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'A valid email is required.',
        'any.required': 'Email is required.'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters.',
        'any.required': 'Password is required.'
    }),
    role: Joi.string().valid('STUDENT', 'INSTRUCTOR').optional().messages({
        'any.only': 'Role must be either STUDENT or INSTRUCTOR.'
    })
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'A valid email is required.',
        'any.required': 'Email is required.'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required.'
    })
});
