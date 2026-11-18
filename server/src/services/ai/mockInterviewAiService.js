import { z } from 'zod';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { invokeStructuredAi } from './geminiClient.js';

export const InterviewQuestionsSchema = z.object({
  role: z.string().describe('Job role'),
  difficulty: z.string().describe('Difficulty level'),
  questions: z
    .array(
      z.object({
        id: z.string().describe('Unique identifier'),
        question: z.string().describe('The interview question text'),
        category: z.string().describe('Category or technical domain (e.g. React, System Design, Node.js)'),
        difficulty: z.enum(['easy', 'medium', 'hard']),
        tips: z.array(z.string()).describe('Practical advice on how to structure the response'),
        sampleAnswer: z.string().describe('Exemplary model answer demonstrating technical depth'),
      })
    )
    .min(1)
    .max(6),
});

export const AnswerEvaluationSchema = z.object({
  score: z.number().min(0).max(100).describe('Score out of 100'),
  summary: z.string().describe('Concise summary of candidate answer quality'),
  strengths: z.array(z.string()).describe('Points well explained by the candidate'),
  weaknesses: z.array(z.string()).describe('Missing points, inaccuracies, or areas lacking depth'),
  feedback: z.string().describe('Constructive coaching feedback for improvement'),
  suggestedImprovements: z.array(z.string()).describe('Actionable suggestions to improve response structure'),
  idealAnswerKeyPoints: z.array(z.string()).describe('Core elements top engineering interviewers look for'),
});

const questionsPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are a Senior Principal Interviewer at a premier technology company.
Generate realistic, high-signal technical interview questions tailored to the specified role, category, and difficulty.

Ensure the questions test practical engineering depth, system tradeoffs, and real-world problem solving rather than trivia.`,
  ],
  [
    'human',
    `Generate technical interview questions:
Role: {role}
Category: {category}
Difficulty: {difficulty}
Number of questions: {count}

For each question, provide practical answering tips and a comprehensive model answer.`,
  ],
]);

const evaluationPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are a Senior Technical Interviewer assessing a candidate's response in an engineering interview.
Evaluate the candidate's answer thoroughly and fairly based on:
1. Technical accuracy and depth.
2. Recognition of tradeoffs, edge cases, and architectural best practices.
3. Communication clarity and structure.

Provide constructive coaching and score the response objectively between 0 and 100.`,
  ],
  [
    'human',
    `Evaluate this interview answer:

Role: {role}
Question: {question}
Candidate's Submitted Answer:
"""
{userAnswer}
"""

Provide an objective score, strengths, weaknesses, constructive feedback, and ideal key points.`,
  ],
]);

/**
 * Generate role-specific interview questions
 * @param {Object} params
 * @param {string} params.role
 * @param {string} params.category
 * @param {string} params.difficulty
 * @param {number} [params.count]
 * @returns {Promise<Object>}
 */
export async function generateInterviewQuestionsAi({
  role = 'Full-Stack Developer',
  category = 'React',
  difficulty = 'medium',
  count = 3,
}) {
  const safeCount = Math.min(5, Math.max(1, Number(count) || 3));
  const safeDifficulty = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';

  const promptMessages = await questionsPrompt.formatMessages({
    role,
    category: category || 'General Engineering',
    difficulty: safeDifficulty,
    count: safeCount,
  });

  return invokeStructuredAi({
    promptMessages,
    schema: InterviewQuestionsSchema,
    fallbackFn: () => generateFallbackQuestions(role, category, safeDifficulty, safeCount),
    modelOptions: { temperature: 0.4 },
  });
}

/**
 * Evaluate a user-submitted answer to an interview question
 * @param {Object} params
 * @param {string} params.role
 * @param {string} params.question
 * @param {string} params.userAnswer
 * @returns {Promise<Object>}
 */
