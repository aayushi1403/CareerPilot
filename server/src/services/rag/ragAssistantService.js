import { z } from 'zod';
import { vectorStore, COLLECTIONS } from './chromaVectorStore.js';
import { splitDocumentIntoChunks } from './documentProcessor.js';
import { invokeStructuredAi } from '../ai/geminiClient.js';
import { seedKnowledgeBase } from './knowledgeSeeder.js';

export const ragAnswerSchema = z.object({
  answer: z.string().describe('Comprehensive markdown response grounded strictly in verified context with citations'),
  citations: z.array(
    z.object({
      title: z.string(),
      source: z.string(),
      docType: z.string(),
      snippet: z.string(),
    })
  ).describe('List of verified document sources used to formulate the answer'),
  confidence: z.enum(['high', 'medium', 'low']).describe('Confidence level of the grounded answer'),
  isGrounded: z.boolean().describe('Whether the answer is grounded in verified retrieved documents'),
  retrievedCount: z.number().describe('Number of context passages retrieved and utilized'),
  suggestedFollowUps: z.array(z.string()).describe('Recommended next questions for the candidate'),
});

let isKnowledgeSeeded = false;

/**
 * Ensure baseline verified career documents are loaded in vector store
 */
export async function ensureKnowledgeSeeded() {
  if (!isKnowledgeSeeded) {
    try {
      await vectorStore.init();
      const stats = await vectorStore.getStats();
      if ((stats.collections[COLLECTIONS.KNOWLEDGE] || 0) === 0) {
        await seedKnowledgeBase(vectorStore);
      }
      isKnowledgeSeeded = true;
    } catch (err) {
      console.warn(`[RAG Init Warning]: ${err.message}`);
    }
  }
}

/**
 * Index an uploaded user resume into the vector store
 *
 * @param {Object} resume - Mongoose Resume document or object
 * @param {import('./chromaVectorStore.js').ChromaVectorStore} [customStore=vectorStore]
 * @returns {Promise<{ chunkCount: number, docId: string }>}
 */
export async function indexUserResume(resume, customStore = vectorStore) {
  if (!resume || !resume.rawText || !resume.userId) {
    return { chunkCount: 0, docId: null };
  }

  if (customStore === vectorStore) {
    await ensureKnowledgeSeeded();
  }

  const docId = `resume_${resume._id}`;
  const chunks = await splitDocumentIntoChunks({
    text: resume.rawText,
    docId,
    title: `Candidate Resume (${resume.originalName || 'Uploaded Resume'})`,
    source: resume.originalName || 'resume.pdf',
    docType: 'resume',
    userId: String(resume.userId),
  });

  if (chunks.length > 0) {
    await customStore.addChunks(COLLECTIONS.RESUMES, chunks);
  }

  return {
    chunkCount: chunks.length,
    docId,
  };
}

/**
 * Check if query indicates candidate is asking about their own resume
 * @param {string} query
 * @returns {boolean}
 */
function isUserResumeQuery(query) {
  const q = query.toLowerCase();
  return (
    q.includes('my resume') ||
    q.includes('my cv') ||
    q.includes('my skills') ||
    q.includes('my experience') ||
    q.includes('my profile') ||
    q.includes('my project') ||
    q.includes('improve my') ||
    q.includes('score of my')
  );
}

/**
 * Generate deterministic grounded answer from retrieved chunks
 * Used as reliable fallback when Gemini API key is missing or offline
 */
function generateDeterministicGroundedResponse({ question, retrievedChunks, user, isOutOfDomain = false }) {
  // If no chunks retrieved, out-of-domain flag set, or top score is poor
  if (isOutOfDomain || !retrievedChunks || retrievedChunks.length === 0 || retrievedChunks[0].score < 0.14) {
    return {
      answer: `Based on the verified career knowledge base, I do not have sufficient information about "${question}" to provide a verified answer.

Our knowledge base currently covers:
- **Backend Engineering**: Node.js, Express, databases (MongoDB/SQL), caching (Redis), API security, and testing.
- **Modern React & Frontend**: React 18/19 hooks, state management, Vite, and Tailwind CSS v4.
- **Technical & Behavioral Interviews**: The STAR method, system design trade-offs, and live coding strategies.
- **Resume & ATS Optimization**: Google's XYZ impact formula and ATS layout guidelines.

Feel free to ask a question related to any of these verified career topics!`,
      citations: [],
      confidence: 'low',
      isGrounded: false,
      retrievedCount: 0,
      suggestedFollowUps: [
        'How do I structure my resume using the XYZ impact formula?',
        'What are the core technical requirements for a Backend Engineer?',
        'How should I explain my behavioral answers using the STAR method?',
      ],
    };
  }

  const primary = retrievedChunks[0];
  const secondary = retrievedChunks[1] || primary;
  const isResumeTopic = primary.metadata.docType === 'resume' || isUserResumeQuery(question);

  let answer = '';
  const citations = retrievedChunks.slice(0, 3).map((c) => ({
    title: c.metadata.title,
    source: c.metadata.source,
    docType: c.metadata.docType,
    snippet: c.text.slice(0, 160) + '...',
  }));

  if (isResumeTopic) {
    answer = `### Verified Career Guidance for Your Resume & Profile

Based on [Source: ${primary.metadata.title}], here are the verified findings:

1. **Strategic Framing**: ${primary.text.slice(0, 240).replace(/\n/g, ' ')}...
2. **Alignment & Impact**: To maximize your ATS match for target roles (${user?.targetJobRole || 'Software Engineer'}), structure bullet points using the **XYZ formula**: *"Accomplished [X] as measured by [Y], by doing [Z]"* [Source: High-Impact Tech Resume & ATS Optimization Blueprint].
3. **Recommended Action**: Ensure your technical skill list categorizes core technologies cleanly into Languages, Frontend, Backend, and Databases.`;
  } else {
    answer = `### Verified Analysis: ${primary.metadata.title}

${primary.text.slice(0, 320)}

### Key Career Takeaways
- **Industry Standard**: [Source: ${primary.metadata.title}] specifies key competencies essential for production readiness.
- **Execution Strategy**: ${secondary.text.slice(0, 220)}... [Source: ${secondary.metadata.title}].
- **Recommended Next Step**: Focus on building measurable projects that demonstrate these exact skills under realistic constraints.`;
  }

  return {
    answer,
    citations,
    confidence: primary.score > 0.4 ? 'high' : 'medium',
    isGrounded: true,
    retrievedCount: retrievedChunks.length,
    suggestedFollowUps: [
      `What are the most common interview questions for ${user?.targetJobRole || 'Full-Stack'} roles?`,
      'How can I measure the impact of my past engineering projects?',
      'What are the top production skills to add to my career roadmap?',
    ],
  };
}

