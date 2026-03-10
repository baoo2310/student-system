import Joi from 'joi';

export const createReviewSchema = Joi.object({
    courseId: Joi.string().uuid().required().messages({
        'string.guid': 'Course ID must be a valid UUID.',
        'any.required': 'Course ID is required.'
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
        'number.min': 'Rating must be at least 1.',
        'number.max': 'Rating must be at most 5.',
        'number.integer': 'Rating must be a whole number.',
        'any.required': 'Rating is required.'
    }),
    comment: Joi.string().max(1000).allow('', null).optional().messages({
        'string.max': 'Comment must be at most 1000 characters.'
    })
});
