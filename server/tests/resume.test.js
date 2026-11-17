import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { setupMockDb, resetMemoryStore } from './mockDb.js';

setupMockDb();

test('Resume API Test Suite', async (t) => {
  resetMemoryStore();

  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Elena Rostova',
      email: 'elena@demo.dev',
      password: 'Password123!',
    });

  const authToken = regRes.body.data.token;
  let createdResumeId = '';

  await t.test('POST /api/resumes/upload - Successfully upload and parse resume', async () => {
    // Create a mock PDF buffer
    const mockPdfBuffer = Buffer.from('%PDF-1.4 Mock Resume Document Content for testing');

    const res = await request(app)
      .post('/api/resumes/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('resume', mockPdfBuffer, 'elena_resume.pdf');

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.resume.originalName, 'elena_resume.pdf');
    assert.ok(res.body.data.resume.atsScore >= 70, 'ATS score should be calculated');
    assert.strictEqual(res.body.data.resume.status, 'analyzed');

    createdResumeId = String(res.body.data.resume._id);
  });

  await t.test('POST /api/resumes/upload - Fail when no file provided', async () => {
    const res = await request(app)
      .post('/api/resumes/upload')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  await t.test('GET /api/resumes - Retrieve all uploaded resumes for user', async () => {
    const res = await request(app)
      .get('/api/resumes')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.count, 1);
    assert.strictEqual(res.body.data.resumes[0].originalName, 'elena_resume.pdf');
  });

  await t.test('GET /api/resumes/:id - Retrieve single resume by ID', async () => {
    const res = await request(app)
      .get(`/api/resumes/${createdResumeId}`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(String(res.body.data.resume._id), createdResumeId);
  });

  await t.test('DELETE /api/resumes/:id - Delete uploaded resume', async () => {
    const res = await request(app)
      .delete(`/api/resumes/${createdResumeId}`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);

    // Verify list is now empty
    const checkRes = await request(app)
      .get('/api/resumes')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(checkRes.body.data.count, 0);
  });
});

