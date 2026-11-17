import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { setupMockDb, resetMemoryStore } from './mockDb.js';

setupMockDb();

test('Career Roadmap API Test Suite', async (t) => {
  resetMemoryStore();

  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'David Miller',
      email: 'david.miller@demo.dev',
      password: 'Password123!',
      targetJobRole: 'AI / Full-Stack Engineer',
    });

  const authToken = regRes.body.data.token;
  let roadmapId = '';

  await t.test('POST /api/roadmaps - Create new personalized career roadmap', async () => {
    const res = await request(app)
      .post('/api/roadmaps')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentRole: 'Junior Developer',
        targetRole: 'Senior Full-Stack Engineer',
        timelineMonths: 12,
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.roadmap.currentRole, 'Junior Developer');
    assert.strictEqual(res.body.data.roadmap.targetRole, 'Senior Full-Stack Engineer');
    assert.ok(res.body.data.roadmap.phases.length > 0, 'Roadmap should have default phases');

    roadmapId = String(res.body.data.roadmap._id);
  });

  await t.test('GET /api/roadmaps - Retrieve active roadmap for user', async () => {
    const res = await request(app)
      .get('/api/roadmaps')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.roadmap.targetRole, 'Senior Full-Stack Engineer');
  });

  await t.test('GET /api/roadmaps/:id - Retrieve roadmap by ID', async () => {
    const res = await request(app)
      .get(`/api/roadmaps/${roadmapId}`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(String(res.body.data.roadmap._id), roadmapId);
  });

  await t.test('PATCH /api/roadmaps/:id/progress - Update phase and project progress', async () => {
    const res = await request(app)
      .patch(`/api/roadmaps/${roadmapId}/progress`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        phaseNumber: 2,
        phaseStatus: 'completed',
        projectTitle: 'Full-Stack Task & Workspace API',
        projectCompleted: true,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.roadmap.overallProgress >= 0);
  });
});

