import { ChromaClient } from 'chromadb';
import { embedText, embedDocuments } from '../ai/geminiClient.js';

export const COLLECTIONS = {
  KNOWLEDGE: 'careerpilot_knowledge',
  RESUMES: 'careerpilot_resumes',
};

/**
 * Calculates cosine similarity between two normalized or raw vectors
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dot / denominator;
}

/**
 * Evaluates whether metadata matches a Chroma-style where query
 * @param {Object} metadata
 * @param {Object} filter
 * @returns {boolean}
 */
export function matchesFilter(metadata, filter) {
  if (!filter || typeof filter !== 'object' || Object.keys(filter).length === 0) {
    return true;
  }

  for (const [key, condition] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(condition)) {
      const matchAny = condition.some((sub) => matchesFilter(metadata, sub));
      if (!matchAny) return false;
    } else if (key === '$and' && Array.isArray(condition)) {
      const matchAll = condition.every((sub) => matchesFilter(metadata, sub));
      if (!matchAll) return false;
    } else if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
      if ('$eq' in condition && metadata[key] !== condition.$eq) return false;
      if ('$ne' in condition && metadata[key] === condition.$ne) return false;
      if ('$in' in condition && Array.isArray(condition.$in) && !condition.$in.includes(metadata[key])) {
        return false;
      }
    } else if (metadata[key] !== condition) {
      return false;
    }
  }

  return true;
}

/**
 * In-memory fallback adapter that mirrors ChromaDB's Collection API
 */
class InMemoryCollection {
  constructor(name) {
    this.name = name;
    this.records = []; // { id, document, metadata, embedding }
  }

  async count() {
    return this.records.length;
  }

  async add({ ids, embeddings, metadatas, documents }) {
    for (let i = 0; i < ids.length; i++) {
      const existingIdx = this.records.findIndex((r) => r.id === ids[i]);
      const record = {
        id: ids[i],
        document: documents[i],
        metadata: metadatas ? metadatas[i] : {},
        embedding: embeddings[i],
      };

      if (existingIdx >= 0) {
        this.records[existingIdx] = record;
      } else {
        this.records.push(record);
      }
    }
    return true;
  }

  async query({ queryEmbeddings, nResults = 4, where = {} }) {
    const queryEmb = queryEmbeddings[0];
    const filtered = this.records.filter((rec) => matchesFilter(rec.metadata, where));

    // Calculate similarity scores
    const scored = filtered.map((rec) => {
      const score = cosineSimilarity(queryEmb, rec.embedding);
      return {
        rec,
        score,
        distance: 1.0 - Math.max(0, score),
      };
    });

    // Sort descending by similarity
    scored.sort((a, b) => b.score - a.score);
    const topResults = scored.slice(0, nResults);

    return {
      ids: [topResults.map((r) => r.rec.id)],
      documents: [topResults.map((r) => r.rec.document)],
      metadatas: [topResults.map((r) => r.rec.metadata)],
      distances: [topResults.map((r) => r.distance)],
    };
  }

  async get({ ids, where } = {}) {
    let results = this.records;
    if (ids && ids.length > 0) {
      results = results.filter((r) => ids.includes(r.id));
    }
    if (where && Object.keys(where).length > 0) {
      results = results.filter((r) => matchesFilter(r.metadata, where));
    }
    return {
      ids: results.map((r) => r.id),
      documents: results.map((r) => r.document),
      metadatas: results.map((r) => r.metadata),
    };
  }

  async delete({ ids, where } = {}) {
    this.records = this.records.filter((r) => {
      if (ids && ids.includes(r.id)) return false;
      if (where && matchesFilter(r.metadata, where)) return false;
      return true;
    });
    return true;
  }
}

/**
 * Chroma Vector Store Manager with automatic offline fallback
 */
export class ChromaVectorStore {
  constructor(options = {}) {
    this.chromaUrl = options.chromaUrl || process.env.CHROMA_URL || 'http://localhost:8000';
    this.isConnected = false;
    this.client = null;
    this.collections = new Map();
    this.inMemoryFallback = new Map();
  }

  /**
   * Initialize connection to ChromaDB daemon or activate fallback
   */
  async init() {
    try {
      let host = 'localhost';
      let port = 8000;
      let ssl = false;

      try {
        const parsed = new URL(this.chromaUrl);
        host = parsed.hostname;
        port = parseInt(parsed.port, 10) || 8000;
        ssl = parsed.protocol === 'https:';
      } catch {
        // Fall back to default
      }

      this.client = new ChromaClient({ host, port, ssl });
      await this.client.heartbeat();
      this.isConnected = true;
      console.log(`[ChromaDB]: Successfully connected to Chroma instance at ${this.chromaUrl}`);
    } catch (err) {
      this.isConnected = false;
      console.log(
        `[ChromaDB Notice]: Chroma server not reachable at ${this.chromaUrl} (${err.message}). Using high-performance in-memory vector store adapter.`
      );
    }

    // Ensure standard collections exist
    await this.getOrCreateCollection(COLLECTIONS.KNOWLEDGE);
    await this.getOrCreateCollection(COLLECTIONS.RESUMES);
  }

