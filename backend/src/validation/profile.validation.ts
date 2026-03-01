import Joi from 'joi';

export const profileUpdateSchema = Joi.object({
    bio: Joi.string().allow('', null).optional(),
    hourlyRate: Joi.number().min(0).precision(2).allow(null).optional().messages({
        'number.base': 'Hourly rate must be a valid number.',
        'number.min': 'Hourly rate cannot be negative.'
    }),
    avatarUrl: Joi.string().uri().allow('', null).optional().messages({
        'string.uri': 'Avatar URL must be a valid URI.'
    })
});
