import fs from 'fs';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import {
  extractTextFromFile,
  parseResumeText,
  calculateResumeMetrics,
  createEmptyStructuredData,
} from '../services/resumeParserService.js';
import { indexUserResume } from '../services/rag/ragAssistantService.js';
import { vectorStore, COLLECTIONS } from '../services/rag/chromaVectorStore.js';

/**
 * @desc    Upload, extract text, and parse resume document
 * @route   POST /api/resumes/upload
 * @access  Private
 */
export const uploadResumeDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'Please select a resume file (PDF, DOC, or DOCX) to upload.');
    }

    const { filename, originalname, size, mimetype, path: filePath, buffer } = req.file;

    // 1. Text extraction from file
    const extractionResult = await extractTextFromFile(filePath, mimetype, buffer);
    const { rawText, extractionStatus, extractionError, metadata } = extractionResult;

    // 2. Structured parsing and metrics calculation
    let structuredData = createEmptyStructuredData();
    let calculatedAtsScore = 75;
    let calculatedOverallScore = 78;
    let sections = [];
    let keywords = { found: [], missing: [] };
    let status = 'uploaded';

    if (extractionStatus === 'completed') {
      // Parse sections, contact, skills, education, experience, projects
      structuredData = parseResumeText(rawText);

      // Calculate ATS metrics and section scores
      const metrics = calculateResumeMetrics(rawText, structuredData);
      calculatedAtsScore = metrics.atsScore;
      calculatedOverallScore = metrics.overallScore;
      sections = metrics.sections;
      keywords = metrics.keywords;
      status = 'analyzed';

      // Update user's cached resumeScore and skills if available
      try {
        const updatePayload = { resumeScore: calculatedAtsScore };
        if (structuredData.skills && structuredData.skills.length > 0) {
          const user = await User.findById(req.user._id);
          if (user && (!user.skills || user.skills.length === 0)) {
            updatePayload.skills = structuredData.skills.slice(0, 8);
          }
        }
        await User.findByIdAndUpdate(req.user._id, updatePayload);
      } catch (userUpdateErr) {
        console.warn(`[User Profile Update Warning]: ${userUpdateErr.message}`);
      }
    } else if (extractionStatus === 'scanned_or_empty') {
      calculatedAtsScore = 40;
      calculatedOverallScore = 45;
      status = 'uploaded';
      sections = [
        {
          name: 'Text Extraction Alert',
          score: 40,
          feedback: extractionError || 'Document is scanned, image-only, or contains no readable text.',
          suggestions: [
            'Upload a direct digital export from Google Docs, MS Word, or LaTeX',
            'Ensure your PDF contains selectable text rather than scanned images',
          ],
        },
      ];
    } else {
      // Extraction failed
      calculatedAtsScore = 30;
      calculatedOverallScore = 35;
      status = 'uploaded';
    }

    // 3. Save resume metadata and structured data in MongoDB
    const newResume = new Resume({
      userId: req.user._id,
      fileName: filename,
      originalName: originalname,
      fileSize: size,
      mimeType: mimetype,
      filePath,
      rawText,
      extractionStatus,
      extractionError,
      metadata,
      structuredData,
      atsScore: calculatedAtsScore,
      overallScore: calculatedOverallScore,
      status,
      sections,
      keywords,
    });

    await newResume.save();

    // Asynchronously index resume chunks into vector store for RAG
    if (extractionStatus === 'completed' && rawText) {
      try {
        await indexUserResume(newResume);
      } catch (ragIndexErr) {
        console.warn(`[RAG Indexing Warning]: ${ragIndexErr.message}`);
      }
    }

    const responseMessage =
      extractionStatus === 'completed'
        ? 'Resume uploaded, extracted, and analyzed successfully.'
        : extractionStatus === 'scanned_or_empty'
        ? 'Resume uploaded, but contains no extractable text (image/scanned document detected).'
        : 'Resume uploaded with extraction warnings.';

    return successResponse(res, 201, responseMessage, {
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

    // Clean up vector store chunks for this resume
    try {
      await vectorStore.deleteDocument(
        COLLECTIONS.RESUMES,
        `resume_${resume._id}`,
        req.user._id.toString()
      );
    } catch (ragDelErr) {
      console.warn(`[RAG Deletion Warning]: ${ragDelErr.message}`);
    }

    return successResponse(res, 200, 'Resume deleted successfully', {
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};
