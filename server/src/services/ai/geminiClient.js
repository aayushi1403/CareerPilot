import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

/**
 * Check if a valid Gemini API key is configured in the environment
 * @returns {boolean}
 */
export function isGeminiConfigured() {
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  return Boolean(
    key &&
    key.trim().length > 10 &&
    !key.includes('your_google_gemini_api_key') &&
    key.startsWith('AIza')
  );
}

/**
 * Get configured ChatGoogleGenerativeAI instance
 * @param {Object} [options]
 * @returns {ChatGoogleGenerativeAI}
 */
export function getGeminiModel(options = {}) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  return new ChatGoogleGenerativeAI({
    apiKey: apiKey || 'dummy-key',
    model: modelName,
    temperature: options.temperature ?? 0.2,
    maxRetries: options.maxRetries ?? 2,
    ...options,
  });
}

/**
 * Get configured GoogleGenerativeAIEmbeddings instance
 * @param {Object} [options]
 * @returns {GoogleGenerativeAIEmbeddings}
 */
export function getGeminiEmbeddings(options = {}) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const modelName = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';

  return new GoogleGenerativeAIEmbeddings({
    apiKey: apiKey || 'dummy-key',
    model: modelName,
    ...options,
  });
}

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'to', 'for', 'of',
  'with', 'by', 'from', 'as', 'that', 'this', 'it', 'what', 'how', 'do', 'i', 'you',
  'be', 'are', 'was', 'were', 'been', 'will', 'would', 'should', 'could', 'can'
]);

/**
 * Generates a deterministic high-dimensional embedding vector (2048 dimensions)
 * from text tokens and prefix stems with stop-word filtering and L2 normalization.
 * Used for deterministic testing and graceful fallback when offline or key is unset.
 *
 * @param {string} text
 * @param {number} [dimensions=2048]
 * @returns {number[]}
 */
export function generateDeterministicEmbedding(text, dimensions = 2048) {
  const vector = new Array(dimensions).fill(0);
  if (!text || typeof text !== 'string') return vector;

  const clean = text.toLowerCase();
  const allWords = clean.match(/\b\w+\b/g) || [];
  const words = allWords.filter((w) => !STOP_WORDS.has(w) && w.length > 2);

  if (words.length === 0) {
    return vector;
  }

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash * 31 + word.charCodeAt(c)) & 0xffffffff;
    }
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 2.0;

    // Word stem prefix (4 chars) for vocabulary inflection matching
    if (word.length >= 4) {
      const stem = word.slice(0, 4);
      let stemHash = 0;
      for (let c = 0; c < 4; c++) {
        stemHash = (stemHash * 31 + stem.charCodeAt(c)) & 0xffffffff;
      }
      const stemIdx = Math.abs(stemHash) % dimensions;
      vector[stemIdx] += 0.8;
    }
  }

  // L2 normalize
  let norm = 0;
  for (let k = 0; k < dimensions; k++) {
    norm += vector[k] * vector[k];
  }
  norm = Math.sqrt(norm) || 1;
  for (let k = 0; k < dimensions; k++) {
    vector[k] /= norm;
  }
  return vector;
}

/**
 * Embed a single text query using Gemini or fallback
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function embedText(text) {
  if (isGeminiConfigured()) {
    try {
      const embeddings = getGeminiEmbeddings();
      return await embeddings.embedQuery(text);
    } catch (err) {
      console.warn(`[Gemini Embeddings Warning]: ${err.message}. Using deterministic fallback.`);
    }
  }
  return generateDeterministicEmbedding(text);
}

/**
 * Embed multiple texts using Gemini or fallback
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
export async function embedDocuments(texts) {
  if (!Array.isArray(texts) || texts.length === 0) return [];
  if (isGeminiConfigured()) {
    try {
      const embeddings = getGeminiEmbeddings();
      return await embeddings.embedDocuments(texts);
    } catch (err) {
      console.warn(`[Gemini Embeddings Warning]: ${err.message}. Using deterministic fallback.`);
    }
  }
  return texts.map((t) => generateDeterministicEmbedding(t));
}

/**
 * Robust execution wrapper that executes a LangChain prompt with structured output
 * and gracefully falls back to deterministic domain logic on rate limit or lack of key.
 *
 * @template T
 * @param {Object} params
 * @param {Array|string} params.promptMessages - Formatted messages or string prompt
 * @param {import('zod').ZodSchema<T>} params.schema - Zod validation schema
 * @param {() => T|Promise<T>} params.fallbackFn - Fallback generator matching schema
 * @param {Object} [params.modelOptions] - Options passed to getGeminiModel
 * @returns {Promise<{ data: T, isAiGenerated: boolean, model: string, note?: string }>}
 */
export async function invokeStructuredAi({ promptMessages, schema, fallbackFn, modelOptions = {} }) {
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  if (!isGeminiConfigured()) {
    const fallbackData = await fallbackFn();
    const validated = schema.parse(fallbackData);
    return {
      data: validated,
      isAiGenerated: false,
      model: 'fallback-heuristics',
      note: 'Gemini API key not configured in backend .env. Response generated using deterministic domain analysis.',
    };
  }

  try {
    const model = getGeminiModel(modelOptions);
    const structuredModel = model.withStructuredOutput(schema);
    const rawResult = await structuredModel.invoke(promptMessages);
    const validated = schema.parse(rawResult);

    return {
      data: validated,
      isAiGenerated: true,
      model: modelName,
    };
  } catch (err) {
    console.warn(`[Gemini AI Invocation Warning]: ${err.message}. Falling back to domain heuristics.`);
    const fallbackData = await fallbackFn();
    const validated = schema.parse(fallbackData);

    return {
      data: validated,
      isAiGenerated: false,
      model: 'fallback-heuristics',
      note: `AI call interrupted (${err.message.slice(0, 100)}). Safely recovered with verified domain heuristics.`,
    };
  }
}
