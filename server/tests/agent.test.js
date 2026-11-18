import { test, describe, before, beforeEach } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { setupMockDb, resetMemoryStore } from './mockDb.js';
import { generateToken } from '../src/utils/jwt.js';
import { initializeAgentTools, TOOL_DEFINITIONS } from '../src/services/agent/tools/index.js';
import { executeCareerAgent } from '../src/services/agent/careerAgent.js';
import { ChromaVectorStore } from '../src/services/rag/chromaVectorStore.js';
import { seedKnowledgeBase } from '../src/services/rag/knowledgeSeeder.js';
import User from '../src/models/User.js';
import Resume from '../src/models/Resume.js';

describe('Tool-Enabled AI Career Agent Test Suite', () => {
  let userA;
  let userB;
  let tokenA;
  let testStore;
  let resumeB;

  before(async () => {
    setupMockDb();

    // Isolated test vector store seeded with verified career knowledge
    testStore = new ChromaVectorStore();
    await testStore.init();
    await seedKnowledgeBase(testStore);
  });

  beforeEach(async () => {
    resetMemoryStore();

    // Create User A (Backend Aspirant)
    userA = new User({
      name: 'Alex Mercer',
      email: 'alex.mercer@agenttest.com',
      password: 'Password123!',
      targetJobRole: 'Backend Developer',
      skills: ['JavaScript', 'Node.js', 'Express', 'Git'],
    });
    await userA.save();
    tokenA = generateToken({ id: userA._id });

    // Create User B
    userB = new User({
      name: 'Samantha Lee',
      email: 'samantha.lee@agenttest.com',
      password: 'Password123!',
      targetJobRole: 'Frontend Developer',
      skills: ['React', 'CSS'],
    });
    await userB.save();

    // Seed User A's Resume
    const resumeA = new Resume({
      userId: userA._id,
      fileName: 'alex_mercer_resume.pdf',
      originalName: 'alex_mercer_resume.pdf',
      fileSize: 45000,
      mimeType: 'application/pdf',
      filePath: '/uploads/alex_resume.pdf',
      rawText: `Alex Mercer - Software Engineer
Skills: JavaScript, Node.js, Express, MongoDB, Git
Experience: Built RESTful APIs using Express and MongoDB.`,
      structuredData: {
        skills: ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'Git'],
      },
      atsScore: 82,
      overallScore: 85,
    });
    await resumeA.save();

    // Seed User B's Private Resume
    resumeB = new Resume({
      userId: userB._id,
      fileName: 'samantha_secret_cv.pdf',
      originalName: 'samantha_secret_cv.pdf',
      fileSize: 48000,
      mimeType: 'application/pdf',
      filePath: '/uploads/samantha_secret.pdf',
      rawText: `Samantha Lee - Confidential Cryptographer at Stealth Quantum Inc.`,
      structuredData: {
        skills: ['Quantum Cryptography', 'Rust', 'Assembly'],
      },
      atsScore: 90,
      overallScore: 92,
    });
    await resumeB.save();
  });

  // ── 1. Tool Catalog & Metadata Descriptors ────────────────────
  test('Agent Tools - All 6 required tools are defined and registered with schemas', () => {
    const { toolsList, toolsMap } = initializeAgentTools(userA);

    assert.strictEqual(toolsList.length, 6, 'Should register exactly 6 tools');
    assert.strictEqual(TOOL_DEFINITIONS.length, 6, 'Tool definition catalog should have 6 entries');

    const expectedTools = [
      'resume_analyzer',
      'skill_gap_analyzer',
      'career_roadmap_generator',
      'job_recommendation_tool',
      'rag_retriever',
      'mock_interview_tool',
    ];

    for (const toolName of expectedTools) {
      assert.ok(toolsMap.has(toolName), `Tool ${toolName} must be present in registry`);
      const toolInstance = toolsMap.get(toolName);
      assert.ok(toolInstance.description, `${toolName} must have a description`);
      assert.ok(toolInstance.schema, `${toolName} must have a Zod input schema`);
    }
  });

  // ── 2. Tool 1: resume_analyzer (Privacy & Data Isolation) ─────
  test('Tool: resume_analyzer - Analyzes user resume with strict privacy isolation', async () => {
    const { toolsMap } = initializeAgentTools(userA);
    const resumeTool = toolsMap.get('resume_analyzer');

    // User A analyzes their resume
    const resRaw = await resumeTool.invoke({});
    const res = JSON.parse(resRaw);

    assert.strictEqual(res.resumeFound, true);
    assert.strictEqual(res.fileName, 'alex_mercer_resume.pdf');
    assert.ok(res.atsScore > 0);
    assert.ok(Array.isArray(res.technicalSkills));
    assert.ok(res.technicalSkills.includes('Node.js'));

    // Attempt to access User B's resume with User A's tool instance
    const hackAttemptRaw = await resumeTool.invoke({ resumeId: String(resumeB._id) });
    const hackRes = JSON.parse(hackAttemptRaw);
    assert.strictEqual(
      hackRes.resumeFound,
      false,
      'User A must NOT be able to access User B resume via ID spoofing'
    );
  });

  // ── 3. Tool 2: skill_gap_analyzer ──────────────────────────────
  test('Tool: skill_gap_analyzer - Identifies missing skills against target role', async () => {
    const { toolsMap } = initializeAgentTools(userA);
    const gapTool = toolsMap.get('skill_gap_analyzer');

    const resRaw = await gapTool.invoke({
      targetRole: 'Backend Developer',
      currentSkills: ['JavaScript', 'Node.js'],
    });
    const res = JSON.parse(resRaw);

    assert.strictEqual(res.targetRole, 'Backend Developer');
    assert.ok(typeof res.matchPercentage === 'number');
    assert.ok(Array.isArray(res.missingSkills));
    assert.ok(res.missingSkills.length > 0, 'Should find missing skills for full backend role');
  });

  // ── 4. Tool 3: career_roadmap_generator ────────────────────────
  test('Tool: career_roadmap_generator - Creates chronological learning milestones', async () => {
    const { toolsMap } = initializeAgentTools(userA);
    const roadmapTool = toolsMap.get('career_roadmap_generator');

    const resRaw = await roadmapTool.invoke({
      targetRole: 'Backend Developer',
      timelineMonths: 6,
    });
    const res = JSON.parse(resRaw);

    assert.strictEqual(res.targetRole, 'Backend Developer');
    assert.strictEqual(res.timelineMonths, 6);
    assert.ok(Array.isArray(res.phases));
    assert.ok(res.phases.length >= 2, 'Should have multiple learning phases');
    assert.ok(res.phases[0].phase, 'Phase should have a name');
    assert.ok(Array.isArray(res.recommendedProjects), 'Should suggest capstone projects');
  });

  // ── 5. Tool 4: job_recommendation_tool ─────────────────────────
  test('Tool: job_recommendation_tool - Retrieves and ranks matching jobs', async () => {
    const { toolsMap } = initializeAgentTools(userA);
    const jobTool = toolsMap.get('job_recommendation_tool');

    const resRaw = await jobTool.invoke({
      role: 'Backend',
      skills: ['Node.js', 'Express', 'MongoDB'],
      limit: 3,
    });
    const res = JSON.parse(resRaw);

    assert.ok(Array.isArray(res.jobs));
    assert.ok(res.jobs.length > 0, 'Should return matching jobs');
    assert.ok(res.jobs[0].matchScore >= 50, 'Job should carry a calculated match score');
    assert.ok(res.jobs[0].title);
    assert.ok(res.jobs[0].company);
  });

  // ── 6. Tool 5: rag_retriever ───────────────────────────────────
  test('Tool: rag_retriever - Retrieves verified knowledge passages with citations', async () => {
    const { toolsMap } = initializeAgentTools(userA, { customStore: testStore });
    const ragTool = toolsMap.get('rag_retriever');

    const resRaw = await ragTool.invoke({
      query: 'Backend Engineering architecture and database indexing',
      maxResults: 2,
    });
    const res = JSON.parse(resRaw);

    assert.ok(res.retrievedCount > 0);
    assert.ok(Array.isArray(res.passages));
    assert.strictEqual(res.passages[0].title, 'Backend Engineering Career Track & Competency Guide');
    assert.ok(res.passages[0].content.length > 50);
  });

  // ── 7. Tool 6: mock_interview_tool ─────────────────────────────
  test('Tool: mock_interview_tool - Supports question generation and answer evaluation', async () => {
    const { toolsMap } = initializeAgentTools(userA);
    const interviewTool = toolsMap.get('mock_interview_tool');

    // 1. Question Generation
    const qRaw = await interviewTool.invoke({
      action: 'generate_questions',
      role: 'Backend Developer',
      count: 2,
    });
    const qRes = JSON.parse(qRaw);
    assert.strictEqual(qRes.action, 'generate_questions');
    assert.ok(Array.isArray(qRes.questions));
    assert.ok(qRes.questions.length >= 1);
    assert.ok(qRes.questions[0].question);

    // 2. Answer Evaluation
    const evalRaw = await interviewTool.invoke({
      action: 'evaluate_answer',
      role: 'Backend Developer',
      question: 'How do you handle database connection pooling in high traffic Node.js applications?',
      userAnswer: 'In Node.js with MongoDB/PostgreSQL, I configure a connection pool size based on concurrent worker capacity, reuse open sockets, and implement connection health checks to avoid starvation.',
    });
    const evalRes = JSON.parse(evalRaw);
    assert.strictEqual(evalRes.action, 'evaluate_answer');
    assert.ok(evalRes.evaluation.score >= 50);
    assert.ok(evalRes.evaluation.feedback);
  });

  // ── 8. End-to-End Composite Workflow ───────────────────────────
  test('Agent Composite Workflow - Executes multi-tool readiness plan ("Am I ready to become a backend developer?")', async () => {
    const message = 'I want to become a backend developer. Am I ready?';
    const result = await executeCareerAgent({
      message,
      user: userA,
      options: { customStore: testStore },
    });

    assert.strictEqual(result.isAgentic, true);
    assert.ok(result.answer.length > 200, 'Agent should provide a comprehensive answer');
    assert.ok(Array.isArray(result.toolsUsed), 'Must report toolsUsed array');
    assert.ok(result.toolsUsed.length >= 3, 'Must execute multi-step tools for readiness workflow');

    // Check that expected tools were executed in the plan
    const toolNames = result.toolsUsed.map((t) => t.tool);
    assert.ok(toolNames.includes('resume_analyzer'), 'Must analyze user resume');
    assert.ok(toolNames.includes('rag_retriever'), 'Must retrieve verified requirements');
    assert.ok(toolNames.includes('skill_gap_analyzer'), 'Must compare skills');
    assert.ok(toolNames.includes('career_roadmap_generator'), 'Must generate roadmap');

    // Check transparency
    for (const t of result.toolsUsed) {
      assert.ok(t.tool);
      assert.ok(t.summary, 'Each tool must have a human-readable execution summary');
    }

    assert.ok(result.citations.length > 0, 'Must include supporting source citations');
    assert.ok(result.suggestedFollowUps.length > 0, 'Must recommend follow-up questions');
  });

  // ── 9. Loop Prevention & Execution Limits ──────────────────────
  test('Agent Loop Prevention - Honors maxIterations parameter', async () => {
    const result = await executeCareerAgent({
      message: 'Show me jobs',
      user: userA,
      options: { maxIterations: 3, customStore: testStore },
    });

    assert.ok(result.toolsUsed.length <= 3, 'Cannot exceed maxIterations');
  });

  // ── 10. API Route Tests ────────────────────────────────────────
  test('POST /api/agent/chat - Authenticated user initiates agent dialogue', async () => {
    const res = await request(app)
      .post('/api/agent/chat')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        message: 'What skills am I missing to become a Backend Developer?',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.answer);
    assert.ok(Array.isArray(res.body.data.toolsUsed));
    assert.strictEqual(res.body.data.isAgentic, true);
    assert.ok(res.body.data.conversationId);
  });

  test('POST /api/agent/chat - Rejects unauthenticated request with 401', async () => {
    const res = await request(app)
      .post('/api/agent/chat')
      .send({ message: 'Hello agent' });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  test('POST /api/agent/chat - Rejects empty message with 400', async () => {
    const res = await request(app)
      .post('/api/agent/chat')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ message: '   ' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  test('GET /api/agent/tools - Returns catalog of all available agent tools', async () => {
    const res = await request(app)
      .get('/api/agent/tools')
      .set('Authorization', `Bearer ${tokenA}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.count, 6);
    assert.ok(Array.isArray(res.body.data.tools));
  });
});
