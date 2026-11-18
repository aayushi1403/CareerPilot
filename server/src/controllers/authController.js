import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { devStore } from '../utils/devStore.js';

const isDbAvailable = () => mongoose.connection.readyState === 1 || process.env.NODE_ENV === 'test';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, targetJobRole, skills, experienceLevel } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();

    // Development offline mode with strict user creation & bcrypt hashing
    if (!isDbAvailable()) {
      const existingUser = devStore.findUserByEmail(normalizedEmail);
      if (existingUser) {
        return errorResponse(res, 409, 'An account with this email address already exists.');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = devStore.saveUser({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        targetJobRole: targetJobRole || 'Full-Stack Developer',
        skills: Array.isArray(skills) ? skills : ['React', 'JavaScript', 'Node.js', 'Git'],
        experienceLevel: experienceLevel || 'Mid-level',
        profileCompletion: 60,
      });

      const token = generateToken({ id: newUser._id, email: newUser.email });
      const userObj = { ...newUser };
      delete userObj.password;

      return successResponse(res, 201, 'User registered successfully', {
        user: userObj,
        token,
      });
    }

    // Normal MongoDB flow
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return errorResponse(res, 409, 'An account with this email address already exists.');
    }

    // Create user
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
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
    const normalizedEmail = (email || '').toLowerCase().trim();

    // Development offline mode with real bcrypt credential check
    if (!isDbAvailable()) {
      const user = devStore.findUserByEmail(normalizedEmail);
      if (!user) {
        return errorResponse(res, 401, 'Invalid email or password.');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return errorResponse(res, 401, 'Invalid email or password.');
      }

      const token = generateToken({ id: user._id, email: user.email });
      const userObj = { ...user };
      delete userObj.password;

      return successResponse(res, 200, 'Login successful', {
        user: userObj,
        token,
      });
    }

    // Normal MongoDB flow
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
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
    if (!isDbAvailable()) {
      const user = devStore.findUserById(req.user._id) || req.user;
      const userObj = { ...user };
      delete userObj.password;
      return successResponse(res, 200, 'Current user retrieved', {
        user: userObj,
      });
    }

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
