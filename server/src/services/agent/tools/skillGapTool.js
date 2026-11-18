import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import mongoose from 'mongoose';
import Resume from '../../../models/Resume.js';
import { analyzeSkillGaps } from '../../ai/skillGapAiService.js';

export const skillGapSchema = z.object({
  targetRole: z
    .string()
    .describe('Target career role to evaluate skill gaps for, e.g. "Backend Developer", "Frontend Developer", "Full-Stack Developer"'),
  currentSkills: z
    .array(z.string())
    .optional()
    .describe('List of current skills, or omit to auto-detect from user profile and resume'),
});

/**
 * Creates the skill_gap_analyzer tool bound to user context
 * @param {Object} user - Authenticated user object
 * @returns {import('@langchain/core/tools').StructuredTool}
 */
export function createSkillGapTool(user) {
  return tool(
    async ({ targetRole, currentSkills }) => {
      try {
        let skillsToAnalyze = currentSkills && currentSkills.length > 0 ? currentSkills : [];

        // Auto-extract skills from user profile if not passed
        if (skillsToAnalyze.length === 0 && user?.skills && user.skills.length > 0) {
          skillsToAnalyze = [...user.skills];
        }

        // Auto-extract skills from latest resume if still empty or to supplement
        if (user?._id && mongoose.Types.ObjectId.isValid(user._id)) {
          try {
            const userResumes = await Resume.find({ userId: user._id }).sort({ createdAt: -1 });
            const latestResume = userResumes[0];
            if (latestResume?.structuredData?.skills) {
              const resumeSkills = latestResume.structuredData.skills;
              skillsToAnalyze = Array.from(new Set([...skillsToAnalyze, ...resumeSkills]));
            }
          } catch (resumeFetchErr) {
            console.warn(`[Skill Gap Tool Resume Fetch]: ${resumeFetchErr.message}`);
          }
        }

        const effectiveRole = targetRole || user?.targetJobRole || 'Full-Stack Developer';

        const result = await analyzeSkillGaps(skillsToAnalyze, effectiveRole);
        const data = result.data;

        return JSON.stringify({
          targetRole: effectiveRole,
          matchPercentage: data.readinessScore,
          existingSkills: data.existingSkills,
          missingSkills: data.missingSkills,
          criticalGaps: data.missingSkills.filter((s) => s.priority === 'High' || s.priority === 'Critical'),
          learningRoadmapSummary: data.overallAnalysis,
          skillsAnalyzedCount: skillsToAnalyze.length,
        });
      } catch (err) {
        return JSON.stringify({
          error: `Skill gap analysis failed: ${err.message}`,
          targetRole,
        });
      }
    },
    {
      name: 'skill_gap_analyzer',
      description: 'Compares existing candidate skills against a target role to identify missing skills, match percentage, and prioritized learning recommendations.',
      schema: skillGapSchema,
    }
  );
}
