import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { setupMockDb, resetMemoryStore } from './mockDb.js';

setupMockDb();

test('AI Features & LangChain Integration Test Suite', async (t) => {
  resetMemoryStore();

  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Sarah Connor',
      email: 'sarah@skynet.dev',
      password: 'Password123!',
      targetJobRole: 'Full-Stack Developer',
      skills: ['React', 'Node.js', 'TypeScript', 'Docker', 'PostgreSQL'],
    });

  const authToken = regRes.body.data.token;

  await t.test('POST /api/ai/resume/analyze - Successfully analyze resume text with structured output', async () => {
    const resumeText = `
      Sarah Connor
      sarah@skynet.dev | San Francisco, CA
      Skills: React, TypeScript, Node.js, Express, PostgreSQL, Docker, AWS
      Experience:
      Software Engineer at Cyberdyne Systems (2022 - Present)
      - Developed responsive web applications using React and TypeScript.
      - Built REST APIs in Node.js and deployed containerized services with Docker on AWS.
      Education:
      B.S. in Computer Science, Stanford University (2018 - 2022)
    `;

    const res = await request(app)
      .post('/api/ai/resume/analyze')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ resumeText });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.analysis);
    assert.ok(typeof res.body.data.analysis.summary === 'string');
    assert.ok(Array.isArray(res.body.data.analysis.technicalSkills));
    assert.ok(Array.isArray(res.body.data.analysis.softSkills));
    assert.ok(Array.isArray(res.body.data.analysis.strengths));
    assert.ok(Array.isArray(res.body.data.analysis.weaknesses));
    assert.ok(Array.isArray(res.body.data.analysis.improvementSuggestions));
    assert.ok(res.body.data.analysis.atsFeedback.score >= 0);
  });

  await t.test('POST /api/ai/resume/analyze - Reject when no resume text or upload is present', async () => {
    const res = await request(app)
      .post('/api/ai/resume/analyze')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ resumeText: '' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  await t.test('POST /api/ai/career/recommend - Generate structured career recommendations', async () => {
    const res = await request(app)
      .post('/api/ai/career/recommend')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        targetRole: 'Full-Stack Developer',
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.recommendations);
    assert.ok(Array.isArray(res.body.data.recommendations.recommendedRoles));
    assert.ok(res.body.data.recommendations.recommendedRoles.length >= 1);
    const firstRole = res.body.data.recommendations.recommendedRoles[0];
    assert.ok(firstRole.title);
    assert.ok(firstRole.matchPercentage >= 0);
    assert.ok(Array.isArray(firstRole.reasons));
    assert.ok(Array.isArray(firstRole.requiredSkills));
  });

  await t.test('POST /api/ai/skills/gap-analysis - Compare current skills against target role', async () => {
    const res = await request(app)
      .post('/api/ai/skills/gap-analysis')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        targetRole: 'Full-Stack Developer',
        currentSkills: ['React', 'JavaScript', 'HTML', 'CSS'],
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.skillGap);
    assert.strictEqual(res.body.data.skillGap.targetRole, 'Full-Stack Developer');
    assert.ok(typeof res.body.data.skillGap.readinessScore === 'number');
    assert.ok(Array.isArray(res.body.data.skillGap.existingSkills));
    assert.ok(Array.isArray(res.body.data.skillGap.missingSkills));
    assert.ok(res.body.data.skillGap.missingSkills.length >= 1);
    assert.ok(['Critical', 'High', 'Medium', 'Low'].includes(res.body.data.skillGap.missingSkills[0].priority));
  });

  await t.test('POST /api/ai/roadmap/generate - Generate structured chronological roadmap', async () => {
    const res = await request(app)
      .post('/api/ai/roadmap/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentRole: 'Junior Developer',
        targetRole: 'Full-Stack Developer',
        timelineMonths: 6,
        currentSkills: ['React', 'JavaScript'],
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.roadmap);
    assert.strictEqual(res.body.data.roadmap.targetRole, 'Full-Stack Developer');
    assert.ok(Array.isArray(res.body.data.roadmap.phases));
    assert.ok(res.body.data.roadmap.phases.length >= 2);
    assert.ok(res.body.data.roadmap.phases[0].projects.length >= 1);
  });

  await t.test('POST /api/ai/interview/questions - Generate role-specific interview questions', async () => {
    const res = await request(app)
      .post('/api/ai/interview/questions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        role: 'Full-Stack Developer',
        category: 'React',
        difficulty: 'medium',
        count: 2,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.interview);
    assert.ok(Array.isArray(res.body.data.interview.questions));
    assert.ok(res.body.data.interview.questions.length >= 1);
    assert.ok(res.body.data.interview.questions[0].question);
    assert.ok(Array.isArray(res.body.data.interview.questions[0].tips));
    assert.ok(res.body.data.interview.questions[0].sampleAnswer);
  });

  await t.test('POST /api/ai/interview/evaluate - Evaluate candidate interview response', async () => {
    const res = await request(app)
      .post('/api/ai/interview/evaluate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        role: 'Full-Stack Developer',
        question: 'How do you optimize React re-rendering performance?',
        userAnswer:
          'I use React.memo and useMemo for computationally expensive derivations. I also ensure state is colocated as close to leaf nodes as possible rather than lifting everything to top-level context, which prevents unnecessary component re-renders across the whole tree.',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.evaluation);
    assert.ok(res.body.data.evaluation.score >= 50);
    assert.ok(Array.isArray(res.body.data.evaluation.strengths));
    assert.ok(Array.isArray(res.body.data.evaluation.weaknesses));
    assert.ok(res.body.data.evaluation.feedback);
  });

  await t.test('POST /api/ai/interview/evaluate - Reject empty answer with 400', async () => {
    const res = await request(app)
      .post('/api/ai/interview/evaluate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        role: 'Full-Stack Developer',
        question: 'Tell me about a time you handled a bug.',
        userAnswer: '',
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  await t.test('POST /api/ai/* - Reject unauthorized request without token', async () => {
    const res = await request(app)
      .post('/api/ai/resume/analyze')
      .send({ resumeText: 'Test' });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });
});
