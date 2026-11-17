import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { setupMockDb, resetMemoryStore } from './mockDb.js';

setupMockDb();

test('Job API Test Suite', async (t) => {
  resetMemoryStore();

  await t.test('GET /api/jobs - Retrieve list of jobs with default pagination', async () => {
    const res = await request(app).get('/api/jobs');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.jobs.length > 0, 'Should return jobs');
    assert.strictEqual(res.body.data.page, 1);
  });

  await t.test('GET /api/jobs?type=Full-time - Filter jobs by employment type', async () => {
    const res = await request(app).get('/api/jobs?type=Full-time');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.jobs.every((j) => j.type === 'Full-time'));
  });

  await t.test('GET /api/jobs/:id - Retrieve job by ID', async () => {
    const listRes = await request(app).get('/api/jobs');
    const firstJobId = listRes.body.data.jobs[0]._id;

    const res = await request(app).get(`/api/jobs/${firstJobId}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.job._id, firstJobId);
  });

  await t.test('GET /api/jobs/:id - Return 404 for non-existent job ID', async () => {
    const res = await request(app).get('/api/jobs/nonexistent_job_id');

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
  });
});

