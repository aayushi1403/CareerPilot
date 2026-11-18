import { createResumeAnalyzerTool } from './resumeAnalyzerTool.js';
import { createSkillGapTool } from './skillGapTool.js';
import { createRoadmapTool } from './roadmapTool.js';
import { createJobRecommendationTool } from './jobRecommendationTool.js';
import { createRagRetrieverTool } from './ragRetrieverTool.js';
import { createMockInterviewTool } from './mockInterviewTool.js';

export {
  createResumeAnalyzerTool,
  createSkillGapTool,
  createRoadmapTool,
  createJobRecommendationTool,
  createRagRetrieverTool,
  createMockInterviewTool,
};

/**
 * Metadata descriptors for all agent tools (for documentation and API clients)
 */
export const TOOL_DEFINITIONS = [
  {
    name: 'resume_analyzer',
    description: "Analyzes the authenticated user's uploaded resume to extract ATS score, technical skills, strengths, weaknesses, and improvement suggestions.",
    parameters: {
      resumeId: { type: 'string', required: false, description: 'Specific resume ID to analyze, or latest if omitted' },
    },
  },
  {
    name: 'skill_gap_analyzer',
    description: 'Compares existing candidate skills against a target role to identify missing skills, match percentage, and prioritized learning recommendations.',
    parameters: {
      targetRole: { type: 'string', required: true, description: 'Target career role (e.g. Backend Developer)' },
      currentSkills: { type: 'array of strings', required: false, description: 'Candidate skills, or auto-detected if omitted' },
    },
  },
  {
    name: 'career_roadmap_generator',
    description: 'Generates a structured, chronological career roadmap with learning phases, milestone objectives, skill targets, and project deliverables.',
    parameters: {
      targetRole: { type: 'string', required: true, description: 'Target career role' },
      currentRole: { type: 'string', required: false, description: 'Current background or starting point' },
      timelineMonths: { type: 'number', required: false, description: 'Target timeline in months (default 6)' },
      currentSkills: { type: 'array of strings', required: false, description: 'Current skills' },
    },
  },
  {
    name: 'job_recommendation_tool',
    description: 'Searches and ranks verified job opportunities matching candidate skills, target role, and employment preferences.',
    parameters: {
      role: { type: 'string', required: false, description: 'Role or keyword filter' },
      skills: { type: 'array of strings', required: false, description: 'Skills to match' },
      type: { type: 'string', required: false, description: 'Employment type (e.g. Full-time, Remote)' },
      limit: { type: 'number', required: false, description: 'Max jobs to return (default 4)' },
    },
  },
  {
    name: 'rag_retriever',
    description: 'Retrieves verified career guidance documents, engineering competency benchmarks, STAR interview strategies, and ATS standards from ChromaDB.',
    parameters: {
      query: { type: 'string', required: true, description: 'Search query for knowledge base' },
      docType: { type: 'string', required: false, description: 'Category filter (career_guide, interview_prep, etc.)' },
      maxResults: { type: 'number', required: false, description: 'Max chunks (default 3)' },
    },
  },
  {
    name: 'mock_interview_tool',
    description: 'Generates role-specific technical and behavioral interview questions, or evaluates candidate interview answers with detailed scoring and constructive feedback.',
    parameters: {
      action: { type: 'string', required: true, enum: ['generate_questions', 'evaluate_answer'] },
      role: { type: 'string', required: false, description: 'Target role' },
      category: { type: 'string', required: false, description: 'Category (technical, behavioral, etc.)' },
      difficulty: { type: 'string', required: false, enum: ['Junior', 'Mid-Level', 'Senior'] },
      count: { type: 'number', required: false, description: 'Number of questions (default 3)' },
      question: { type: 'string', required: false, description: 'Question being answered (for evaluation)' },
      userAnswer: { type: 'string', required: false, description: 'Candidate answer to evaluate' },
    },
  },
];

/**
 * Instantiates all tools bound to the user's authenticated context
 * @param {Object} user - Authenticated user
 * @param {Object} [options]
 * @param {import('../../rag/chromaVectorStore.js').ChromaVectorStore} [options.customStore]
 * @returns {Array<import('@langchain/core/tools').StructuredTool>}
 */
export function initializeAgentTools(user, options = {}) {
  const tools = [
    createResumeAnalyzerTool(user),
    createSkillGapTool(user),
    createRoadmapTool(user),
    createJobRecommendationTool(user),
    createRagRetrieverTool(user, options.customStore),
    createMockInterviewTool(user),
  ];

  const toolsMap = new Map();
  for (const t of tools) {
    toolsMap.set(t.name, t);
  }

  return {
    toolsList: tools,
    toolsMap,
  };
}
