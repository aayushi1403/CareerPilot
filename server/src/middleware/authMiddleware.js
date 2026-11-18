import mongoose from 'mongoose';
import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

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
    } else if (process.env.NODE_ENV !== 'production') {
      // In-memory development demo session
      user = {
        _id: decoded.id || '673c11111111111111111111',
        name: decoded.name || 'Alex Mercer',
        email: decoded.email || 'alex.mercer@careerpilot.io',
        targetJobRole: 'Full-Stack Developer',
        skills: ['React', 'JavaScript', 'Node.js', 'Git'],
        role: 'user',
      };
    } else {
      user = await User.findById(decoded.id).select('-password');
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
