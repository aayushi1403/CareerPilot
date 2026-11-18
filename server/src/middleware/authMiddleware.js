import mongoose from 'mongoose';
import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';
import { devStore } from '../utils/devStore.js';

const isDbAvailable = () => mongoose.connection.readyState === 1 || process.env.NODE_ENV === 'test';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length > 1) {
      token = parts.slice(1).join(' ').trim();
    }
  }

  if (!token) {
    return errorResponse(res, 401, 'Access denied. No authentication token provided.');
  }

  try {
    const decoded = verifyToken(token);

    let user;
    if (isDbAvailable()) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = devStore.findUserById(decoded.id);
      if (!user && decoded.email) {
        user = devStore.findUserByEmail(decoded.email);
      }
    }

    if (!user) {
      return errorResponse(res, 401, 'User associated with this token no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Authentication token has expired. Please log in again.');
    }
    return errorResponse(res, 401, 'Invalid authentication token.');
  }
};
