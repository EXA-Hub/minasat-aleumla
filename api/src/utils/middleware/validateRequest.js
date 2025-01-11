// middleware/validation.js
import { validationResult } from 'express-validator';

/**
 * Middleware to validate requests using express-validator
 * Checks for validation errors and returns them in a consistent format
 * If no errors, passes to the next middleware
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format validation errors
    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));

    // Return 400 Bad Request with formatted errors
    return res.status(400).json({
      error: 'بيانات غير صالحة', // "Invalid data" in Arabic
      details: formattedErrors,
    });
  }

  // If no validation errors, continue to next middleware
  next();
};

/**
 * Helper function to create custom validation error messages
 */
export const createValidationError = (field, message) => ({
  field,
  message,
});

// Example usage in a route:
/*
router.post('/example',
  [
    body('email').isEmail().withMessage('البريد الإلكتروني غير صالح'),
    body('password').isLength({ min: 6 }).withMessage('كلمة المرور قصيرة جدًا'),
    validateRequest
  ],
  async (req, res) => {
    // Your route handler code here
  }
);
*/
