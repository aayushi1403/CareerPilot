import { errorResponse } from '../utils/apiResponse.js';

/**
 * 404 Route Not Found handler
 */
export const notFound = (req, res, _next) => {
  return errorResponse(res, 404, `API endpoint not found: ${req.method} ${req.originalUrl}`);
};

/**
 * Central Error Handler Middleware
 */
export const errorHandler = (err, req, res, _next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error Middleware]:', err.message);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return errorResponse(res, 400, `Resource not found. Invalid ID: ${err.value}`);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return errorResponse(res, 409, `An account with that ${field} already exists.`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return errorResponse(res, 400, 'Validation failed', messages);
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 400, 'File size limit exceeded. Maximum size is 5MB.');
    }
    return errorResponse(res, 400, `File upload error: ${err.message}`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, 'Invalid authentication token.');
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected error occurred on the server. Please try again later.'
      : err.message || 'Internal Server Error';

  return errorResponse(res, statusCode, message);
};
