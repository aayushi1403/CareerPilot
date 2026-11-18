import { z } from 'zod';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { invokeStructuredAi } from './geminiClient.js';

export const CareerRoadmapSchema = z.object({
  title: z.string().describe('Roadmap title'),
  currentRole: z.string().describe('Starting position / skill baseline'),
  targetRole: z.string().describe('Target career destination'),
  timelineMonths: z.number().min(1).max(24).describe('Total timeline in months'),
  overview: z.string().describe('Strategic learning approach and pacing strategy'),
  phases: z
    .array(
      z.object({
        phaseNumber: z.number(),
        title: z.string().describe('Phase theme and stage name'),
        durationWeeks: z.number().describe('Duration in weeks'),
        focusArea: z.string().describe('Core focus of this phase'),
        skillsToMaster: z.array(z.string()).describe('Key technical skills acquired in this phase'),
        projects: z.array(
          z.object({
            title: z.string().describe('Practical project title'),
            description: z.string().describe('Key functionality and architecture'),
            techStack: z.array(z.string()).describe('Tech stack utilized'),
          })
        ),
        milestones: z.array(z.string()).describe('Verifiable checkpoints before advancing to next phase'),
      })
    )
    .min(2)
    .max(6),
});

const roadmapPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are an elite software engineering career architect and technical mentor.
Generate an achievable, chronologically phased career roadmap tailored to the candidate's existing background, target position, and available timeline.

INSTRUCTIONS:
1. Divide the journey into logical chronological phases (e.g., Foundations, Advanced Systems & Scalability, Production Readiness & Portfolio).
2. For each phase, provide concrete project ideas that demonstrate production-grade software craftsmanship.
3. Keep milestones measurable and realistic within the available timeline.`,
  ],
  [
    'human',
    `Create a personalized career roadmap:

Current Role / Skill Level: {currentRole}
Target Role: {targetRole}
Available Preparation Time: {timelineMonths} months
Current Skills: {skills}

Generate a structured roadmap with phased learning milestones and portfolio projects.`,
  ],
]);

/**
 * Generate a personalized career roadmap using LangChain & Gemini
 * @param {Object} params
 * @param {string} params.currentRole
 * @param {string} params.targetRole
 * @param {number} params.timelineMonths
 * @param {Array<string>} [params.currentSkills]
 * @returns {Promise<Object>}
 */
export async function generateCareerRoadmapAi({
  currentRole = 'Junior Developer',
  targetRole = 'Full-Stack Developer',
  timelineMonths = 6,
  currentSkills = [],
}) {
  const safeTimeline = Number(timelineMonths) || 6;
  const safeSkills = currentSkills.length > 0 ? currentSkills : ['React', 'JavaScript', 'Node.js', 'Git'];

  const promptMessages = await roadmapPrompt.formatMessages({
    currentRole,
    targetRole,
    timelineMonths: safeTimeline,
    skills: safeSkills.join(', '),
  });

  return invokeStructuredAi({
    promptMessages,
    schema: CareerRoadmapSchema,
    fallbackFn: () => generateFallbackRoadmap(currentRole, targetRole, safeTimeline, safeSkills),
    modelOptions: { temperature: 0.25 },
  });
}

/**
 * Fallback deterministic roadmap generator
 */
function generateFallbackRoadmap(currentRole, targetRole, timelineMonths, _currentSkills) {
  const weeksPerPhase = Math.max(2, Math.round((timelineMonths * 4) / 3));

  return {
    title: `${targetRole} Accelerator Roadmap`,
    currentRole,
    targetRole,
    timelineMonths,
    overview: `A structured ${timelineMonths}-month engineering roadmap designed to bridge the gap from ${currentRole} to ${targetRole} through project-driven milestones and production engineering practices.`,
    phases: [
      {
        phaseNumber: 1,
        title: 'Foundations & Production Architecture',
        durationWeeks: weeksPerPhase,
        focusArea: 'Strengthen core JavaScript/TypeScript fundamentals, REST API design, and component architecture.',
        skillsToMaster: ['TypeScript Strict Mode', 'Component Architecture', 'RESTful API Standards', 'Database Indexing'],
        projects: [
          {
            title: 'Full-Stack Task & Workflow API',
            description: 'Build a secure RESTful API with JWT authentication, role-based access control, and normalized PostgreSQL database.',
            techStack: ['Node.js', 'Express', 'TypeScript', 'PostgreSQL', 'Docker'],
          },
        ],
        milestones: [
          'Master TypeScript generics and utility types in production codebase',
          'Deploy containerized backend service to cloud with automated database migrations',
        ],
      },
      {
        phaseNumber: 2,
        title: 'Modern Ecosystem & Scalability',
        durationWeeks: weeksPerPhase,
        focusArea: 'Advanced state management, server-side rendering, caching, and automated testing.',
        skillsToMaster: ['Next.js App Router', 'Redis Caching', 'Vitest Unit Testing', 'Tailwind CSS Design Systems'],
        projects: [
          {
            title: 'Real-Time Analytics Dashboard',
            description: 'Develop an interactive data analytics dashboard featuring Redis pub/sub live updates and automated test coverage.',
            techStack: ['Next.js', 'React', 'Redis', 'Tailwind CSS', 'Vitest'],
          },
        ],
        milestones: [
          'Achieve 80%+ test coverage across critical backend modules and UI components',
          'Optimize server response time below 100ms using Redis caching layer',
        ],
      },
      {
        phaseNumber: 3,
        title: 'DevOps, CI/CD & Interview Readiness',
        durationWeeks: weeksPerPhase,
        focusArea: 'Automated CI/CD pipelines, container orchestration, system design interview mastery, and portfolio polishing.',
        skillsToMaster: ['Docker Compose', 'GitHub Actions CI/CD', 'System Design & Tradeoffs', 'Technical Behavioral Interviewing'],
        projects: [
          {
            title: 'CareerPilot Portfolio Showcase',
            description: 'Production-ready full-stack AI SaaS deployed with automated testing, CI/CD pipeline, and structured documentation.',
            techStack: ['React', 'Node.js', 'Docker', 'AWS/Vercel', 'GitHub Actions'],
          },
        ],
        milestones: [
          'Complete 5 end-to-end mock technical and behavioral interviews',
          'Ship full-stack application to public URL with automated CI/CD and monitoring',
        ],
      },
    ],
  };
}
