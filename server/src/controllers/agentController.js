import { executeCareerAgent } from '../services/agent/careerAgent.js';
import { TOOL_DEFINITIONS } from '../services/agent/tools/index.js';
import Chat from '../models/Chat.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Chat with the Autonomous AI Career Agent (Tool-calling & multi-step workflows)
 * @route   POST /api/agent/chat
 * @access  Private
 */
export const chatWithAgent = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return errorResponse(res, 400, 'Please provide a message for the Career Agent.');
    }

    const trimmedMessage = message.trim();

    // 1. Retrieve previous conversation messages for conversational context
    let activeChat = null;
    let conversationHistory = [];

    if (conversationId) {
      try {
        activeChat = await Chat.findOne({ _id: conversationId, userId: req.user._id });
        if (activeChat && Array.isArray(activeChat.messages)) {
          // Take the latest 6 messages for context
          conversationHistory = activeChat.messages.slice(-6);
        }
      } catch (chatLookupErr) {
        console.warn(`[Agent Conversation Lookup Warning]: ${chatLookupErr.message}`);
      }
    }

    // 2. Execute Autonomous AI Career Agent
    const agentResult = await executeCareerAgent({
      message: trimmedMessage,
      user: req.user,
      conversationHistory,
    });

    const {
      answer,
      toolsUsed = [],
      citations = [],
      clarificationNeeded = false,
      suggestedFollowUps = [],
      isAgentic = true,
      model,
    } = agentResult;

    // 3. Persist interaction to Chat history
    try {
      if (!activeChat) {
        activeChat = new Chat({
          userId: req.user._id,
          title: trimmedMessage.slice(0, 40) + (trimmedMessage.length > 40 ? '...' : ''),
          messages: [],
        });
      }

      activeChat.messages.push({
        sender: 'user',
        text: trimmedMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      activeChat.messages.push({
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      await activeChat.save();
    } catch (persistErr) {
      console.warn(`[Agent Chat Persistence Warning]: ${persistErr.message}`);
    }

    return successResponse(res, 200, 'Agent response generated successfully', {
      answer,
      toolsUsed,
      citations,
      clarificationNeeded,
      suggestedFollowUps,
      conversationId: activeChat?._id || null,
      isAgentic,
      model,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get catalog of available agent tools and parameter schemas
 * @route   GET /api/agent/tools
 * @access  Private
 */
export const getAvailableTools = async (req, res, next) => {
  try {
    return successResponse(res, 200, 'Available agent tools retrieved', {
      count: TOOL_DEFINITIONS.length,
      tools: TOOL_DEFINITIONS,
    });
  } catch (error) {
    next(error);
  }
};