  /**
   * Get or create a named collection
   * @param {string} name
   */
  async getOrCreateCollection(name) {
    if (this.isConnected && this.client) {
      try {
        const col = await this.client.getOrCreateCollection({ name });
        this.collections.set(name, col);
        return col;
      } catch (err) {
        console.warn(`[ChromaDB Collection Warning]: ${err.message}. Falling back to memory collection.`);
      }
    }

    if (!this.inMemoryFallback.has(name)) {
      this.inMemoryFallback.set(name, new InMemoryCollection(name));
    }
    return this.inMemoryFallback.get(name);
  }

  /**
   * Ingest processed chunks into a collection
   *
   * @param {string} collectionName
   * @param {Array<{ id: string, text: string, metadata: Object }>} chunks
   * @returns {Promise<{ insertedCount: number, collectionName: string }>}
   */
  async addChunks(collectionName, chunks) {
    if (!chunks || chunks.length === 0) {
      return { insertedCount: 0, collectionName };
    }

    const collection = await this.getOrCreateCollection(collectionName);
    const ids = chunks.map((c) => c.id);
    const documents = chunks.map((c) => c.text);
    const metadatas = chunks.map((c) => c.metadata);

    // Generate vector embeddings using Gemini with deterministic fallback
    const embeddings = await embedDocuments(documents);

    await collection.add({
      ids,
      embeddings,
      metadatas,
      documents,
    });

    return {
      insertedCount: chunks.length,
      collectionName,
    };
  }

  /**
   * Similarity search across collection with metadata filtering and user isolation
   *
   * @param {string} collectionName
   * @param {string} queryText
   * @param {Object} [options]
   * @param {number} [options.nResults=4]
   * @param {Object} [options.filter={}]
   * @param {string} [options.userId] - If set, enforces user ownership isolation
   * @returns {Promise<Array<{ id: string, text: string, metadata: Object, score: number, distance: number }>>}
   */
  async similaritySearch(collectionName, queryText, options = {}) {
    const { nResults = 4, filter = {}, userId = null } = options;
    const collection = await this.getOrCreateCollection(collectionName);

    // Generate query embedding
    const queryEmbedding = await embedText(queryText);

    // Build strict isolation filter
    const effectiveFilter = { ...filter };
    if (userId) {
      if (collectionName === COLLECTIONS.RESUMES) {
        // Strict user resume isolation: user can only see their own resumes
        effectiveFilter.userId = String(userId);
      } else {
        // Knowledge collection: allow user's documents and global knowledge
        effectiveFilter.$or = [{ userId: String(userId) }, { userId: 'global' }];
      }
    }

    const result = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults,
      where: Object.keys(effectiveFilter).length > 0 ? effectiveFilter : undefined,
    });

    const ids = result.ids?.[0] || [];
    const documents = result.documents?.[0] || [];
    const metadatas = result.metadatas?.[0] || [];
    const distances = result.distances?.[0] || [];

    return ids.map((id, index) => {
      const distance = distances[index] ?? 0;
      const score = Math.max(0, 1.0 - distance);
      return {
        id,
        text: documents[index] || '',
        metadata: metadatas[index] || {},
        distance,
        score,
      };
    });
  }

  /**
   * Delete documents belonging to a specific docId and userId
   *
   * @param {string} collectionName
   * @param {string} docId
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async deleteDocument(collectionName, docId, userId) {
    const collection = await this.getOrCreateCollection(collectionName);
    const filter = {
      docId: String(docId),
      userId: String(userId),
    };

    await collection.delete({ where: filter });
    return true;
  }

  /**
   * Get vector store status and collection counts
   */
  async getStats() {
    const stats = {
      isConnectedToChroma: this.isConnected,
      provider: this.isConnected ? 'chromadb' : 'in-memory-adapter',
      chromaUrl: this.chromaUrl,
      collections: {},
    };

    for (const name of [COLLECTIONS.KNOWLEDGE, COLLECTIONS.RESUMES]) {
      try {
        const col = await this.getOrCreateCollection(name);
        stats.collections[name] = await col.count();
      } catch {
        stats.collections[name] = 0;
      }
    }

    return stats;
  }
}

// Global singleton instance
export const vectorStore = new ChromaVectorStore();
