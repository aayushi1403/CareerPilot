import { answerCareerQuestion } from '../services/rag/ragAssistantService.js';
import { vectorStore, COLLECTIONS } from '../services/rag/chromaVectorStore.js';
import { splitDocumentIntoChunks } from '../services/rag/documentProcessor.js';
import Chat from '../models/Chat.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Query the Grounded AI Career Assistant (RAG Pipeline)
 * @route   POST /api/rag/query
 * @access  Private
 */
export const queryAssistant = async (req, res, next) => {
  try {
    const { question, filterDocType, includeUserResume = true, conversationId } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return errorResponse(res, 400, 'Please provide a valid question for the AI Career Assistant.');
    }

    const trimmedQuestion = question.trim();

    // 1. Execute Grounded RAG chain
    const result = await answerCareerQuestion({
      question: trimmedQuestion,
      user: req.user,
      options: {
        filterDocType,
        includeUserResume: Boolean(includeUserResume),
        maxChunks: 4,
      },
    });

    const { answer, citations, confidence, isGrounded, retrievedCount, suggestedFollowUps } = result.data;

    // 2. Persist message exchange to User's Chat history
    let activeChat = null;
    try {
      if (conversationId) {
        activeChat = await Chat.findOne({ _id: conversationId, userId: req.user._id });
      }

      if (!activeChat) {
        activeChat = new Chat({
          userId: req.user._id,
          title: trimmedQuestion.slice(0, 40) + (trimmedQuestion.length > 40 ? '...' : ''),
          messages: [],
        });
      }

      activeChat.messages.push({
        sender: 'user',
        text: trimmedQuestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      activeChat.messages.push({
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      await activeChat.save();
    } catch (chatPersistErr) {
      console.warn(`[Chat Persistence Warning]: ${chatPersistErr.message}`);
    }

    return successResponse(res, 200, 'Career guidance retrieved successfully', {
      answer,
      citations,
      confidence,
      isGrounded,
      retrievedCount,
      suggestedFollowUps,
      conversationId: activeChat?._id || null,
      isAiGenerated: result.isAiGenerated,
      model: result.model,
      note: result.note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ingest a new text or career document into vector store
 * @route   POST /api/rag/ingest
 * @access  Private
 */
export const ingestDocument = async (req, res, next) => {
  try {
    const { title, text, docType = 'career_guide', source = 'manual_ingest' } = req.body;

    if (!title || !text || typeof text !== 'string' || text.trim().length === 0) {
      return errorResponse(res, 400, 'Document title and non-empty text content are required.');
    }

    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userId = req.user.role === 'admin' ? 'global' : req.user._id.toString();
    const targetCollection = req.user.role === 'admin' ? COLLECTIONS.KNOWLEDGE : COLLECTIONS.RESUMES;

    const chunks = await splitDocumentIntoChunks({
      text: text.trim(),
      docId,
      title: title.trim(),
      source: source.trim(),
      docType,
      userId,
    });

    if (chunks.length === 0) {
      return errorResponse(res, 400, 'Unable to create valid document chunks from provided content.');
    }

    await vectorStore.addChunks(targetCollection, chunks);

    return successResponse(res, 201, 'Document successfully ingested and indexed into vector store', {
      docId,
      title,
      docType,
      targetCollection,
      totalChunks: chunks.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get RAG and vector store health and indexing status
 * @route   GET /api/rag/status
 * @access  Private
 */
export const getRagStatus = async (req, res, next) => {
  try {
    const stats = await vectorStore.getStats();

    return successResponse(res, 200, 'RAG vector store status retrieved', {
      status: 'active',
      ...stats,
      embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004',
      verifiedTopics: [
        'Backend Engineering Career Track & Competency Guide',
        'Modern React & Frontend Developer Competency Framework',
        'Technical & Behavioral Interview Mastery (STAR Framework)',
        'High-Impact Tech Resume & ATS Optimization Blueprint',
        'Full-Stack Software Engineer Job Description & Market Expectations',
      ],
    });
  } catch (error) {
    next(error);
  }
};
