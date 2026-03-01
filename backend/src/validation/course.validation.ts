import Joi from 'joi';

export const createCourseSchema = Joi.object({
    title: Joi.string().max(255).required().messages({
        'string.max': 'Title cannot exceed 255 characters.',
        'any.required': 'Title is required.'
    }),
    description: Joi.string().allow('', null).optional(),
    price: Joi.number().min(0).precision(2).default(0).messages({
        'number.base': 'Price must be a valid number.',
        'number.min': 'Price cannot be negative.'
    }),
    majorId: Joi.string().uuid().allow(null).optional().messages({
        'string.guid': 'Invalid Major ID format.'
    })
});

export const updateCourseSchema = Joi.object({
    title: Joi.string().max(255).optional().messages({
        'string.max': 'Title cannot exceed 255 characters.'
    }),
    description: Joi.string().allow('', null).optional(),
    price: Joi.number().min(0).precision(2).optional().messages({
        'number.base': 'Price must be a valid number.',
        'number.min': 'Price cannot be negative.'
    }),
    majorId: Joi.string().uuid().allow(null).optional().messages({
        'string.guid': 'Invalid Major ID format.'
    })
});

export const createScheduleSchema = Joi.object({
    dayOfWeek: Joi.string().valid('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY').required().messages({
        'any.only': 'Invalid day of week.',
        'any.required': 'Day of week is required.'
    }),
    startTime: Joi.string().isoDate().required().messages({
        'string.isoDate': 'Start time must be a valid ISO date string.',
        'any.required': 'Start time is required.'
    }),
    endTime: Joi.string().isoDate().required().messages({
        'string.isoDate': 'End time must be a valid ISO date string.',
        'any.required': 'End time is required.'
    }),
    meetingLink: Joi.string().uri().allow('', null).optional().messages({
        'string.uri': 'Meeting link must be a valid URL.'
    })
});
