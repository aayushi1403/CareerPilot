import { z } from 'zod';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { invokeStructuredAi } from './geminiClient.js';

export const CareerRecommendationSchema = z.object({
  candidateOverview: z.string().describe('Synthesis of candidate profile, tech stack, and career trajectory'),
  recommendedRoles: z
    .array(
      z.object({
        title: z.string().describe('Job title suited to candidate background'),
        matchPercentage: z.number().min(0).max(100).describe('Compatibility percentage'),
        reasons: z.array(z.string()).describe('Detailed rationale for why this role is recommended'),
        requiredSkills: z.array(z.string()).describe('Core required skills for this track'),
        growthOutlook: z.string().describe('Market demand and compensation trend'),
        suggestedDirection: z.string().describe('Concrete actionable step to target this role'),
      })
    )
    .min(1)
    .max(5),
  strategicAdvice: z.string().describe('Strategic 6-to-12 month advice for competitive positioning'),
});

const careerPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are an elite career development strategist and engineering leadership advisor.
Recommend viable, high-potential career tracks based on the candidate's verified skills, experience, and target interests.

IMPORTANT RULES:
1. Base your recommendations strictly on the candidate's skills, experience, and trajectory.
2. DO NOT invent fake employer company names or fabricate non-existent job openings. Recommend standard industry job roles and career paths.
3. Be realistic about match percentages and outline clearly what skills are already matched versus what needs development.`,
  ],
  [
    'human',
    `Evaluate this candidate profile and suggest top career directions:

Candidate Name: {name}
Target Role Preference: {targetRole}
Experience Level: {experienceLevel}
Education: {education}
Current Skills: {skills}
Resume Summary: {resumeSummary}

Generate structured career recommendations.`,
  ],
]);

/**
 * Generate personalized career recommendations based on resume and user profile
 * @param {Object} resumeData
 * @param {Object} userProfile
 * @returns {Promise<Object>}
 */
export async function generateCareerRecommendations(resumeData = {}, userProfile = {}) {
  const skillsList = resumeData.structuredData?.skills || userProfile.skills || ['JavaScript', 'React', 'Node.js', 'Git'];
  const name = resumeData.structuredData?.contact?.name || userProfile.name || 'Candidate';
  const targetRole = userProfile.targetJobRole || 'Full-Stack Developer';
  const experienceLevel = userProfile.experienceLevel || 'Mid-level';
  const education = resumeData.structuredData?.education?.[0]?.degree || userProfile.education || 'Computer Science';
  const resumeSummary = (resumeData.rawText || '').slice(0, 1500) || 'Full-stack engineering enthusiast.';

  const promptMessages = await careerPrompt.formatMessages({
    name,
    targetRole,
    experienceLevel,
    education,
    skills: skillsList.join(', '),
    resumeSummary,
  });

  return invokeStructuredAi({
    promptMessages,
    schema: CareerRecommendationSchema,
    fallbackFn: () => generateFallbackCareerRecommendations(name, targetRole, skillsList, experienceLevel),
    modelOptions: { temperature: 0.3 },
  });
}

/**
 * Fallback career recommendation heuristics
 */
function generateFallbackCareerRecommendations(name, targetRole, skills, experienceLevel) {
  const hasReact = skills.some((s) => /react/i.test(s));
  const hasNode = skills.some((s) => /node|express/i.test(s));
  const hasPython = skills.some((s) => /python|django|fastapi/i.test(s));
  const hasCloud = skills.some((s) => /aws|azure|gcp|docker|kubernetes/i.test(s));

  return {
    candidateOverview: `${name} demonstrates a solid ${experienceLevel} foundation centered around ${skills.slice(0, 4).join(', ')}. Strong alignment exists with modern web applications and cloud architectures.`,
    recommendedRoles: [
      {
        title: targetRole || 'Full-Stack Engineer',
        matchPercentage: hasReact && hasNode ? 92 : 84,
        reasons: [
          'Direct experience with modern client-side and server-side JavaScript/TypeScript stacks.',
          'Demonstrated capability in developing end-to-end features from database to frontend UI.',
          'High industry hiring velocity across startups and tech enterprises.',
        ],
        requiredSkills: ['React', 'Node.js', 'TypeScript', 'REST APIs', 'PostgreSQL/MongoDB', 'Docker'],
        growthOutlook: 'Very High Demand • 25% Projected 5-Year Growth',
        suggestedDirection: 'Build and deploy a full-stack SaaS application with authentication, payment gateway, and CI/CD pipelines.',
      },
      {
        title: 'Frontend Software Engineer',
        matchPercentage: hasReact ? 88 : 78,
        reasons: [
          'Strong UI development capabilities with modern responsive component frameworks.',
          'Familiarity with state management, client performance tuning, and SPA architecture.',
        ],
        requiredSkills: ['React / Next.js', 'TypeScript', 'Tailwind CSS', 'State Management', 'Vitest / Jest'],
        growthOutlook: 'High Demand • Competitive Global Remote Market',
        suggestedDirection: 'Deepen expertise in Next.js Server Components, accessibility (a11y), and frontend performance optimization.',
      },
      {
        title: 'Cloud & Backend Systems Engineer',
        matchPercentage: hasCloud || hasPython ? 82 : 74,
        reasons: [
          'Backend API construction capabilities can be leveraged into scalable distributed systems.',
          'Cloud infrastructure knowledge offers superior compensation growth.',
        ],
        requiredSkills: ['Node.js or Python', 'PostgreSQL', 'Docker', 'AWS / GCP', 'Microservices', 'Redis'],
        growthOutlook: 'Rapidly Expanding • High Average Base Salaries',
        suggestedDirection: 'Attain AWS Certified Solutions Architect (Associate) and implement containerized deployments with Docker and Terraform.',
      },
    ],
    strategicAdvice:
      'Over the next 6-12 months, focus on transitioning from individual feature implementation to system design and measurable business impact. Emphasize cloud deployments and production reliability in your portfolio.',
  };
}
