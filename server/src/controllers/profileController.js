import mongoose from 'mongoose';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { devStore } from '../utils/devStore.js';

const isDbAvailable = () => mongoose.connection.readyState === 1 || process.env.NODE_ENV === 'test';

/**
 * @desc    Get user profile
 * @route   GET /api/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    let profileData;

    if (isDbAvailable()) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return errorResponse(res, 404, 'User profile not found.');
      }
      user.calculateProfileCompletion();
      profileData = {
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
      };
    } else {
      const user = devStore.findUserById(req.user._id) || req.user;
      profileData = {
        id: user._id,
        name: user.name,
        email: user.email,
        education: user.education || [],
        graduationYear: user.graduationYear || '',
        targetJobRole: user.targetJobRole || 'Full-Stack Developer',
        skills: user.skills || [],
        experienceLevel: user.experienceLevel || 'Mid-level',
        bio: user.bio || '',
        location: user.location || '',
        resumeScore: user.resumeScore || 0,
        interviewScore: user.interviewScore || 0,
        profileCompletion: user.profileCompletion || 60,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }

    return successResponse(res, 200, 'Profile retrieved successfully', {
      profile: profileData,
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

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (education !== undefined) updates.education = education;
    if (graduationYear !== undefined) updates.graduationYear = graduationYear;
    if (targetJobRole !== undefined) updates.targetJobRole = targetJobRole;
    if (skills !== undefined) updates.skills = Array.isArray(skills) ? skills : [];
    if (experienceLevel !== undefined) updates.experienceLevel = experienceLevel;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;

    let profileData;

    if (isDbAvailable()) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return errorResponse(res, 404, 'User profile not found.');
      }

      Object.assign(user, updates);
      user.calculateProfileCompletion();
      await user.save();

      profileData = {
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
      };
    } else {
      const updatedUser = devStore.updateUser(req.user._id, updates);
      if (!updatedUser) {
        return errorResponse(res, 404, 'User profile not found.');
      }
      profileData = {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        education: updatedUser.education,
        graduationYear: updatedUser.graduationYear,
        targetJobRole: updatedUser.targetJobRole,
        skills: updatedUser.skills,
        experienceLevel: updatedUser.experienceLevel,
        bio: updatedUser.bio,
        location: updatedUser.location,
        resumeScore: updatedUser.resumeScore,
        interviewScore: updatedUser.interviewScore,
        profileCompletion: updatedUser.profileCompletion,
        updatedAt: updatedUser.updatedAt,
      };
    }

    return successResponse(res, 200, 'Profile updated successfully', {
      profile: profileData,
    });
  } catch (error) {
    next(error);
  }
};
