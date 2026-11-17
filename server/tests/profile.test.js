import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { setupMockDb, resetMemoryStore } from './mockDb.js';

setupMockDb();

test('Profile API Test Suite', async (t) => {
  resetMemoryStore();

  // Register a user to obtain auth token
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Sarah Connor',
      email: 'sarah.connor@demo.dev',
      password: 'Password123!',
      targetJobRole: 'Frontend Engineer',
    });

  const authToken = regRes.body.data.token;

  await t.test('GET /api/profile - Retrieve profile for authenticated user', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.profile.name, 'Sarah Connor');
    assert.strictEqual(res.body.data.profile.email, 'sarah.connor@demo.dev');
  });

  await t.test('PUT /api/profile - Update profile fields (education, skills, role)', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        targetJobRole: 'Lead Full-Stack Engineer',
        skills: ['React', 'Next.js', 'PostgreSQL', 'Docker'],
        graduationYear: '2024',
        experienceLevel: 'Senior',
        bio: 'Passionate developer dedicated to engineering modern web architectures.',
        education: [
          {
            degree: 'B.S. in Computer Science',
            school: 'Stanford University',
            year: '2020-2024',
            gpa: '3.9',
          },
        ],
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.profile.targetJobRole, 'Lead Full-Stack Engineer');
    assert.strictEqual(res.body.data.profile.graduationYear, '2024');
    assert.strictEqual(res.body.data.profile.skills.length, 4);
    assert.strictEqual(res.body.data.profile.education[0].school, 'Stanford University');
  });

  await t.test('GET /api/profile - Reject unauthorized requests without token', async () => {
    const res = await request(app).get('/api/profile');

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });
});

