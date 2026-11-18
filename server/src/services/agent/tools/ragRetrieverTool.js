import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { vectorStore, COLLECTIONS } from '../../rag/chromaVectorStore.js';
import { ensureKnowledgeSeeded } from '../../rag/ragAssistantService.js';

export const ragRetrieverSchema = z.object({
  query: z
    .string()
    .describe('Search query for career knowledge base, e.g. "STAR interview technique", "Backend engineering requirements", "ATS resume formatting"'),
  docType: z
    .enum(['career_guide', 'skill_benchmark', 'interview_prep', 'job_description'])
    .optional()
    .describe('Filter by specific document category'),
  maxResults: z
    .number()
    .min(1)
    .max(5)
    .optional()
    .describe('Maximum number of context chunks to retrieve (1-5, default 3)'),
});

/**
 * Creates the rag_retriever tool bound to vector store
 * @param {Object} user - Authenticated user object
 * @param {import('../../rag/chromaVectorStore.js').ChromaVectorStore} [customStore=vectorStore]
 * @returns {import('@langchain/core/tools').StructuredTool}
 */
export function createRagRetrieverTool(user, customStore = vectorStore) {
  return tool(
    async ({ query, docType, maxResults = 3 }) => {
      try {
        if (customStore === vectorStore) {
          await ensureKnowledgeSeeded();
        }

        const filter = {};
        if (docType) {
          filter.docType = docType;
        }

        const matches = await customStore.similaritySearch(COLLECTIONS.KNOWLEDGE, query, {
          nResults: maxResults,
          filter,
          userId: user?._id?.toString(),
        });

        const passages = matches.map((m, idx) => ({
          passageIndex: idx + 1,
          title: m.metadata.title,
          source: m.metadata.source,
          docType: m.metadata.docType,
          relevanceScore: Number(m.score.toFixed(3)),
          content: m.text,
        }));

        return JSON.stringify({
          query,
          retrievedCount: passages.length,
          passages,
        });
      } catch (err) {
        return JSON.stringify({
          error: `RAG knowledge retrieval failed: ${err.message}`,
          query,
          passages: [],
        });
      }
    },
    {
      name: 'rag_retriever',
      description: 'Retrieves verified career guidance documents, engineering competency benchmarks, STAR interview strategies, and ATS standards from the ChromaDB knowledge base.',
      schema: ragRetrieverSchema,
    }
  );
}
