// backend/src/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

// User registration validation
const validateUserRegistration = [
  body('firebaseToken')
    .notEmpty()
    .withMessage('Firebase token is required'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('role')
    .isIn(['planner', 'professional'])
    .withMessage('Role must be either "planner" or "professional"'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters')
];

// User login validation
const validateUserLogin = [
  body('firebaseToken')
    .notEmpty()
    .withMessage('Firebase token is required')
];

// Profile update validation
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  
  body('availability_status')
    .optional()
    .isIn(['available', 'busy', 'unavailable'])
    .withMessage('Availability status must be "available", "busy", or "unavailable"')
];

// Event creation validation
const validateEventCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('location')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date in ISO format')
    .custom((value) => {
      const eventDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        throw new Error('Event date cannot be in the past');
      }
      
      // Check if date is not too far in the future (e.g., 2 years)
      const twoYearsFromNow = new Date();
      twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
      
      if (eventDate > twoYearsFromNow) {
        throw new Error('Event date cannot be more than 2 years in the future');
      }
      
      return true;
    }),
  
  body('event_type')
    .optional()
    .isIn(['wedding', 'corporate', 'birthday', 'conference', 'workshop', 'concert', 'other'])
    .withMessage('Invalid event type'),
  
  body('required_roles')
    .optional()
    .isArray()
    .withMessage('Required roles must be an array')
    .custom((roles) => {
      const validRoles = ['photographer', 'videographer', 'dj', 'mc', 'decorator', 'caterer', 'musician', 'dancer', 'artist'];
      const invalidRoles = roles.filter(role => !validRoles.includes(role));
      
      if (invalidRoles.length > 0) {
        throw new Error(`Invalid roles: ${invalidRoles.join(', ')}`);
      }
      
      return true;
    }),
  
  body('budget_range')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Budget range cannot exceed 50 characters'),
  
  body('is_public')
    .optional()
    .isBoolean()
    .withMessage('is_public must be a boolean value')
];

// Event update validation
const validateEventUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date in ISO format')
    .custom((value) => {
      const eventDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        throw new Error('Event date cannot be in the past');
      }
      
      return true;
    }),
  
  body('event_type')
    .optional()
    .isIn(['wedding', 'corporate', 'birthday', 'conference', 'workshop', 'concert', 'other'])
    .withMessage('Invalid event type'),
  
  body('required_roles')
    .optional()
    .isArray()
    .withMessage('Required roles must be an array'),
  
  body('budget_range')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Budget range cannot exceed 50 characters'),
  
  body('is_public')
    .optional()
    .isBoolean()
    .withMessage('is_public must be a boolean value'),
  
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Status must be one of: open, in_progress, completed, cancelled')
];

// Application creation validation
const validateApplicationCreation = [
  body('event_id')
    .isUUID()
    .withMessage('Please provide a valid event ID'),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Application message cannot exceed 1000 characters')
];

// Application status update validation
const validateApplicationStatusUpdate = [
  body('status')
    .isIn(['pending', 'accepted', 'rejected'])
    .withMessage('Status must be one of: pending, accepted, rejected'),
  
  body('response_message')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Response message cannot exceed 1000 characters')
];

// Review creation validation
const validateReviewCreation = [
  body('to_user_id')
    .isUUID()
    .withMessage('Please provide a valid user ID'),
  
  body('application_id')
    .isUUID()
    .withMessage('Please provide a valid application ID'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters')
];

// Review update validation
const validateReviewUpdate = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters')
];

// UUID parameter validation
const validateUuidParam = (paramName) => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`)
];

// Query parameter validation for pagination
const validatePaginationQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
];

// Search query validation
const validateSearchQuery = [
  query('q')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  
  ...validatePaginationQuery
];

// Bulk operations validation
const validateBulkApplicationUpdate = [
  body('application_ids')
    .isArray({ min: 1, max: 50 })
    .withMessage('Application IDs must be an array with 1-50 items'),
  
  body('application_ids.*')
    .isUUID()
    .withMessage('Each application ID must be a valid UUID'),
  
  body('status')
    .isIn(['pending', 'accepted', 'rejected'])
    .withMessage('Status must be one of: pending, accepted, rejected'),
  
  body('response_message')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Response message cannot exceed 1000 characters')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  // Remove any HTML tags from string inputs to prevent XSS
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<[^>]*>/g, '').trim();
  };

  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) {
    sanitizeObject(req.body);
  }

  if (req.query) {
    sanitizeObject(req.query);
  }

  if (req.params) {
    sanitizeObject(req.params);
  }

  next();
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validateEventCreation,
  validateEventUpdate,
  validateApplicationCreation,
  validateApplicationStatusUpdate,
  validateReviewCreation,
  validateReviewUpdate,
  validateUuidParam,
  validatePaginationQuery,
  validateSearchQuery,
  validateBulkApplicationUpdate,
  handleValidationErrors,
  sanitizeInput
};