import Joi from 'joi';

export const createEnrollmentSchema = Joi.object({
    courseId: Joi.string().uuid().required().messages({
        'string.guid': 'Invalid Course ID format.',
        'any.required': 'Course ID is required.'
    })
});

export const updateEnrollmentStatusSchema = Joi.object({
    status: Joi.string().valid('ACTIVE', 'COMPLETED', 'DROPPED').required().messages({
        'any.only': 'Status must be ACTIVE, COMPLETED, or DROPPED.',
        'any.required': 'Status is required.'
    })
});
