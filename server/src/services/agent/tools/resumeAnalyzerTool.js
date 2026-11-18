import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import Resume from '../../../models/Resume.js';
import { analyzeResumeWithGemini } from '../../ai/resumeAnalysisAiService.js';

export const resumeAnalyzerSchema = z.object({
  resumeId: z.string().optional().describe('Specific resume ID to analyze, or omit to analyze the latest resume'),
});

/**
 * Creates the resume_analyzer tool bound to the authenticated user context
 * @param {Object} user - Authenticated user object
 * @returns {import('@langchain/core/tools').StructuredTool}
 */
export function createResumeAnalyzerTool(user) {
  return tool(
    async ({ resumeId }) => {
      try {
        if (!user || !user._id) {
          return JSON.stringify({
            error: 'Authentication required. No user context provided.',
            resumeFound: false,
          });
        }

        // Strict user isolation: only retrieve user's own resumes
        let resume = null;
        if (resumeId) {
          // Specific resume requested: must match both _id/fileName and user._id
          resume = await Resume.findOne({ _id: resumeId, userId: user._id });
        } else {
          // No resumeId specified: get latest uploaded resume for this user
          const userResumes = await Resume.find({ userId: user._id }).sort({ createdAt: -1 });
          resume = userResumes[0] || null;
        }

        if (!resume) {
          return JSON.stringify({
            resumeFound: false,
            message: 'No resume found for this user. Recommend uploading a resume in PDF or DOCX format to get personalized analysis.',
            userSkills: user.skills || [],
          });
        }

        // Analyze resume text using the AI service
        const analysisResult = await analyzeResumeWithGemini(resume.rawText || '');
        const analysis = analysisResult.data;

        return JSON.stringify({
          resumeFound: true,
          fileName: resume.originalName || resume.fileName,
          uploadedAt: resume.createdAt,
          atsScore: analysis.atsScore || resume.atsScore || 75,
          overallScore: analysis.overallScore || resume.overallScore || 78,
          summary: analysis.summary,
          technicalSkills: analysis.technicalSkills || resume.structuredData?.skills || [],
          softSkills: analysis.softSkills || [],
          strengths: analysis.strengths || [],
          weaknesses: analysis.weaknesses || [],
          missingSections: analysis.missingSections || [],
          improvementSuggestions: analysis.improvementSuggestions || [],
        });
      } catch (err) {
        return JSON.stringify({
          error: `Resume analysis failed: ${err.message}`,
          resumeFound: false,
        });
      }
    },
    {
      name: 'resume_analyzer',
      description: "Analyzes the authenticated user's uploaded resume to extract ATS score, technical skills, soft skills, strengths, weaknesses, and improvement suggestions.",
      schema: resumeAnalyzerSchema,
    }
  );
}
