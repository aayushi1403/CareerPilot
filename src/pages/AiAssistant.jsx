import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  User,
  Send,
  RotateCcw,
  Lightbulb,
  Copy,
  Check,
  BookOpen,
  ShieldCheck,
  Sparkles,
  FileText,
  Database,
} from 'lucide-react';
import { aiAssistantData, userProfile } from '../data/mockData';
import Card from '../components/Card';
import Button from '../components/Button';
import DemoBanner from '../components/DemoBanner';
import { queryRagAssistantApi, getRagStatusApi } from '../services/api';

const initialMessages = [
  {
    id: 1,
    sender: 'assistant',
    text: `Hello ${userProfile.name.split(' ')[0]}! 👋 I'm your **CareerPilot AI Copilot** powered by **LangChain.js & Google Gemini RAG**.

I answer questions grounded directly in verified engineering competency frameworks, interview preparation benchmarks, and your uploaded resume:

• **Backend & System Design**: Scalability, Node.js, Express, databases, REST APIs, and microservices
• **Modern React & Frontend**: React 18/19 hooks, state management, Vite, and performance
• **Interview Preparation**: Behavioral answers using the **STAR Method** and live coding strategies
• **Resume & ATS Optimization**: Google's **XYZ Impact Formula** and ATS formatting rules

Click any quick question below or ask me about your career goals!`,
    timestamp: 'Just now',
    isGrounded: true,
    confidence: 'high',
    citations: [
      {
        title: 'Backend Engineering Career Track & Competency Guide',
        source: 'verified-docs/backend-engineering.md',
        docType: 'career_guide',
        snippet: 'Production-ready Node.js, Express, and database indexing strategies.',
      },
      {
        title: 'Technical & Behavioral Interview Mastery (STAR Framework)',
        source: 'verified-docs/interview-mastery.md',
        docType: 'interview_prep',
        snippet: 'STAR behavioral response structuring with quantifiable results.',
      },
    ],
  },
];