/**
 * Answer a career question using the grounded RAG pipeline
 *
 * @param {Object} params
 * @param {string} params.question - Candidate's question
 * @param {Object} params.user - Current user object
 * @param {Object} [params.options]
 * @param {boolean} [params.options.includeUserResume=true]
 * @param {string} [params.options.filterDocType]
 * @param {number} [params.options.maxChunks=4]
 * @returns {Promise<{ data: z.infer<typeof ragAnswerSchema>, isAiGenerated: boolean, model: string }>}
 */
export async function answerCareerQuestion({
  question,
  user,
  options = {},
  customStore = vectorStore,
}) {
  if (customStore === vectorStore) {
    await ensureKnowledgeSeeded();
  }

  const { includeUserResume = true, filterDocType, maxChunks = 4 } = options;
  const shouldCheckResume = includeUserResume && (isUserResumeQuery(question) || !filterDocType);

  // 1. Retrieve knowledge base chunks
  const knowledgeFilter = {};
  if (filterDocType) {
    knowledgeFilter.docType = filterDocType;
  }

  const knowledgeMatches = await customStore.similaritySearch(
    COLLECTIONS.KNOWLEDGE,
    question,
    {
      nResults: maxChunks,
      filter: knowledgeFilter,
      userId: user?._id?.toString(),
    }
  );

  // 2. Retrieve user resume chunks if relevant and authorized
  let resumeMatches = [];
  if (shouldCheckResume && user?._id) {
    try {
      resumeMatches = await customStore.similaritySearch(
        COLLECTIONS.RESUMES,
        question,
        {
          nResults: 2,
          userId: user._id.toString(), // Strict user isolation
        }
      );
    } catch (resumeSearchErr) {
      console.warn(`[Resume Vector Search Warning]: ${resumeSearchErr.message}`);
    }
  }

  // Combine and sort retrieved chunks by similarity score
  const combinedChunks = [...knowledgeMatches, ...resumeMatches].sort((a, b) => b.score - a.score);
  const topChunks = combinedChunks.slice(0, maxChunks);

  // 3. Check for out-of-domain query
  const highestScore = topChunks.length > 0 ? topChunks[0].score : 0;
  const isOutOfDomain = highestScore < 0.14;

  // 4. Construct Grounded Prompt for Gemini
  const contextPassages = topChunks
    .map(
      (c, idx) =>
        `[Document ${idx + 1}: ${c.metadata.title} | Source: ${c.metadata.source} | Type: ${c.metadata.docType}]\n${c.text}`
    )
    .join('\n\n---\n\n');

  const promptMessages = [
    {
      role: 'system',
      content: `You are CareerPilot's verified AI Career Advisor.
Your mission is to provide accurate, truthful, and actionable career guidance based EXCLUSIVELY on the verified context provided below.

CRITICAL INSTRUCTIONS & HALLUCINATION CONTROL:
1. STRICT GROUNDING: Answer strictly and only using the provided verified context passages. Do NOT make up, assume, extrapolate, or hallucinate facts not present in the passages.
2. CITATIONS: You MUST cite every key insight, requirement, or recommendation using "[Source: Document Title]" syntax corresponding to the document source.
3. INSUFFICIENT CONTEXT: If the provided context does NOT contain enough information to answer the user's question, state clearly: "Based on the verified career knowledge base, I don't have sufficient information about [topic] to answer with certainty." Then suggest related career topics available in CareerPilot.
4. DISTINGUISH FACTS: Clearly separate verified benchmark facts from practical career suggestions.
5. FORMATTING: Use clean GitHub-flavored markdown with bullet points and bold emphasis.`,
    },
    {
      role: 'user',
      content: `VERIFIED KNOWLEDGE BASE CONTEXT:
${contextPassages || 'No matching verified documents found.'}

CANDIDATE PROFILE:
Name: ${user?.name || 'Candidate'}
Target Role: ${user?.targetJobRole || 'Software Engineer'}
Skills: ${(user?.skills || []).join(', ') || 'General Development'}

CANDIDATE QUESTION:
${question}

Please provide your grounded response with citations, confidence assessment, and recommended next questions.`,
    },
  ];

  // 5. Invoke Structured AI with fallback
  return await invokeStructuredAi({
    promptMessages,
    schema: ragAnswerSchema,
    fallbackFn: () => generateDeterministicGroundedResponse({ question, retrievedChunks: topChunks, user, isOutOfDomain }),
    modelOptions: { temperature: 0.1 },
  });
}
