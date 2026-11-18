import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { extractTextFromFile } from '../resumeParserService.js';

export const SUPPORTED_DOC_TYPES = [
  'career_guide',
  'skill_benchmark',
  'interview_prep',
  'job_description',
  'resume',
];

/**
 * Default text splitter configuration for career guidance documents
 */
export const defaultTextSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 600,
  chunkOverlap: 120,
  separators: ['\n\n', '\n', '. ', ' ', ''],
});

/**
 * Clean and normalize text before chunking
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove null bytes and unusual control chars
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Split text into chunks with rich metadata
 *
 * @param {Object} params
 * @param {string} params.text - Document content text
 * @param {string} params.docId - Unique identifier for the document
 * @param {string} params.title - Human readable title (e.g. "React Engineering Guide")
 * @param {string} [params.source] - Document source filename, URL, or identifier
 * @param {string} [params.docType='career_guide'] - Document category
 * @param {string} [params.userId='global'] - Document owner ('global' or specific user ID)
 * @param {RecursiveCharacterTextSplitter} [params.splitter] - Optional custom splitter
 * @returns {Promise<Array<{ id: string, text: string, metadata: Object, document: Document }>>}
 */
export async function splitDocumentIntoChunks({
  text,
  docId,
  title,
  source = 'knowledge_base',
  docType = 'career_guide',
  userId = 'global',
  splitter = defaultTextSplitter,
}) {
  const normalized = normalizeText(text);
  if (!normalized) {
    return [];
  }

  const rawChunks = await splitter.splitText(normalized);
  const totalChunks = rawChunks.length;
  const createdAt = new Date().toISOString();

  return rawChunks.map((chunkText, idx) => {
    const chunkId = `${docId}_chunk_${idx}`;
    const metadata = {
      docId: String(docId),
      title: String(title),
      source: String(source),
      docType: SUPPORTED_DOC_TYPES.includes(docType) ? docType : 'career_guide',
      userId: String(userId),
      chunkIndex: idx,
      totalChunks,
      createdAt,
    };

    return {
      id: chunkId,
      text: chunkText,
      metadata,
      document: new Document({
        pageContent: chunkText,
        metadata,
      }),
    };
  });
}

/**
 * Process a file (PDF, DOCX, or text) from path or buffer and produce chunks
 *
 * @param {Object} params
 * @param {string} params.filePath
 * @param {string} params.mimeType
 * @param {Buffer} [params.buffer]
 * @param {string} params.docId
 * @param {string} params.title
 * @param {string} [params.docType='resume']
 * @param {string} [params.userId='global']
 * @returns {Promise<{ rawText: string, chunks: Array<Object>, metadata: Object }>}
 */
export async function processFileDocument({
  filePath,
  mimeType,
  buffer,
  docId,
  title,
  docType = 'resume',
  userId = 'global',
}) {
  const extraction = await extractTextFromFile(filePath, mimeType, buffer);
  const rawText = extraction.rawText || '';

  const chunks = await splitDocumentIntoChunks({
    text: rawText,
    docId,
    title,
    source: filePath || title,
    docType,
    userId,
  });

  return {
    rawText,
    chunks,
    metadata: extraction.metadata,
    extractionStatus: extraction.extractionStatus,
  };
}
