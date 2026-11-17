import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Get user profile
 * @route   GET /api/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 404, 'User profile not found.');
    }

    user.calculateProfileCompletion();
    return successResponse(res, 200, 'Profile retrieved successfully', {
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        education: user.education,
        graduationYear: user.graduationYear,
        targetJobRole: user.targetJobRole,
        skills: user.skills,
        experienceLevel: user.experienceLevel,
        bio: user.bio,
        location: user.location,
        resumeScore: user.resumeScore,
        interviewScore: user.interviewScore,
        profileCompletion: user.profileCompletion,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 404, 'User profile not found.');
    }

    const {
      name,
      education,
      graduationYear,
      targetJobRole,
      skills,
      experienceLevel,
      bio,
      location,
    } = req.body;

    if (name !== undefined) user.name = name;
    if (education !== undefined) user.education = education;
    if (graduationYear !== undefined) user.graduationYear = graduationYear;
    if (targetJobRole !== undefined) user.targetJobRole = targetJobRole;
    if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : user.skills;
    if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;

    user.calculateProfileCompletion();
    await user.save();

    return successResponse(res, 200, 'Profile updated successfully', {
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        education: user.education,
        graduationYear: user.graduationYear,
        targetJobRole: user.targetJobRole,
        skills: user.skills,
        experienceLevel: user.experienceLevel,
        bio: user.bio,
        location: user.location,
        resumeScore: user.resumeScore,
        interviewScore: user.interviewScore,
        profileCompletion: user.profileCompletion,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

