import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, targetJobRole, skills, experienceLevel } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 409, 'An account with this email address already exists.');
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      targetJobRole: targetJobRole || 'Full-Stack Developer',
      skills: Array.isArray(skills) ? skills : ['React', 'JavaScript', 'Node.js', 'Git'],
      experienceLevel: experienceLevel || 'Mid-level',
    });

    user.calculateProfileCompletion();
    await user.save();

    // Generate JWT
    const token = generateToken({ id: user._id, email: user.email });

    const userObj = user.toObject();
    delete userObj.password;

    return successResponse(res, 201, 'User registered successfully', {
      user: userObj,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email including password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    // Generate JWT
    const token = generateToken({ id: user._id, email: user.email });

    const userObj = user.toObject();
    delete userObj.password;

    return successResponse(res, 200, 'Login successful', {
      user: userObj,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    user.calculateProfileCompletion();
    return successResponse(res, 200, 'Current user retrieved', {
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user (client clears token)
 * @route   POST /api/auth/logout
 * @access  Public / Private
 */
export const logout = async (req, res) => {
  return successResponse(res, 200, 'Logged out successfully. Please discard the authentication token on the client.');
};

