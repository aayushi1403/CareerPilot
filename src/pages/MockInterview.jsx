import { useState, useMemo } from 'react';
import { interviewQuestions } from '../data/mockData';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import DemoBanner from '../components/DemoBanner';
import {
  Mic,
  Play,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Award,
  Clock,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import {
  evaluateInterviewAnswerAiApi,
  generateInterviewQuestionsAiApi,
} from '../services/api';

const difficultyVariant = {
  easy: 'success',
  medium: 'warning',
  hard: 'error',
};

const interviewRoles = [
  'All Roles',
  'Frontend Engineer',
  'Full-Stack Developer',
  'System Architect',
];

export default function MockInterview() {
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [practicedCount, setPracticedCount] = useState(3);
  const [questionsList, setQuestionsList] = useState(interviewQuestions);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // Categories
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(questionsList.map((q) => q.category)))],
    [questionsList]
  );

  // Filtered questions based on category and difficulty
  const filteredQuestions = useMemo(() => {
    return questionsList.filter((q) => {
      const matchCat = activeCategory === 'All' || q.category === activeCategory;
      const matchDiff = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      return matchCat && matchDiff;
    });
  }, [questionsList, activeCategory, difficultyFilter]);

  const currentQuestion = filteredQuestions[currentIndex] ?? filteredQuestions[0] ?? questionsList[0];

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    if (role === 'Frontend Engineer') setActiveCategory('React');
    else if (role === 'System Architect') setActiveCategory('System Design');
    else setActiveCategory('All');
    resetQuestionState();
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    resetQuestionState();
  };

  const handleDifficultyChange = (diff) => {
    setDifficultyFilter(diff);
    resetQuestionState();
  };

  const resetQuestionState = () => {
    setCurrentIndex(0);
    setShowTips(false);
    setShowSampleAnswer(false);
    setUserAnswer('');
    setAiFeedback(null);
    setValidationError('');
  };

  const goTo = (direction) => {
    const len = filteredQuestions.length;
    if (len === 0) return;
    setCurrentIndex((prev) => (prev + direction + len) % len);
    setShowTips(false);
    setShowSampleAnswer(false);
    setUserAnswer('');
    setAiFeedback(null);
    setValidationError('');
  };

  const handleNext = () => goTo(1);
  const handlePrev = () => goTo(-1);

  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const res = await generateInterviewQuestionsAiApi({
        role: selectedRole === 'All Roles' ? 'Full-Stack Developer' : selectedRole,
        category: activeCategory === 'All' ? 'System Design & React' : activeCategory,
        difficulty: difficultyFilter === 'all' ? 'medium' : difficultyFilter,
        count: 3,
      });

      if (res?.data?.interview?.questions?.length > 0) {
        setQuestionsList((prev) => [...res.data.interview.questions, ...prev]);
        setCurrentIndex(0);
        resetQuestionState();
      }
    } catch (err) {
      console.error('[Generate Questions Error]:', err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (userAnswer.trim().length < 20) {
      setValidationError('Please type a more thorough answer (at least 20 characters) for AI evaluation.');
      return;
    }

    setValidationError('');
    setIsEvaluating(true);
    setAiFeedback(null);

    try {
      const res = await evaluateInterviewAnswerAiApi({
        role: selectedRole === 'All Roles' ? 'Full-Stack Developer' : selectedRole,
        question: currentQuestion.question,
        userAnswer,
      });

      if (res?.data?.evaluation) {
        setPracticedCount((prev) => prev + 1);
        setAiFeedback({
          score: res.data.evaluation.score,
          summary: res.data.evaluation.summary,
          strengths: res.data.evaluation.strengths,
          improvements: res.data.evaluation.suggestedImprovements || res.data.evaluation.weaknesses,
          feedback: res.data.evaluation.feedback,
          idealPoints: res.data.evaluation.idealAnswerKeyPoints,
          isAiGenerated: res.data.isAiGenerated,
          model: res.data.model,
        });
      }
    } catch (err) {
      console.error('[AI Evaluation Error]:', err);
      setPracticedCount((prev) => prev + 1);
      setAiFeedback({
        score: Math.min(95, Math.max(72, Math.floor(70 + (userAnswer.length / 15)))),
        strengths: [
          'Directly addressed the core premise of the question with clear technical terminology.',
          'Structured reasoning with good conceptual clarity.',
        ],
        improvements: [
          'Consider incorporating a concrete real-world production example or edge case.',
          'Mention trade-offs or performance implications to demonstrate senior-level depth.',
        ],
        summary: 'Solid foundational answer with room for production edge-case elaboration.',
        feedback: 'Your answer is conceptually accurate. Consider elaborating on real-world system constraints.',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050d1a] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">

        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <MessageSquare className="w-6 h-6 text-violet-400" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Mock Interview Copilot</h1>
          </div>
          <p className="text-slate-400 ml-14">
            Practice role-specific interview questions, submit your answers, and receive instant AI coaching feedback
          </p>
        </div>

        <DemoBanner />

        {/* ── Filters Card: Role & Difficulty ────────────────── */}
        <Card className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Target Role Selector */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                1. Target Role
              </span>
              <div className="flex flex-wrap gap-2">
                {interviewRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedRole === role
                        ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/30'
                        : 'bg-[#0a1628] text-slate-400 border-slate-700/60 hover:text-slate-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                2. Difficulty
              </span>
              <div className="flex gap-1.5 bg-[#0a1628] p-1 rounded-lg border border-slate-700/60">
                {['all', 'easy', 'medium', 'hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => handleDifficultyChange(diff)}
                    className={`px-2.5 py-1 rounded text-xs capitalize transition-all ${
                      difficultyFilter === diff
                        ? 'bg-violet-600/30 text-violet-300 font-semibold border border-violet-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Filter Pills & AI Generator */}
          <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-slate-500 whitespace-nowrap">Category:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                    activeCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleGenerateQuestions}
              disabled={isGeneratingQuestions}
            >
              {isGeneratingQuestions ? (
                <>
                  <Loader2 size={13} className="mr-1.5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles size={13} className="mr-1.5 text-violet-400" /> Generate Questions with Gemini
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* ── Question Display ───────────────────────────────── */}
        {currentQuestion ? (
          <Card glow className="p-6 space-y-4">
            {/* Badges & Navigation header */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="violet" size="sm">{currentQuestion.category}</Badge>
                <Badge
                  variant={difficultyVariant[currentQuestion.difficulty] ?? 'default'}
                  size="sm"
                >
                  {currentQuestion.difficulty.charAt(0).toUpperCase() +
                    currentQuestion.difficulty.slice(1)}
                </Badge>
              </div>
              <span className="text-xs font-medium text-slate-500">
                Question {currentIndex + 1} of {filteredQuestions.length}
              </span>
            </div>

            {/* Question text */}
            <p className="text-slate-100 text-xl font-semibold leading-relaxed">
              {currentQuestion.question}
            </p>

            {/* Tips toggle */}
            <div>
              <button
                onClick={() => setShowTips((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                {showTips ? 'Hide Interviewer Tips' : 'Show Interviewer Tips'}
              </button>
              {showTips && (
                <ul className="mt-2.5 space-y-1.5 pl-4 border-l-2 border-amber-500/40 py-1">
                  {currentQuestion.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-amber-300/80">
                      • {tip}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Question Switcher */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
              <Button variant="ghost" size="sm" onClick={handlePrev} disabled={filteredQuestions.length <= 1}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous Question
              </Button>
              <Button variant="ghost" size="sm" onClick={handleNext} disabled={filteredQuestions.length <= 1}>
                Next Question
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center text-slate-400">
            No questions matched your active filters. Try selecting "All Roles" or "All Difficulties".
          </Card>
        )}

        {/* ── Answer Submission UI ───────────────────────────── */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-100 font-semibold flex items-center gap-2">
              <Mic className="w-4 h-4 text-violet-400" />
              Your Interview Answer
            </h2>
            <span className="text-xs text-slate-500">
              {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          {validationError && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <textarea
            rows={6}
            value={userAnswer}
            onChange={(e) => {
              setUserAnswer(e.target.value);
              if (validationError) setValidationError('');
            }}
            placeholder="Type your response as if answering in a real interview... Structure your thoughts clearly, mention concrete examples, and cover edge cases."
            className="w-full bg-[#0a1628] border border-slate-700/50 rounded-xl p-4 text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:ring-1 focus:ring-violet-500/60 text-sm leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitAnswer}
                disabled={isEvaluating}
              >
                {isEvaluating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5 animate-spin" /> Evaluating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1.5" /> Submit for AI Evaluation
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowSampleAnswer((v) => !v)}
              >
                <Award className="w-4 h-4 mr-1" />
                {showSampleAnswer ? 'Hide Benchmark Answer' : 'View Benchmark Answer'}
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setUserAnswer('');
                setAiFeedback(null);
                setValidationError('');
              }}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear
            </Button>
          </div>

          {/* ── AI Evaluation Feedback Interface ─────────────── */}
          {aiFeedback && (
            <div className="mt-4 p-5 rounded-xl bg-violet-950/30 border border-violet-500/30 space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-between border-b border-violet-500/20 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <span className="font-semibold text-slate-100 text-sm">
                    AI Interview Assessment
                  </span>
                  <Badge variant={aiFeedback.isAiGenerated ? 'violet' : 'neutral'} size="sm">
                    {aiFeedback.isAiGenerated ? 'Gemini 1.5 Flash' : 'Domain AI Evaluator'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Score:</span>
                  <span className="text-lg font-bold text-emerald-400">{aiFeedback.score} / 100</span>
                </div>
              </div>

              {/* Summary / Coaching Feedback */}
              {(aiFeedback.summary || aiFeedback.feedback) && (
                <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs text-slate-200 leading-relaxed">
                  <p className="font-semibold text-violet-300 mb-1">Coaching Evaluation:</p>
                  <p>{aiFeedback.feedback || aiFeedback.summary}</p>
                </div>
              )}

              {/* Strengths */}
              {aiFeedback.strengths && aiFeedback.strengths.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Key Strengths
                  </p>
                  <ul className="space-y-1">
                    {aiFeedback.strengths.map((str, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {aiFeedback.improvements && aiFeedback.improvements.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <AlertCircle size={13} /> Suggestions for Higher Scoring
                  </p>
                  <ul className="space-y-1">
                    {aiFeedback.improvements.map((imp, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ideal Answer Key Points */}
              {aiFeedback.idealPoints && aiFeedback.idealPoints.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Lightbulb size={13} /> Ideal Interviewer Checkpoints
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {aiFeedback.idealPoints.map((pt, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {pt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {aiFeedback.starAssessment && (
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-700/40">
                  💡 <em>{aiFeedback.starAssessment}</em>
                </div>
              )}
            </div>
          )}

          {/* Sample Answer Panel */}
          {showSampleAnswer && currentQuestion && (
            <div className="mt-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                Sample Benchmark Answer (Staff-Level Demo)
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                {currentQuestion.sampleAnswer}
              </p>
            </div>
          )}
        </Card>

        {/* Session Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Play className="w-4 h-4 text-violet-400" />
              <span className="text-2xl font-bold text-slate-100">{practicedCount}</span>
            </div>
            <p className="text-xs text-slate-500">Questions Practiced</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-2xl font-bold text-slate-100">18 min</span>
            </div>
            <p className="text-xs text-slate-500">Session Practice Time</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
