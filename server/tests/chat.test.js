import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { setupMockDb, resetMemoryStore } from './mockDb.js';

setupMockDb();

test('Chat History API Test Suite', async (t) => {
  resetMemoryStore();

  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Maya Lin',
      email: 'maya.lin@demo.dev',
      password: 'Password123!',
    });

  const authToken = regRes.body.data.token;
  let conversationId = '';

  await t.test('POST /api/chat - Save initial message and create conversation', async () => {
    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Interview Preparation for Stripe',
        message: {
          sender: 'user',
          text: 'How should I explain the JavaScript event loop in my Stripe interview?',
        },
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.chat.title, 'Interview Preparation for Stripe');
    assert.strictEqual(res.body.data.chat.messages.length, 1);

    conversationId = String(res.body.data.chat._id);
  });

  await t.test('POST /api/chat - Append assistant response to existing conversation', async () => {
    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        conversationId,
        message: {
          sender: 'assistant',
          text: 'Focus on explaining the call stack, microtask queue, and Web APIs cleanly.',
        },
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.chat.messages.length, 2);
  });

  await t.test('GET /api/chat - Retrieve list of previous conversations', async () => {
    const res = await request(app)
      .get('/api/chat')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.count, 1);
    assert.strictEqual(res.body.data.conversations[0].title, 'Interview Preparation for Stripe');
  });

  await t.test('GET /api/chat/:id - Retrieve full conversation messages', async () => {
    const res = await request(app)
      .get(`/api/chat/${conversationId}`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.chat.messages.length, 2);
  });

  await t.test('DELETE /api/chat/:id - Delete conversation', async () => {
    const res = await request(app)
      .delete(`/api/chat/${conversationId}`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);

    const checkRes = await request(app)
      .get('/api/chat')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(checkRes.body.data.count, 0);
  });
});

