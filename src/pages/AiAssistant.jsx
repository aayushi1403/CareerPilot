import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  User,
  Send,
  RotateCcw,
  Lightbulb,
  Copy,
  Check,
} from 'lucide-react';
import { aiAssistantData, userProfile } from '../data/mockData';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import DemoBanner from '../components/DemoBanner';

const initialMessages = [
  {
    id: 1,
    sender: 'assistant',
    text: `Hello ${userProfile.name.split(' ')[0]}! 👋 I'm your **CareerPilot AI Copilot**.

I can help you:
• Analyze and optimize your resume for applicant tracking systems (ATS)
• Identify high-priority skill gaps for senior roles
• Prepare tailored answers for upcoming technical & behavioral interviews
• Recommend career progression strategies

Click any suggested question below or type your career question!`,
    timestamp: 'Just now',
  },
];

export default function AiAssistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const findMatchingResponse = (query) => {
    const lower = query.toLowerCase();
    for (const item of aiAssistantData.presetKnowledgeBase) {
      if (item.triggers.some((trigger) => lower.includes(trigger))) {
        return item.response;
      }
    }
    // Contextual fallback response
    return `Based on your profile as a **${userProfile.title}** aiming for Senior Full-Stack roles:

1. **Focus on Production Readiness**: Hiring teams want to see experience with testing (Vitest/Jest), CI/CD pipelines, and database query optimization.
2. **Elevate Your Portfolio**: Build and deploy full-stack capstones with authentication, relational databases (PostgreSQL), and Docker.
3. **Continuous Practice**: Keep practicing your System Design questions in our **Mock Interview** module to build confidence explaining distributed architectures.

*(Note: In the full version, LangChain.js & Google Gemini dynamically tailor responses based on your actual resume and job applications.)*`;
  };

  const handleSendMessage = (textToSend) => {
    const message = (textToSend || inputText).trim();
    if (!message) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate intelligent AI thinking delay
    setTimeout(() => {
      const aiReply = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: findMatchingResponse(message),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiReply]);
    }, 1100);
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
            <div className="p-2 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-lg text-white">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">
              AI Career <span className="gradient-text">Assistant</span>
            </h1>
          </div>
          <p className="text-slate-400 text-xs ml-9">
            Your 24/7 intelligent career advisor for resume, interview, and skill guidance
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="violet" size="sm">Gemini AI Demo</Badge>
          <Button variant="ghost" size="sm" onClick={handleClearChat} title="Reset Conversation">
            <RotateCcw size={14} className="mr-1" /> Reset
          </Button>
        </div>
      </div>

      <DemoBanner />

      {/* ── Suggested Questions Pills ────────────────────────── */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 font-medium">
          <Lightbulb size={13} className="text-amber-400" /> Quick Questions:
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {aiAssistantData.suggestedQuestions.map((q, idx) => (
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
      <Card className="flex-1 overflow-hidden flex flex-col p-0 bg-[#071122]/90 border-slate-700/60">
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                      ? 'bg-violet-600 text-white rounded-tr-none'
                      : 'bg-[#0f1f3d] border border-slate-700/60 text-slate-200 rounded-tl-none space-y-2'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Bubble footer */}
                  <div
                    className={`flex items-center justify-between text-[10px] pt-1 mt-1 border-t ${
                      isUser
                        ? 'border-violet-500/40 text-violet-200'
                        : 'border-slate-800 text-slate-500'
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
              <div className="w-8 h-8 rounded-full bg-[#0f1f3d] border border-violet-500/40 text-violet-400 flex items-center justify-center flex-shrink-0">
                <Bot size={16} />
              </div>
              <div className="rounded-2xl rounded-tl-none p-4 bg-[#0f1f3d] border border-slate-700/60 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-slate-400 ml-2 font-medium">CareerPilot is analyzing...</span>
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
              placeholder="Ask CareerPilot anything (e.g. 'How do I optimize my resume for Stripe?')..."
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
          <p className="text-[11px] text-slate-500 mt-2 text-center">
            ⚡ Powered by CareerPilot Copilot Engine (Demo Preview). Real RAG + Gemini integration in next phase.
          </p>
        </div>
      </Card>
    </div>
  );
}
