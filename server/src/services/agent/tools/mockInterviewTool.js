import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import {
  generateInterviewQuestionsAi,
  evaluateInterviewAnswerAi,
} from '../../ai/mockInterviewAiService.js';

export const mockInterviewSchema = z.object({
  action: z
    .enum(['generate_questions', 'evaluate_answer'])
    .describe('Action to perform: "generate_questions" or "evaluate_answer"'),
  role: z
    .string()
    .optional()
    .describe('Target role for interview practice, e.g. "Backend Developer", "Full-Stack Engineer"'),
  category: z
    .string()
    .optional()
    .describe('Category: "technical", "behavioral", "system_design", or a tech topic like "Node.js"'),
  difficulty: z
    .enum(['Junior', 'Mid-Level', 'Senior'])
    .optional()
    .describe('Difficulty level of the interview questions (default "Mid-Level")'),
  count: z
    .number()
    .min(1)
    .max(5)
    .optional()
    .describe('Number of questions to generate (1-5, default 3)'),
  question: z
    .string()
    .optional()
    .describe('The interview question being answered (required when action is "evaluate_answer")'),
  userAnswer: z
    .string()
    .optional()
    .describe('The candidate response to evaluate (required when action is "evaluate_answer")'),
});

/**
 * Creates the mock_interview_tool bound to user context
 * @param {Object} user - Authenticated user object
 * @returns {import('@langchain/core/tools').StructuredTool}
 */
export function createMockInterviewTool(user) {
  return tool(
    async ({ action, role, category = 'technical', difficulty = 'Mid-Level', count = 3, question, userAnswer }) => {
      try {
        const effectiveRole = role || user?.targetJobRole || 'Full-Stack Developer';

        if (action === 'generate_questions') {
          const result = await generateInterviewQuestionsAi({
            role: effectiveRole,
            category,
            difficulty: difficulty.toLowerCase(),
            count,
          });

          return JSON.stringify({
            action: 'generate_questions',
            role: effectiveRole,
            difficulty,
            category,
            questions: result.data.questions,
          });
        }

        if (action === 'evaluate_answer') {
          if (!userAnswer || userAnswer.trim().length === 0) {
            return JSON.stringify({
              error: 'userAnswer is required when evaluating an interview answer.',
            });
          }

          const effectiveQuestion = question || 'General technical architectural interview question';

          const result = await evaluateInterviewAnswerAi({
            role: effectiveRole,
            question: effectiveQuestion,
            userAnswer,
          });

          return JSON.stringify({
            action: 'evaluate_answer',
            role: effectiveRole,
            question: effectiveQuestion,
            evaluation: result.data,
          });
        }

        return JSON.stringify({
          error: `Unsupported action: ${action}. Use 'generate_questions' or 'evaluate_answer'.`,
        });
      } catch (err) {
        return JSON.stringify({
          error: `Mock interview tool failed: ${err.message}`,
          action,
        });
      }
    },
    {
      name: 'mock_interview_tool',
      description: 'Generates role-specific technical and behavioral interview questions, or evaluates candidate interview answers with detailed scoring and constructive feedback.',
      schema: mockInterviewSchema,
    }
  );
}