export async function evaluateInterviewAnswerAi({
  role = 'Full-Stack Developer',
  question,
  userAnswer,
}) {
  const safeQuestion = question || 'Explain how you approach software architecture.';
  const safeAnswer = (userAnswer || '').trim();

  if (!safeAnswer || safeAnswer.length < 15) {
    return {
      data: {
        score: 30,
        summary: 'The submitted answer is too brief to adequately assess technical depth.',
        strengths: ['Attempted to address the question.'],
        weaknesses: ['Insufficient technical detail', 'No explanation of tradeoffs or architecture'],
        feedback: 'Please provide a more detailed response explaining core concepts, practical experience, and tradeoffs.',
        suggestedImprovements: ['Structure your response using the STAR method or definition -> tradeoff -> example pattern.'],
        idealAnswerKeyPoints: ['Clear definition of technical principles', 'Specific production example', 'Tradeoff considerations'],
      },
      isAiGenerated: false,
      model: 'rule-evaluator',
    };
  }

  const promptMessages = await evaluationPrompt.formatMessages({
    role,
    question: safeQuestion,
    userAnswer: safeAnswer,
  });

  return invokeStructuredAi({
    promptMessages,
    schema: AnswerEvaluationSchema,
    fallbackFn: () => generateFallbackEvaluation(safeQuestion, safeAnswer),
    modelOptions: { temperature: 0.2 },
  });
}

function generateFallbackQuestions(role, category, difficulty, count) {
  const library = [
    {
      id: `q-gen-1`,
      question: `How do you optimize state management and re-rendering performance in a complex ${category} application?`,
      category: category || 'Frontend',
      difficulty,
      tips: [
        'Mention state colocation, memoization (useMemo/useCallback/React.memo), and immutable updates.',
        'Discuss profiling tools like Chrome DevTools or React Profiler.',
      ],
      sampleAnswer:
        'I optimize re-renders by keeping state as local as possible, splitting monolithic context providers into distinct domain contexts, and utilizing memoization hooks only when profiling identifies substantial component compute costs.',
    },
    {
      id: `q-gen-2`,
      question: `Explain how you would design a resilient, fault-tolerant API service in ${role.includes('Full') ? 'Node.js' : 'production'}.`,
      category: 'Backend & Architecture',
      difficulty,
      tips: [
        'Discuss graceful shutdowns, circuit breakers, rate limiting, and centralized error middleware.',
        'Highlight monitoring with Prometheus/OpenTelemetry.',
      ],
      sampleAnswer:
        'A resilient API handles unhandled promise rejections gracefully, implements rate limiting with Redis token buckets to prevent noisy neighbors, applies exponential backoff for third-party calls, and exposes structured health endpoints for load balancers.',
    },
    {
      id: `q-gen-3`,
      question: `Describe a situation where you had to debug an intermittent race condition or performance regression.`,
      category: 'System Design & Debugging',
      difficulty,
      tips: [
        'Use the STAR method: Situation, Task, Action, Result.',
        'Emphasize root-cause isolation and preventative testing.',
      ],
      sampleAnswer:
        'In a distributed ordering flow, simultaneous requests occasionally caused double charges due to lack of idempotency keys. I introduced unique idempotency keys in Redis with short TTL locks, preventing duplicate processing and reducing error rates to zero.',
    },
  ];

  return {
    role,
    difficulty,
    questions: library.slice(0, count),
  };
}

function generateFallbackEvaluation(question, userAnswer) {
  const words = userAnswer.split(/\s+/).length;

  let score = 70;
  if (words > 80) score += 12;
  if (words > 150) score += 6;
  if (/tradeoff|performance|scalab|test|metric|latenc|error/i.test(userAnswer)) score += 6;

  score = Math.min(94, Math.max(55, score));

  return {
    score,
    summary: 'Solid foundational understanding demonstrated with clear technical communication.',
    strengths: [
      'Addressed the core question with relevant concepts and terminology.',
      'Demonstrated structured logical flow in the explanation.',
    ],
    weaknesses: [
      'Could provide more concrete production numbers or latency/throughput figures.',
      'Could explicitly discuss alternative approaches and their tradeoffs.',
    ],
    feedback: `Your response shows clear domain familiarity with ${question.slice(0, 50)}... To elevate this to a top-percentile engineering interview answer, always contrast your preferred solution with alternative approaches and explain why your chosen design was optimal.`,
    suggestedImprovements: [
      'Include a brief real-world production war-story demonstrating this in practice.',
      'Mention how you would test and monitor this system in production.',
    ],
    idealAnswerKeyPoints: [
      'Fundamental theoretical definition',
      'Production tradeoffs (latency vs throughput vs complexity)',
      'Real-world implementation example',
    ],
  };
}
