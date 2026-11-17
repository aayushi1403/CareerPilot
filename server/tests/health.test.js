import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';

test('Health and Error Handling Test Suite', async (t) => {
  await t.test('GET /api/health - Returns healthy service status', async () => {
    const res = await request(app).get('/api/health');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'healthy');
    assert.strictEqual(res.body.service, 'CareerPilot Backend API');
    assert.ok(res.body.timestamp);
  });

  await t.test('GET /api/unknown-route - Returns structured 404 response', async () => {
    const res = await request(app).get('/api/unknown-route');

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('not found'));
  });
});

