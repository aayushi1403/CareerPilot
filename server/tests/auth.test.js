import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { setupMockDb, resetMemoryStore } from './mockDb.js';

setupMockDb();

test('Auth API Test Suite', async (t) => {
  resetMemoryStore();

  let authToken = '';

  await t.test('POST /api/auth/register - Successfully register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alex Johnson',
        email: 'alex.johnson@demo.dev',
        password: 'Password123!',
        targetJobRole: 'Full-Stack Developer',
        skills: ['React', 'Node.js', 'TypeScript'],
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.email, 'alex.johnson@demo.dev');
    assert.ok(res.body.data.token, 'Token should be returned');
    assert.strictEqual(res.body.data.user.password, undefined, 'Password should not be returned');

    authToken = res.body.data.token;
  });

  await t.test('POST /api/auth/register - Fail on missing required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'incomplete@demo.dev',
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(Array.isArray(res.body.errors));
  });

  await t.test('POST /api/auth/register - Fail on duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another User',
        email: 'alex.johnson@demo.dev',
        password: 'Password123!',
      });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.success, false);
  });

  await t.test('POST /api/auth/login - Successfully login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex.johnson@demo.dev',
        password: 'Password123!',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.name, 'Alex Johnson');
  });

  await t.test('POST /api/auth/login - Fail with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex.johnson@demo.dev',
        password: 'WrongPassword!',
      });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  await t.test('GET /api/auth/me - Retrieve current authenticated user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.email, 'alex.johnson@demo.dev');
  });

  await t.test('GET /api/auth/me - Fail when no token provided', async () => {
    const res = await request(app).get('/api/auth/me');

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  await t.test('POST /api/auth/logout - Logout successfully', async () => {
    const res = await request(app).post('/api/auth/logout');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });
});

