import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import JSZip from 'jszip';
import app from '../src/app.js';
import { setupMockDb, resetMemoryStore } from './mockDb.js';

setupMockDb();

// Helper to build a minimal valid PDF with selectable text
function createValidPdfBuffer() {
  const content = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length 230 >> stream
BT /F1 12 Tf 72 712 Td (Elena Rostova) Tj ET
BT /F1 10 Tf 72 690 Td (elena@demo.dev | 555-123-4567 | San Francisco, CA) Tj ET
BT /F1 10 Tf 72 670 Td (Skills: React, JavaScript, TypeScript, Node.js, Git, Docker, MongoDB) Tj ET
endstream endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000224 00000 n 
0000000295 00000 n 
trailer << /Root 1 0 R /Size 6 >>
startxref
576
%%EOF`;
  return Buffer.from(content);
}

// Helper to build a valid DOCX with selectable text
async function createValidDocxBuffer() {
  const zip = new JSZip();
  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'
  );
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
  );
  zip.file(
    'word/document.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Elena Rostova</w:t></w:r></w:p><w:p><w:r><w:t>elena@demo.dev | 555-987-6543 | New York, NY</w:t></w:r></w:p><w:p><w:r><w:t>Skills: React, Node.js, TypeScript, Python, Docker</w:t></w:r></w:p></w:body></w:document>'
  );
  return await zip.generateAsync({ type: 'nodebuffer' });
}

test('Resume Processing Pipeline Test Suite', async (t) => {
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

  await t.test('POST /api/resumes/upload - Successfully upload and extract PDF resume', async () => {
    const validPdfBuffer = createValidPdfBuffer();

    const res = await request(app)
      .post('/api/resumes/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('resume', validPdfBuffer, 'elena_resume.pdf');

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.resume.originalName, 'elena_resume.pdf');
    assert.strictEqual(res.body.data.resume.extractionStatus, 'completed');
    assert.ok(res.body.data.resume.rawText.includes('Elena Rostova'));
    assert.strictEqual(res.body.data.resume.structuredData.contact.name, 'Elena Rostova');
    assert.strictEqual(res.body.data.resume.structuredData.contact.email, 'elena@demo.dev');
    assert.ok(res.body.data.resume.structuredData.skills.includes('React'));
    assert.ok(res.body.data.resume.atsScore >= 70, 'ATS score should be >= 70');
    assert.strictEqual(res.body.data.resume.status, 'analyzed');

    createdResumeId = String(res.body.data.resume._id);
  });

  await t.test('POST /api/resumes/upload - Successfully upload and extract DOCX resume', async () => {
    const validDocxBuffer = await createValidDocxBuffer();

    const res = await request(app)
      .post('/api/resumes/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('resume', validDocxBuffer, 'elena_resume.docx');

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.resume.originalName, 'elena_resume.docx');
    assert.strictEqual(res.body.data.resume.extractionStatus, 'completed');
    assert.ok(res.body.data.resume.rawText.includes('Elena Rostova'));
    assert.strictEqual(res.body.data.resume.structuredData.contact.name, 'Elena Rostova');
    assert.ok(res.body.data.resume.structuredData.skills.includes('Node.js'));
  });

  await t.test('POST /api/resumes/upload - Handle empty or scanned document appropriately', async () => {
    // Minimal PDF with virtually no text content (scanned/empty)
    const emptyPdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj
4 0 obj << /Length 0 >> stream
endstream endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000213 00000 n 
trailer << /Root 1 0 R /Size 5 >>
startxref
263
%%EOF`;

    const res = await request(app)
      .post('/api/resumes/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('resume', Buffer.from(emptyPdfContent), 'scanned_image.pdf');

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.data.resume.extractionStatus, 'scanned_or_empty');
    assert.ok(res.body.data.resume.extractionError.includes('scanned'));
  });

  await t.test('POST /api/resumes/upload - Reject unsupported file format (.exe)', async () => {
    const maliciousBuffer = Buffer.from('MZ executable binary data');

    const res = await request(app)
      .post('/api/resumes/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('resume', maliciousBuffer, 'malicious.exe');

    // Multer rejects with 500 error handled by error middleware
    assert.strictEqual(res.status >= 400, true);
    assert.strictEqual(res.body.success, false);
  });

  await t.test('POST /api/resumes/upload - Fail when no file provided', async () => {
    const res = await request(app)
      .post('/api/resumes/upload')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  await t.test('POST /api/resumes/upload - Fail when unauthenticated', async () => {
    const validPdfBuffer = createValidPdfBuffer();

    const res = await request(app)
      .post('/api/resumes/upload')
      .attach('resume', validPdfBuffer, 'elena_resume.pdf');

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  await t.test('GET /api/resumes - Retrieve all uploaded resumes for user', async () => {
    const res = await request(app)
      .get('/api/resumes')
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.count >= 2);
  });

  await t.test('GET /api/resumes/:id - Retrieve single resume by ID', async () => {
    const res = await request(app)
      .get(`/api/resumes/${createdResumeId}`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(String(res.body.data.resume._id), createdResumeId);
    assert.strictEqual(res.body.data.resume.structuredData.contact.name, 'Elena Rostova');
  });

  await t.test('DELETE /api/resumes/:id - Delete uploaded resume', async () => {
    const res = await request(app)
      .delete(`/api/resumes/${createdResumeId}`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });
});
