import Resume from '../models/Resume.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { analyzeResumeWithGemini } from '../services/ai/resumeAnalysisAiService.js';
import { generateCareerRecommendations } from '../services/ai/careerRecommendationAiService.js';
import { analyzeSkillGaps } from '../services/ai/skillGapAiService.js';
import { generateCareerRoadmapAi } from '../services/ai/roadmapAiService.js';
import {
  generateInterviewQuestionsAi,
  evaluateInterviewAnswerAi,
} from '../services/ai/mockInterviewAiService.js';

/**
 * @desc    AI Resume Analysis using LangChain & Gemini
 * @route   POST /api/ai/resume/analyze
 * @access  Private
 */
export const handleResumeAnalysisAi = async (req, res, next) => {
  try {
    const { resumeId, resumeText } = req.body;
    let textToAnalyze = resumeText;

    if (!textToAnalyze && resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
      if (!resume) {
        return errorResponse(res, 404, 'Resume not found or unauthorized.');
      }
      textToAnalyze = resume.rawText;
    }

    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
      // Check if user has any existing resume
      const userResumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
      const latestResume = userResumes?.[0];
      if (latestResume && latestResume.rawText) {
        textToAnalyze = latestResume.rawText;
      } else {
        return errorResponse(
          res,
          400,
          'No resume text found. Please provide resumeText or upload a resume first.'
        );
      }
    }

    const aiResult = await analyzeResumeWithGemini(textToAnalyze);

    return successResponse(res, 200, 'AI resume analysis completed successfully', {
      analysis: aiResult.data,
      isAiGenerated: aiResult.isAiGenerated,
      model: aiResult.model,
      note: aiResult.note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Career Path Recommendations
 * @route   POST /api/ai/career/recommend
 * @access  Private
 */
export const handleCareerRecommendationsAi = async (req, res, next) => {
  try {
    const { resumeId, targetRole, skills } = req.body;

    let resumeData = {};
    if (resumeId) {
      const foundResume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
      if (foundResume) resumeData = foundResume;
    } else {
      const userResumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
      if (userResumes?.[0]) resumeData = userResumes[0];
    }

    const userProfile = {
      name: req.user.name,
      targetJobRole: targetRole || req.user.targetJobRole,
      skills: skills || req.user.skills || resumeData.structuredData?.skills || [],
      experienceLevel: req.user.experienceLevel || 'Mid-level',
      education: req.user.education,
    };

    const aiResult = await generateCareerRecommendations(resumeData, userProfile);

    return successResponse(res, 200, 'Career recommendations generated successfully', {
      recommendations: aiResult.data,
      isAiGenerated: aiResult.isAiGenerated,
      model: aiResult.model,
      note: aiResult.note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Skill Gap Analysis
 * @route   POST /api/ai/skills/gap-analysis
 * @access  Private
 */
export const handleSkillGapAnalysisAi = async (req, res, next) => {
  try {
    const { targetRole, currentSkills } = req.body;

    const roleToAnalyze = targetRole || req.user.targetJobRole || 'Full-Stack Developer';

    let skillsList = currentSkills;
    if (!skillsList || !Array.isArray(skillsList) || skillsList.length === 0) {
      skillsList = req.user.skills && req.user.skills.length > 0 ? req.user.skills : [];
      if (skillsList.length === 0) {
        const userResumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
        skillsList = userResumes?.[0]?.structuredData?.skills || ['React', 'JavaScript', 'Node.js', 'Git'];
      }
    }

    const aiResult = await analyzeSkillGaps(skillsList, roleToAnalyze);

    return successResponse(res, 200, 'Skill gap analysis completed successfully', {
      skillGap: aiResult.data,
      isAiGenerated: aiResult.isAiGenerated,
      model: aiResult.model,
      note: aiResult.note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Career Roadmap Generator
 * @route   POST /api/ai/roadmap/generate
 * @access  Private
 */
export const handleRoadmapGenerationAi = async (req, res, next) => {
  try {
    const { currentRole, targetRole, timelineMonths, currentSkills } = req.body;

    const resolvedCurrentRole = currentRole || req.user.experienceLevel || 'Junior Developer';
    const resolvedTargetRole = targetRole || req.user.targetJobRole || 'Full-Stack Developer';
    const resolvedTimeline = timelineMonths || 6;
    const resolvedSkills = Array.isArray(currentSkills) && currentSkills.length > 0
      ? currentSkills
      : req.user.skills || ['React', 'JavaScript', 'Node.js'];

    const aiResult = await generateCareerRoadmapAi({
      currentRole: resolvedCurrentRole,
      targetRole: resolvedTargetRole,
      timelineMonths: resolvedTimeline,
      currentSkills: resolvedSkills,
    });

    return successResponse(res, 200, 'Career roadmap generated successfully', {
      roadmap: aiResult.data,
      isAiGenerated: aiResult.isAiGenerated,
      model: aiResult.model,
      note: aiResult.note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Mock Interview Questions Generation
 * @route   POST /api/ai/interview/questions
 * @access  Private
 */
export const handleInterviewQuestionsAi = async (req, res, next) => {
  try {
    const { role, category, difficulty, count } = req.body;

    const resolvedRole = role || req.user.targetJobRole || 'Full-Stack Developer';
    const resolvedCategory = category || 'General Engineering';
    const resolvedDifficulty = difficulty || 'medium';
    const resolvedCount = count || 3;

    const aiResult = await generateInterviewQuestionsAi({
      role: resolvedRole,
      category: resolvedCategory,
      difficulty: resolvedDifficulty,
      count: resolvedCount,
    });

    return successResponse(res, 200, 'Interview questions generated successfully', {
      interview: aiResult.data,
      isAiGenerated: aiResult.isAiGenerated,
      model: aiResult.model,
      note: aiResult.note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Mock Interview Answer Evaluation
 * @route   POST /api/ai/interview/evaluate
 * @access  Private
 */
export const handleInterviewEvaluationAi = async (req, res, next) => {
  try {
    const { role, question, userAnswer } = req.body;

    if (!question || !userAnswer) {
      return errorResponse(res, 400, 'Both question and userAnswer are required for evaluation.');
    }

    const resolvedRole = role || req.user.targetJobRole || 'Full-Stack Developer';

    const aiResult = await evaluateInterviewAnswerAi({
      role: resolvedRole,
      question,
      userAnswer,
    });

    return successResponse(res, 200, 'Interview answer evaluated successfully', {
      evaluation: aiResult.data,
      isAiGenerated: aiResult.isAiGenerated,
      model: aiResult.model,
      note: aiResult.note,
    });
  } catch (error) {
    next(error);
  }
};
