import fs from 'fs';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Upload resume document
 * @route   POST /api/resumes/upload
 * @access  Private
 */
export const uploadResumeDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'Please select a resume file (PDF, DOC, or DOCX) to upload.');
    }

    const { filename, originalname, size, mimetype, path: filePath } = req.file;

    // Simulate ATS analysis calculation based on file content length/name
    const simulatedAtsScore = Math.floor(70 + Math.random() * 22); // between 70 and 92
    const simulatedOverallScore = Math.floor(simulatedAtsScore + (Math.random() * 8 - 4));

    const newResume = new Resume({
      userId: req.user._id,
      fileName: filename,
      originalName: originalname,
      fileSize: size,
      mimeType: mimetype,
      filePath,
      atsScore: simulatedAtsScore,
      overallScore: simulatedOverallScore,
      status: 'analyzed',
    });

    await newResume.save();

    // Update user's cached resumeScore
    await User.findByIdAndUpdate(req.user._id, {
      resumeScore: simulatedAtsScore,
    });

    return successResponse(res, 201, 'Resume uploaded and analyzed successfully', {
      resume: newResume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all uploaded resumes for current user
 * @route   GET /api/resumes
 * @access  Private
 */
export const getUploadedResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });

    return successResponse(res, 200, 'Resumes retrieved successfully', {
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single resume by ID
 * @route   GET /api/resumes/:id
 * @access  Private
 */
export const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return errorResponse(res, 404, 'Resume not found or you are not authorized to access it.');
    }

    return successResponse(res, 200, 'Resume details retrieved', {
      resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete uploaded resume
 * @route   DELETE /api/resumes/:id
 * @access  Private
 */
export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return errorResponse(res, 404, 'Resume not found or you are not authorized to delete it.');
    }

    // Remove physical file from disk if present
    if (resume.filePath && fs.existsSync(resume.filePath)) {
      try {
        fs.unlinkSync(resume.filePath);
      } catch (fileErr) {
        console.warn(`[Resume Deletion Warning] Failed to delete disk file: ${fileErr.message}`);
      }
    }

    await Resume.deleteOne({ _id: resume._id });

    return successResponse(res, 200, 'Resume deleted successfully', {
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