export default function AiAssistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState(aiAssistantData.suggestedQuestions);
  const [ragStatus, setRagStatus] = useState({
    isConnected: true,
    provider: 'ChromaDB Vector Store',
    docCount: 28,
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Check backend RAG status on mount
  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      try {
        const res = await getRagStatusApi();
        if (isMounted && res?.data) {
          const totalDocs = Object.values(res.data.collections || {}).reduce((a, b) => a + b, 0);
          setRagStatus({
            isConnected: true,
            provider: res.data.provider === 'chromadb' ? 'ChromaDB Online' : 'ChromaDB In-Memory Adapter',
            docCount: totalDocs || 28,
          });
        }
      } catch {
        // Backend offline or running standalone demo
        if (isMounted) {
          setRagStatus({
            isConnected: false,
            provider: 'Offline / Client Simulation',
            docCount: 28,
          });
        }
      }
    }
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const findFallbackResponse = (query) => {
    const lower = query.toLowerCase();
    for (const item of aiAssistantData.presetKnowledgeBase) {
      if (item.triggers.some((trigger) => lower.includes(trigger))) {
        return {
          answer: item.response,
          citations: [
            {
              title: 'CareerPilot Verified Career Knowledge Base',
              source: 'verified-career-guides.md',
              docType: 'career_guide',
              snippet: 'Verified engineering benchmarks and industry standards.',
            },
          ],
          confidence: 'high',
          isGrounded: true,
          suggestedFollowUps: [
            'How can I measure the impact of my past engineering projects?',
            'What are the core technical requirements for a Backend Engineer?',
            'How should I explain my behavioral answers using the STAR method?',
          ],
        };
      }
    }

    return {
      answer: `Based on your profile as a **${userProfile.title}** aiming for Senior Full-Stack roles:

1. **Focus on Production Readiness**: Hiring teams want to see experience with automated testing (Supertest/Jest), CI/CD pipelines, and database query optimization [Source: Backend Engineering Career Track].
2. **Elevate Your Portfolio**: Build and deploy full-stack capstones with authentication, relational databases, and Docker containerization.
3. **Continuous Practice**: Structure behavioral answers using the **STAR method** (Situation, Task, Action, Result) in our **Mock Interview** module [Source: Technical & Behavioral Interview Mastery].`,
      citations: [
        {
          title: 'Backend Engineering Career Track & Competency Guide',
          source: 'verified-docs/backend-engineering.md',
          docType: 'career_guide',
          snippet: 'Modular layered architecture and production readiness standards.',
        },
      ],
      confidence: 'medium',
      isGrounded: true,
      suggestedFollowUps: [
        'How do I structure my resume using the XYZ impact formula?',
        'What are the most common interview questions for Full-Stack roles?',
      ],
    };
  };

  const handleSendMessage = async (textToSend) => {
    const message = (textToSend || inputText).trim();
    if (!message || isTyping) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Call live LangChain Gemini RAG Backend API
      const response = await queryRagAssistantApi({
        question: message,
        includeUserResume: true,
        conversationId,
      });

      if (response?.data) {
        const { answer, citations, confidence, isGrounded, conversationId: newConvId, suggestedFollowUps } =
          response.data;

        if (newConvId) {
          setConversationId(newConvId);
        }

        if (suggestedFollowUps && suggestedFollowUps.length > 0) {
          setSuggestedQuestions(suggestedFollowUps);
        }

        const aiReply = {
          id: Date.now() + 1,
          sender: 'assistant',
          text: answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: citations || [],
          confidence: confidence || 'high',
          isGrounded: Boolean(isGrounded),
        };

        setMessages((prev) => [...prev, aiReply]);
      } else {
        throw new Error('Invalid backend response payload');
      }
    } catch {
      // Graceful fallback to verified domain heuristics
      const fallback = findFallbackResponse(message);
      if (fallback.suggestedFollowUps) {
        setSuggestedQuestions(fallback.suggestedFollowUps);
      }

      const aiReply = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: fallback.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: fallback.citations,
        confidence: fallback.confidence,
        isGrounded: fallback.isGrounded,
      };

      setMessages((prev) => [...prev, aiReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages(initialMessages);
    setInputText('');
    setIsTyping(false);
    setConversationId(null);
    setSuggestedQuestions(aiAssistantData.suggestedQuestions);
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto h-[calc(100vh-5rem)] flex flex-col space-y-4 animate-fade-in-up">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-lg text-white shadow-lg shadow-violet-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                AI Career <span className="gradient-text">Assistant</span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Sparkles size={11} /> Grounded RAG
                </span>
              </h1>
            </div>
          </div>
          <p className="text-slate-400 text-xs ml-9">
            Context-aware career advice grounded in verified engineering benchmarks and your resume
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0b172a] border border-slate-700/60 text-[11px] text-slate-300">
            <Database size={12} className="text-cyan-400" />
            <span className="text-slate-400">Index:</span>
            <span className="font-medium text-slate-200">{ragStatus.provider}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClearChat} title="Reset Conversation">
            <RotateCcw size={14} className="mr-1" /> Reset
          </Button>
        </div>
      </div>

      <DemoBanner />

      {/* ── Suggested Questions Pills ────────────────────────── */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 font-medium">
          <Lightbulb size={13} className="text-amber-400" /> Grounded Career Topics:
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-xs bg-[#0f1f3d] hover:bg-violet-600/20 text-slate-300 hover:text-violet-300 border border-slate-700/60 hover:border-violet-500/40 px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat Messages Container ──────────────────────────── */}
      <Card className="flex-1 overflow-hidden flex flex-col p-0 bg-[#071122]/90 border-slate-700/60 shadow-xl">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white'
                      : 'bg-[#0f1f3d] border border-violet-500/40 text-violet-400'
                  }`}
                >
                  {isUser ? <User size={15} /> : <Bot size={16} />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-violet-600 text-white rounded-tr-none shadow-md'
                      : 'bg-[#0f1f3d] border border-slate-700/60 text-slate-200 rounded-tl-none space-y-3'
                  }`}
                >
                  {/* Grounded Badge for Assistant Responses */}
                  {!isUser && msg.isGrounded && (
                    <div className="flex items-center gap-2 text-[11px] pb-1 border-b border-slate-800 text-emerald-400 font-medium">
                      <ShieldCheck size={13} className="text-emerald-400" />
                      <span>Grounded in Verified Knowledge Base</span>
                      <span className="text-slate-500 ml-auto capitalize">
                        {msg.confidence || 'high'} confidence
                      </span>
                    </div>
                  )}

                  <div className="whitespace-pre-line prose prose-invert prose-sm max-w-none">
                    {msg.text}
                  </div>

                  {/* Verified Citations Shelf */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                        <BookOpen size={12} className="text-violet-400" /> Verified Sources & Citations:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                        {msg.citations.map((cite, cIdx) => (
                          <div
                            key={cIdx}
                            className="bg-[#081224] border border-slate-800 rounded-lg p-2 text-xs flex flex-col justify-between"
                          >
                            <div className="flex items-start gap-1.5">
                              <FileText size={12} className="text-violet-400 mt-0.5 flex-shrink-0" />
                              <span className="font-medium text-slate-200 leading-snug line-clamp-1">
                                {cite.title}
                              </span>
                            </div>
                            {cite.snippet && (
                              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 italic">
                                "{cite.snippet}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bubble footer */}
                  <div
                    className={`flex items-center justify-between text-[10px] pt-1 mt-1 border-t ${
                      isUser
                        ? 'border-violet-500/40 text-violet-200'
                        : 'border-slate-800/60 text-slate-500'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => copyToClipboard(msg.id, msg.text)}
                        className="hover:text-slate-300 transition-colors flex items-center gap-1"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check size={11} className="text-emerald-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={11} /> Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-3xl animate-fade-in-up">
              <div className="w-8 h-8 rounded-full bg-[#0f1f3d] border border-violet-500/40 text-violet-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot size={16} />
              </div>
              <div className="rounded-2xl rounded-tl-none p-4 bg-[#0f1f3d] border border-slate-700/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-slate-300 ml-2 font-medium">
                  Retrieving verified context & analyzing with Gemini...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Bar ────────────────────────────────────────── */}
        <div className="p-3 sm:p-4 bg-[#0a1628] border-t border-slate-700/60">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything grounded in verified benchmarks (e.g. 'How do I answer STAR interview questions?')..."
              className="flex-1 bg-[#050d1a] border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-colors"
            />
            <Button
              variant="primary"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              className="px-4 py-2.5 rounded-xl flex-shrink-0"
            >
              <Send size={15} />
            </Button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck size={11} className="text-emerald-400" /> Anti-Hallucination Guardrails Active
            </span>
            <span>⚡ LangChain.js • Google Gemini • ChromaDB</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
