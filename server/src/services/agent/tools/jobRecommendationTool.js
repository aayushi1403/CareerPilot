import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import Job from '../../../models/Job.js';

export const jobRecommendationSchema = z.object({
  role: z.string().optional().describe('Target job title or keyword filter, e.g. "Backend", "Full-Stack", "React", "DevOps"'),
  skills: z.array(z.string()).optional().describe('Candidate skills to match against job requirements'),
  type: z.string().optional().describe('Employment type filter, e.g. "Full-time", "Remote", "Internship"'),
  limit: z.number().min(1).max(10).optional().describe('Maximum number of jobs to return (1-10, default 4)'),
});

/**
 * Creates the job_recommendation_tool bound to user context
 * @param {Object} user - Authenticated user object
 * @returns {import('@langchain/core/tools').StructuredTool}
 */
export function createJobRecommendationTool(user) {
  return tool(
    async ({ role, skills, type, limit = 4 }) => {
      try {
        const candidateSkills = (skills && skills.length > 0 ? skills : user?.skills || []).map((s) =>
          s.toLowerCase()
        );
        const searchRole = role || user?.targetJobRole || '';

        // Query database for jobs
        let allJobs = await Job.find({});

        // If mockDb or empty, ensure array
        if (!Array.isArray(allJobs)) {
          allJobs = [];
        }

        // Filter by role/keywords if provided
        let filteredJobs = allJobs;
        if (searchRole) {
          const roleLower = searchRole.toLowerCase();
          filteredJobs = allJobs.filter((j) => {
            const titleMatch = j.title?.toLowerCase().includes(roleLower);
            const tagMatch = j.tags?.some((t) => t.toLowerCase().includes(roleLower));
            const descMatch = j.description?.toLowerCase().includes(roleLower);
            return titleMatch || tagMatch || descMatch;
          });

          // If strict filter yielded zero, fallback to all jobs to allow skill matching
          if (filteredJobs.length === 0) {
            filteredJobs = allJobs;
          }
        }

        // Filter by type if provided
        if (type) {
          const typeLower = type.toLowerCase();
          filteredJobs = filteredJobs.filter(
            (j) => j.type?.toLowerCase() === typeLower || (typeLower === 'remote' && j.isRemote)
          );
        }

        // Score jobs based on candidate skill overlap
        const scoredJobs = filteredJobs.map((job) => {
          const jobTags = (job.tags || []).map((t) => t.toLowerCase());
          const matchedSkills = candidateSkills.filter((s) =>
            jobTags.some((t) => t.includes(s) || s.includes(t))
          );
          const baseScore = job.matchScore || 75;
          const skillBonus = matchedSkills.length * 5;
          const calculatedScore = Math.min(98, Math.max(50, baseScore + skillBonus));

          return {
            id: job._id,
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            type: job.type,
            isRemote: job.isRemote,
            matchScore: calculatedScore,
            matchedSkills,
            requiredSkills: job.tags || [],
            descriptionSnippet: job.description?.slice(0, 150) + '...',
          };
        });

        // Sort descending by match score
        scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
        const topJobs = scoredJobs.slice(0, limit);

        return JSON.stringify({
          totalFound: scoredJobs.length,
          returnedCount: topJobs.length,
          criteria: {
            role: searchRole,
            candidateSkillsCount: candidateSkills.length,
            typeFilter: type || 'All',
          },
          jobs: topJobs,
        });
      } catch (err) {
        return JSON.stringify({
          error: `Job recommendation search failed: ${err.message}`,
          jobs: [],
        });
      }
    },
    {
      name: 'job_recommendation_tool',
      description: 'Searches and ranks verified job opportunities matching candidate skills, target role, and employment preferences.',
      schema: jobRecommendationSchema,
    }
  );
}
