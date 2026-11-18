import { z } from 'zod';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { invokeStructuredAi } from './geminiClient.js';

export const SkillGapAnalysisSchema = z.object({
  targetRole: z.string().describe('Target job role analyzed'),
  readinessScore: z.number().min(0).max(100).describe('Overall readiness percentage (0-100)'),
  existingSkills: z.array(z.string()).describe('Skills already possessed that match the role requirements'),
  missingSkills: z.array(
    z.object({
      skill: z.string().describe('Name of the missing or underdeveloped skill'),
      priority: z.enum(['Critical', 'High', 'Medium', 'Low']).describe('Hiring priority for this role'),
      category: z.string().describe('Skill category: Architecture, Cloud & DevOps, Testing, Security, Frontend, Backend'),
      timeToLearnWeeks: z.number().min(1).max(24).describe('Estimated preparation time in weeks'),
      recommendedAction: z.string().describe('Actionable learning exercise or project milestone'),
    })
  ),
  overallAnalysis: z.string().describe('Executive summary of candidate readiness and fastest path to bridge the gap'),
});

const skillGapPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are an industry-leading technical skills assessor and engineering hiring manager.
Compare the candidate's existing technical competencies against current production expectations for the target engineering role.

CRITICAL INSTRUCTIONS:
1. Objectively evaluate which competencies are already satisfied vs. missing.
2. Prioritize missing skills as Critical (must have to pass technical screening), High (strongly expected), Medium (valued differentiator), or Low.
3. Recommend realistic, project-based actions rather than generic advice.`,
  ],
  [
    'human',
    `Conduct a comprehensive skill gap analysis:

Target Role: {targetRole}
Current Skills: {currentSkills}

Identify existing matching skills, critical missing requirements, priority levels, and practical learning actions.`,
  ],
]);

/**
 * Run skill gap analysis comparing candidate skills with target role
 * @param {Array<string>} currentSkills
 * @param {string} targetRole
 * @returns {Promise<Object>}
 */
export async function analyzeSkillGaps(currentSkills = [], targetRole = 'Full-Stack Developer') {
  const safeSkills = Array.isArray(currentSkills) && currentSkills.length > 0
    ? currentSkills
    : ['JavaScript', 'HTML5', 'CSS3', 'React', 'Git'];

  const promptMessages = await skillGapPrompt.formatMessages({
    targetRole,
    currentSkills: safeSkills.join(', '),
  });

  return invokeStructuredAi({
    promptMessages,
    schema: SkillGapAnalysisSchema,
    fallbackFn: () => generateFallbackSkillGap(safeSkills, targetRole),
    modelOptions: { temperature: 0.2 },
  });
}

/**
 * Deterministic domain skill benchmark dictionary for fallback analysis
 */
const ROLE_BENCHMARKS = {
  'Full-Stack Developer': [
    { skill: 'Docker & Containerization', priority: 'High', category: 'Cloud & DevOps', timeToLearnWeeks: 3, recommendedAction: 'Containerize frontend and backend services with multi-stage Dockerfiles and docker-compose.' },
    { skill: 'Automated Testing (Vitest/Jest)', priority: 'Critical', category: 'Testing & Quality', timeToLearnWeeks: 2, recommendedAction: 'Write unit tests for core business logic and integration tests for REST API endpoints.' },
    { skill: 'PostgreSQL & SQL Schema Design', priority: 'High', category: 'Backend & Data', timeToLearnWeeks: 4, recommendedAction: 'Design normalized relational schemas with indexing and query optimization.' },
    { skill: 'CI/CD Pipelines (GitHub Actions)', priority: 'Medium', category: 'Cloud & DevOps', timeToLearnWeeks: 2, recommendedAction: 'Build automated lint, test, and build workflows triggered on pull requests.' },
    { skill: 'Microservices & Message Queues', priority: 'Medium', category: 'Architecture', timeToLearnWeeks: 5, recommendedAction: 'Decouple services with Redis Pub/Sub or RabbitMQ for asynchronous event handling.' },
  ],
  'Frontend Engineer': [
    { skill: 'Next.js & SSR/SSG Architecture', priority: 'Critical', category: 'Frontend', timeToLearnWeeks: 3, recommendedAction: 'Build an SSR application utilizing App Router, Server Actions, and dynamic streaming.' },
    { skill: 'Frontend Testing (Playwright/Cypress)', priority: 'High', category: 'Testing & Quality', timeToLearnWeeks: 3, recommendedAction: 'Implement end-to-end automated user journey tests across critical checkout/auth flows.' },
    { skill: 'Web Performance & Core Web Vitals', priority: 'High', category: 'Frontend', timeToLearnWeeks: 2, recommendedAction: 'Profile rendering bottlenecks using Chrome DevTools Performance panel and optimize LCP/CLS.' },
    { skill: 'Advanced TypeScript Generics', priority: 'High', category: 'Language', timeToLearnWeeks: 2, recommendedAction: 'Write type-safe utility libraries and polymorphic component interfaces.' },
  ],
  'System Architect': [
    { skill: 'Distributed Systems & CAP Theorem', priority: 'Critical', category: 'Architecture', timeToLearnWeeks: 6, recommendedAction: 'Design fault-tolerant distributed caches, consensus protocols, and rate limiters.' },
    { skill: 'Kubernetes Orchestration', priority: 'Critical', category: 'Cloud & DevOps', timeToLearnWeeks: 6, recommendedAction: 'Deploy multi-pod applications with Ingress controllers, Helm charts, and HPA autoscaling.' },
    { skill: 'High-Volume Stream Processing', priority: 'High', category: 'Data & Queues', timeToLearnWeeks: 4, recommendedAction: 'Implement event-driven consumer groups with Apache Kafka and partition balancing.' },
  ],
};

function generateFallbackSkillGap(currentSkills, targetRole) {
  const normalizedRole = Object.keys(ROLE_BENCHMARKS).find((r) =>
    targetRole.toLowerCase().includes(r.toLowerCase())
  ) || 'Full-Stack Developer';

  const benchmark = ROLE_BENCHMARKS[normalizedRole] || ROLE_BENCHMARKS['Full-Stack Developer'];

  const existing = currentSkills.filter((s) => {
    const sl = s.toLowerCase();
    return (
      sl.includes('react') ||
      sl.includes('node') ||
      sl.includes('javascript') ||
      sl.includes('typescript') ||
      sl.includes('git') ||
      sl.includes('html') ||
      sl.includes('css') ||
      sl.includes('python') ||
      sl.includes('mongo')
    );
  });

  const missing = benchmark.filter((b) =>
    !currentSkills.some((s) => s.toLowerCase().includes(b.skill.toLowerCase().split(' ')[0]))
  );

  const matchedRatio = Math.max(0.5, Math.min(0.9, existing.length / (existing.length + missing.length || 1)));
  const readinessScore = Math.round(matchedRatio * 100);

  return {
    targetRole,
    readinessScore,
    existingSkills: existing.length > 0 ? existing : currentSkills.slice(0, 5),
    missingSkills: missing.length > 0 ? missing : benchmark.slice(0, 4),
    overallAnalysis: `You currently possess ${readinessScore}% of the core technical requirements for ${targetRole}. Focus immediately on the Critical gaps (testing and containerization) to significantly increase your interview conversion rate.`,
  };
}
