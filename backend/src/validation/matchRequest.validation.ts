import Joi from 'joi';

export const createMatchRequestSchema = Joi.object({
    instructorId: Joi.string().uuid().required().messages({
        'string.guid': 'Invalid Instructor ID format.',
        'any.required': 'Instructor ID is required.'
    }),
    majorId: Joi.string().uuid().allow(null).optional().messages({
        'string.guid': 'Invalid Major ID format.'
    }),
    message: Joi.string().max(1000).allow('', null).optional().messages({
        'string.max': 'Message cannot exceed 1000 characters.'
    })
});

export const updateMatchRequestStatusSchema = Joi.object({
    status: Joi.string().valid('ACCEPTED', 'REJECTED', 'COMPLETED').required().messages({
        'any.only': 'Status must be ACCEPTED, REJECTED, or COMPLETED.',
        'any.required': 'Status is required.'
    })
});
