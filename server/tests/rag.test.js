import { test, describe, before, beforeEach } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { setupMockDb, resetMemoryStore } from './mockDb.js';
import { generateToken } from '../src/utils/jwt.js';
import { splitDocumentIntoChunks } from '../src/services/rag/documentProcessor.js';
import { ChromaVectorStore, COLLECTIONS } from '../src/services/rag/chromaVectorStore.js';
import { seedKnowledgeBase } from '../src/services/rag/knowledgeSeeder.js';
import { answerCareerQuestion, indexUserResume } from '../src/services/rag/ragAssistantService.js';
import User from '../src/models/User.js';

describe('RAG Pipeline & Grounded Career Assistant Test Suite', () => {
  let userA;
  let userB;
  let tokenA;
  let _tokenB;
  let testStore;

  before(async () => {
    setupMockDb();

    // Initialize an isolated vector store for testing
    testStore = new ChromaVectorStore();
    await testStore.init();
    await seedKnowledgeBase(testStore);
  });

  beforeEach(async () => {
    resetMemoryStore();

    // Create User A
    userA = new User({
      name: 'Alex Mercer',
      email: 'alex.mercer@test.com',
      password: 'Password123!',
      targetJobRole: 'Backend Developer',
      skills: ['Node.js', 'Express', 'MongoDB'],
    });
    await userA.save();
    tokenA = generateToken({ id: userA._id });

    // Create User B
    userB = new User({
      name: 'Samantha Lee',
      email: 'samantha.lee@test.com',
      password: 'Password123!',
      targetJobRole: 'Frontend Developer',
      skills: ['React', 'CSS', 'HTML'],
    });
    await userB.save();
    _tokenB = generateToken({ id: userB._id });
  });

  // ── 1. Document Loading & Text Splitting ───────────────────────
  test('Document Processor - Splits text into meaningful chunks with preserved metadata', async () => {
    const textSample = `
# Backend Engineering Guide
Node.js and Express are essential for modern scalable web backends.
Layered architecture separates concerns between controllers and services.

## Database Optimization
Indexes dramatically accelerate lookup operations on high-volume collections.
Always analyze query execution plans with explain().
    `.repeat(10);

    const chunks = await splitDocumentIntoChunks({
      text: textSample,
      docId: 'doc_backend_101',
      title: 'Backend Scalability Handbook',
      source: 'handbook.md',
      docType: 'career_guide',
      userId: 'global',
    });

    assert.ok(chunks.length > 1, 'Document should be split into multiple chunks');
    assert.strictEqual(chunks[0].metadata.docId, 'doc_backend_101');
    assert.strictEqual(chunks[0].metadata.title, 'Backend Scalability Handbook');
    assert.strictEqual(chunks[0].metadata.docType, 'career_guide');
    assert.strictEqual(chunks[0].metadata.userId, 'global');
    assert.strictEqual(chunks[0].metadata.chunkIndex, 0);
    assert.strictEqual(chunks[0].metadata.totalChunks, chunks.length);
  });

  // ── 2. Vector Store Ingestion & Similarity Retrieval ───────────
  test('Vector Store - Ingests chunks and retrieves top-k relevant documents with cosine similarity', async () => {
    const query = 'How do I optimize database queries and indexes in Node.js?';
    const results = await testStore.similaritySearch(COLLECTIONS.KNOWLEDGE, query, {
      nResults: 3,
    });

    assert.ok(results.length > 0, 'Should return matching chunks');
    assert.ok(results[0].score > 0, 'Score should be positive');
    // Top result should be related to backend engineering or database guide
    const topTitle = results[0].metadata.title;
    assert.ok(
      topTitle.includes('Backend') || topTitle.includes('Full-Stack'),
      `Expected Backend Guide, received: ${topTitle}`
    );
  });

  // ── 3. Grounded Career Q&A with Citations ─────────────────────
  test('Grounded RAG Assistant - Answers career question with source citations', async () => {
    const question = 'What are the core technical requirements for a Backend Engineer?';
    const response = await answerCareerQuestion({
      question,
      user: userA,
      options: { includeUserResume: false },
      customStore: testStore,
    });

    assert.strictEqual(response.data.isGrounded, true);
    assert.ok(response.data.retrievedCount > 0);
    assert.ok(response.data.citations.length > 0, 'Must include citations');
    assert.ok(
      response.data.citations.some((c) => c.title.includes('Backend') || c.title.includes('Full-Stack')),
      'Should cite verified Backend document'
    );
    assert.ok(response.data.answer.includes('[Source:'), 'Answer must embed [Source: ...] citation tags');
  });

  // ── 4. Out-of-Domain & Insufficient Context Handling ──────────
  test('Grounded RAG Assistant - Handles unsupported out-of-domain queries without hallucinating', async () => {
    const question = 'What is the secret recipe for traditional Neapolitan pizza dough?';
    const response = await answerCareerQuestion({
      question,
      user: userA,
      customStore: testStore,
    });

    assert.strictEqual(response.data.isGrounded, false);
    assert.strictEqual(response.data.confidence, 'low');
    assert.ok(
      response.data.answer.toLowerCase().includes('sufficient information') ||
      response.data.answer.toLowerCase().includes('not present in the verified context') ||
      response.data.answer.toLowerCase().includes('knowledge base'),
      'Must politely report insufficient verified context'
    );
    assert.ok(response.data.suggestedFollowUps.length > 0, 'Must recommend valid career topics');
  });

  // ── 5. Strict User Data Isolation ─────────────────────────────
  test('User Data Isolation - User A cannot access or retrieve User B uploaded resume chunks', async () => {
    const secretResumeUserB = {
      _id: 'resume_b_secret_999',
      userId: userB._id,
      originalName: 'samantha_confidential_cv.pdf',
      rawText: 'CONFIDENTIAL WORK AT STEALTH STARTUP OMEGA: Secret proprietary quantum cryptography algorithms.',
    };

    // Index User B's secret resume into testStore
    await indexUserResume(secretResumeUserB, testStore);

    // User A queries for stealth startup quantum cryptography
    const query = 'What did Samantha work on at Stealth Startup Omega quantum cryptography?';

    // Search strictly under User A's identity
    const userAResults = await testStore.similaritySearch(COLLECTIONS.RESUMES, query, {
      userId: userA._id.toString(), // User A attempting to query
      nResults: 5,
    });

    // Verify User A receives ZERO results matching User B's confidential resume
    const leaked = userAResults.some((r) => r.metadata.userId === userB._id.toString());
    assert.strictEqual(leaked, false, 'Security violation: User A retrieved User B resume data!');

    // In contrast, User B querying their own resume CAN retrieve it
    const userBResults = await testStore.similaritySearch(COLLECTIONS.RESUMES, query, {
      userId: userB._id.toString(),
      nResults: 5,
    });
    assert.ok(userBResults.length > 0, 'User B should retrieve their own resume chunks');
    assert.strictEqual(userBResults[0].metadata.userId, userB._id.toString());
  });

  // ── 6. API Route Tests ─────────────────────────────────────────
  test('POST /api/rag/query - Authenticated query succeeds with grounded response', async () => {
    const res = await request(app)
      .post('/api/rag/query')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        question: 'How do I answer interview questions with the STAR method?',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.answer);
    assert.ok(Array.isArray(res.body.data.citations));
    assert.strictEqual(res.body.data.isGrounded, true);
    assert.ok(res.body.data.citations.some((c) => c.title.includes('STAR') || c.title.includes('Interview')));
  });

  test('POST /api/rag/query - Reject unauthenticated requests with 401', async () => {
    const res = await request(app)
      .post('/api/rag/query')
      .send({ question: 'How do I become a Senior Developer?' });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  test('POST /api/rag/query - Reject empty question with 400', async () => {
    const res = await request(app)
      .post('/api/rag/query')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ question: '   ' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  test('POST /api/rag/ingest - Ingest custom career document', async () => {
    const res = await request(app)
      .post('/api/rag/ingest')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Microservices Reliability Pattern Guide',
        text: 'Circuit breakers and exponential backoff retry policies prevent cascade failures in distributed systems. Health checks ensure traffic is only routed to healthy container replicas.',
        docType: 'career_guide',
        source: 'distributed-systems.md',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.totalChunks > 0);
  });

  test('GET /api/rag/status - Retrieve vector store status and verified topics', async () => {
    const res = await request(app)
      .get('/api/rag/status')
      .set('Authorization', `Bearer ${tokenA}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.status, 'active');
    assert.ok(Array.isArray(res.body.data.verifiedTopics));
    assert.ok(res.body.data.collections);
  });
});
