import Chat from '../models/Chat.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Save new message or create conversation
 * @route   POST /api/chat
 * @access  Private
 */
export const saveConversation = async (req, res, next) => {
  try {
    const { conversationId, title, message } = req.body;

    if (!message || !message.sender || !message.text) {
      return errorResponse(res, 400, 'Valid message object with sender and text is required.');
    }

    let chat;

    if (conversationId) {
      chat = await Chat.findOne({
        _id: conversationId,
        userId: req.user._id,
      });
    }

    if (!chat) {
      // Create new conversation
      chat = new Chat({
        userId: req.user._id,
        title: title || message.text.slice(0, 40) + '...',
        messages: [
          {
            sender: message.sender,
            text: message.text,
            timestamp: message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      });
    } else {
      // Append message to existing
      chat.messages.push({
        sender: message.sender,
        text: message.text,
        timestamp: message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      if (title) chat.title = title;
    }

    await chat.save();

    return successResponse(res, 201, 'Conversation saved successfully', {
      chat,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Retrieve all previous conversations for the authenticated user
 * @route   GET /api/chat
 * @access  Private
 */
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Chat.find({ userId: req.user._id })
      .select('title createdAt updatedAt messages')
      .sort({ updatedAt: -1 });

    const formatted = conversations.map((c) => ({
      id: c._id,
      title: c.title,
      messageCount: c.messages.length,
      lastMessage: c.messages[c.messages.length - 1] || null,
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
    }));

    return successResponse(res, 200, 'Previous conversations retrieved', {
      count: formatted.length,
      conversations: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get full conversation by ID
 * @route   GET /api/chat/:id
 * @access  Private
 */
export const getConversationById = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!chat) {
      return errorResponse(res, 404, 'Conversation not found.');
    }

    return successResponse(res, 200, 'Conversation retrieved successfully', {
      chat,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete conversation
 * @route   DELETE /api/chat/:id
 * @access  Private
 */
export const deleteConversation = async (req, res, next) => {
  try {
    const result = await Chat.deleteOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (result.deletedCount === 0) {
      return errorResponse(res, 404, 'Conversation not found.');
    }

    return successResponse(res, 200, 'Conversation deleted successfully', {
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

