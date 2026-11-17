import { errorResponse } from '../utils/apiResponse.js';

/**
 * Validate user registration payload
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!email || typeof email !== 'string') {
    errors.push('Valid email address is required');
  } else {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email address format');
    }
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, 'Validation failed', errors);
  }

  next();
};

/**
 * Validate user login payload
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email is required');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, 'Validation failed', errors);
  }

  next();
};

/**
 * Validate roadmap creation payload
 */
export const validateRoadmap = (req, res, next) => {
  const { currentRole, targetRole } = req.body;
  const errors = [];

  if (!currentRole || typeof currentRole !== 'string') {
    errors.push('currentRole is required');
  }
  if (!targetRole || typeof targetRole !== 'string') {
    errors.push('targetRole is required');
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, 'Validation failed', errors);
  }

  next();
};

