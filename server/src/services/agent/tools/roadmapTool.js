import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import mongoose from 'mongoose';
import Resume from '../../../models/Resume.js';
import { generateCareerRoadmapAi } from '../../ai/roadmapAiService.js';

export const roadmapSchema = z.object({
  targetRole: z
    .string()
    .describe('Target career role to generate a learning roadmap for, e.g. "Senior Backend Developer"'),
  currentRole: z
    .string()
    .optional()
    .describe('Current role or background, e.g. "Junior Frontend Developer" or "Student"'),
  timelineMonths: z
    .number()
    .min(1)
    .max(24)
    .optional()
    .describe('Target timeline in months (1-24, default 6)'),
  currentSkills: z
    .array(z.string())
    .optional()
    .describe('Current skills, or omit to auto-detect from user profile and resume'),
});

/**
 * Creates the career_roadmap_generator tool bound to user context
 * @param {Object} user - Authenticated user object
 * @returns {import('@langchain/core/tools').StructuredTool}
 */
export function createRoadmapTool(user) {
  return tool(
    async ({ targetRole, currentRole, timelineMonths = 6, currentSkills }) => {
      try {
        let skills = currentSkills && currentSkills.length > 0 ? currentSkills : [];

        // Auto-extract skills from user if empty
        if (skills.length === 0 && user?.skills) {
          skills = [...user.skills];
        }

        // Auto-extract from resume if available
        if (user?._id && mongoose.Types.ObjectId.isValid(user._id)) {
          try {
            const userResumes = await Resume.find({ userId: user._id }).sort({ createdAt: -1 });
            const latestResume = userResumes[0];
            if (latestResume?.structuredData?.skills) {
              skills = Array.from(new Set([...skills, ...latestResume.structuredData.skills]));
            }
          } catch (resumeErr) {
            console.warn(`[Roadmap Tool Resume Fetch]: ${resumeErr.message}`);
          }
        }

        const effectiveTarget = targetRole || user?.targetJobRole || 'Full-Stack Developer';
        const effectiveCurrent = currentRole || 'Junior Developer / Learner';

        const result = await generateCareerRoadmapAi({
          targetRole: effectiveTarget,
          currentRole: effectiveCurrent,
          timelineMonths,
          currentSkills: skills,
        });

        const data = result.data;

        // Flatten recommended projects across phases
        const allProjects = [];
        for (const p of data.phases || []) {
          if (Array.isArray(p.projects)) {
            allProjects.push(...p.projects);
          }
        }

        return JSON.stringify({
          title: data.title,
          targetRole: effectiveTarget,
          timelineMonths: data.timelineMonths,
          overview: data.overview,
          totalPhases: data.phases?.length || 0,
          phases: (data.phases || []).map((p) => ({
            phaseNumber: p.phaseNumber,
            phase: p.title,
            durationWeeks: p.durationWeeks,
            focusArea: p.focusArea,
            skillsToLearn: p.skillsToMaster,
            milestone: p.milestones?.[0] || 'Advance to next phase',
            projects: p.projects,
          })),
          recommendedProjects: allProjects,
          estimatedHoursPerWeek: 12,
        });
      } catch (err) {
        return JSON.stringify({
          error: `Career roadmap generation failed: ${err.message}`,
          targetRole,
        });
      }
    },
    {
      name: 'career_roadmap_generator',
      description: 'Generates a structured, chronological career roadmap with learning phases, milestone objectives, skill targets, and project deliverables to reach a target role.',
      schema: roadmapSchema,
    }
  );
}
