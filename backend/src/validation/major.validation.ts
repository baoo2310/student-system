import Joi from 'joi';

export const majorSchema = Joi.object({
    name: Joi.string().max(100).required().messages({
        'any.required': 'Major name is required.',
        'string.max': 'Major name cannot exceed 100 characters.'
    }),
    description: Joi.string().allow('', null).optional()
});

export const userMajorSchema = Joi.object({
    majorId: Joi.string().uuid().required().messages({
        'string.guid': 'Invalid Major ID format.',
        'any.required': 'Major ID is required.'
    })
});

export const updateUserMajorsSchema = Joi.object({
    majorIds: Joi.array().items(Joi.string().uuid().messages({
        'string.guid': 'Each Major ID must be a valid UUID.'
    })).required().messages({
        'any.required': 'An array of major IDs is required.'
    })
});
