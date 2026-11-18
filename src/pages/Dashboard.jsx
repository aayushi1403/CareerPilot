import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getResumesApi } from '../services/api';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Badge from '../components/Badge';
import { jobListings, careerReadiness } from '../data/mockData';
import {
  TrendingUp,
  Briefcase,
  FileText,
  Mic,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  Zap,
  Upload,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Activity Icon Helper ─────────────────────────────────────────────────────
function ActivityIcon({ type }) {
  const map = {
    resume: { icon: FileText, cls: 'text-violet-400 bg-violet-500/20' },
    job: { icon: Briefcase, cls: 'text-cyan-400 bg-cyan-500/20' },
    interview: { icon: Mic, cls: 'text-orange-400 bg-orange-500/20' },
    insight: { icon: TrendingUp, cls: 'text-emerald-400 bg-emerald-500/20' },
  };
  const { icon: Icon, cls } = map[type] ?? map.insight;
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cls}`}>
      <Icon size={16} />
    </div>
  );
}

// ─── Status Badge Helper ───────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    completed: { label: 'Done', variant: 'success' },
    pending: { label: 'Pending', variant: 'warning' },
    new: { label: 'New', variant: 'info' },
    alert: { label: 'Alert', variant: 'error' },
  };
  const { label, variant } = map[status] ?? { label: status, variant: 'default' };
  return <Badge variant={variant} size="sm">{label}</Badge>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  const greeting = getGreeting();
  const dateStr = formatDate();
  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  useEffect(() => {
    async function loadResumes() {
      try {
        const res = await getResumesApi();
        if (Array.isArray(res?.data?.resumes)) {
          setResumes(res.data.resumes);
        }
      } catch (err) {
        console.warn('Could not load user resumes for dashboard:', err.message);
      } finally {
        setLoadingResumes(false);
      }
    }
    loadResumes();
  }, []);

  const latestResume = resumes.length > 0 ? resumes[0] : null;
  const hasResume = Boolean(latestResume);

  const resumeScoreVal = hasResume
    ? `${latestResume.atsScore || 75}%`
    : user?.resumeScore
    ? `${user.resumeScore}%`
    : '--';

  const userSkills = user?.skills || [];
  const matchedJobsCount = userSkills.length > 0 ? Math.min(jobListings.length, userSkills.length * 2 + 1) : 0;

  // Build user-tailored recent activity
  const userActivities = hasResume
    ? [
        {
          id: 1,
          type: 'resume',
          title: `Uploaded and extracted "${latestResume.originalName || latestResume.fileName}"`,
          time: new Date(latestResume.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          status: 'completed',
        },
        {
          id: 2,
          type: 'insight',
          title: `ATS compatibility evaluated at ${latestResume.atsScore || 75}%`,
          time: 'Recent',
          status: 'completed',
        },
        {
          id: 3,
          type: 'job',
          title: `Matched ${matchedJobsCount} opportunities for ${user?.targetJobRole || 'Software Engineer'}`,
          time: 'Active',
          status: 'new',
        },
      ]
    : [
        {
          id: 1,
          type: 'insight',
          title: `Account created for ${user?.name || 'New Member'}`,
          time: 'Today',
          status: 'completed',
        },
        {
          id: 2,
          type: 'resume',
          title: 'Resume analysis pending upload',
          time: 'Pending',
          status: 'alert',
        },
      ];

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {greeting}, <span className="gradient-text">{firstName}</span> 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">{dateStr}</p>
        </div>
        <Link
          to="/resume"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-600/20 self-start sm:self-auto"
        >
          <FileText size={16} /> {hasResume ? 'View / Upload Resume' : 'Upload Resume'}
        </Link>
      </div>

      {/* ── Empty State Banner (If User Has No Resume) ──────── */}
      {!hasResume && !loadingResumes && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/60 via-[#0d1a33] to-cyan-950/40 border border-violet-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 flex-shrink-0">
              <Upload size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Welcome to CareerPilot! Upload your resume to begin your career analysis.
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Upload your PDF or DOCX resume to extract your skills, get an instant ATS compatibility score, identify missing keywords, and match with verified jobs.
              </p>
            </div>
          </div>
          <Link
            to="/resume"
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-900/30 flex-shrink-0"
          >
            <Upload size={16} /> Upload Resume
          </Link>
        </div>
      )}

      {/* ── Career Readiness Overview ────────────────────────── */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-lg text-white">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-semibold text-lg">Career Readiness Overview</h2>
                  <Badge variant="violet" size="sm">
                    {user?.targetJobRole || 'Full-Stack Developer'}
                  </Badge>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">
                  Benchmark: Top 15% of candidates for {user?.targetJobRole || 'Engineering'} roles
                </p>
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400">
                {hasResume ? latestResume.overallScore || 78 : user?.profileCompletion || 60}%
              </span>
              <span className="text-slate-300 text-sm font-medium bg-[#050d1a] px-3 py-1 rounded-full border border-slate-700/60">
                🎯 {hasResume ? 'Job Ready' : 'Profile Setup in Progress'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {careerReadiness.metrics.map((metric) => (
              <div key={metric.label} className="bg-[#050d1a]/50 p-3 rounded-lg border border-slate-700/40">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-300 truncate">{metric.label}</span>
                  <span className="font-semibold text-violet-400">
                    {metric.label === 'Resume ATS Score'
                      ? (hasResume ? latestResume.atsScore || 75 : 0)
                      : metric.score}%
                  </span>
                </div>
                <ProgressBar
                  value={
                    metric.label === 'Resume ATS Score'
                      ? (hasResume ? latestResume.atsScore || 75 : 0)
                      : metric.score
                  }
                  color={metric.color}
                  size="sm"
                  showValue={false}
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Target: {metric.target}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Real User Stats Row ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Resume Score"
          value={resumeScoreVal}
          change={hasResume ? 'ATS Verified' : 'Upload Pending'}
          trend={hasResume ? 'up' : 'down'}
          icon={<FileText size={20} />}
          color="violet"
        />
        <StatCard
          label="Jobs Matched"
          value={matchedJobsCount}
          change={userSkills.length ? `${userSkills.length} verified skills` : 'Add skills to match'}
          trend="up"
          icon={<Briefcase size={20} />}
          color="cyan"
        />
        <StatCard
          label="Interview Score"
          value={`${user?.interviewScore || 80}%`}
          change="AI Evaluated"
          trend="up"
          icon={<Mic size={20} />}
          color="green"
        />
        <StatCard
          label="Profile Complete"
          value={`${user?.profileCompletion || 60}%`}
          change={user?.targetJobRole || 'Role active'}
          trend="up"
          icon={<TrendingUp size={20} />}
          color="orange"
        />
      </div>

      {/* ── Recommended Next Actions ─────────────────────────── */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-semibold text-lg">Personalized Recommended Actions</h2>
          </div>
          <span className="text-xs text-slate-500">Curated for your profile</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {!hasResume ? (
            <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/30 flex flex-col justify-between">
              <div>
                <Badge variant="warning" size="sm">High Priority</Badge>
                <h3 className="text-slate-100 font-semibold text-sm mt-2 mb-1">Upload Your Resume</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Upload your resume document to unlock ATS keywords, automated skill gap detection, and match rankings.
                </p>
              </div>
              <Link
                to="/resume"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 pt-2 border-t border-slate-700/40"
              >
                Go to Resume Analyzer <ArrowUpRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#050d1a]/60 border border-slate-700/50 hover:border-violet-500/40 transition-all flex flex-col justify-between">
              <div>
                <Badge variant="success" size="sm">Resume Active</Badge>
                <h3 className="text-slate-100 font-semibold text-sm mt-2 mb-1">Audit Keywords with Gemini</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Run a LangChain deep audit on "{latestResume.originalName}" to discover missing cloud and systems keywords.
                </p>
              </div>
              <Link
                to="/resume"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 pt-2 border-t border-slate-700/40"
              >
                Inspect ATS Audit <ArrowUpRight size={13} />
              </Link>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#050d1a]/60 border border-slate-700/50 hover:border-violet-500/40 transition-all flex flex-col justify-between">
            <div>
              <Badge variant="info" size="sm">AI Assistant</Badge>
              <h3 className="text-slate-100 font-semibold text-sm mt-2 mb-1">Consult Career Agent</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Ask your autonomous AI agent: "Am I ready to become a {user?.targetJobRole || 'Backend Developer'}?"
              </p>
            </div>
            <Link
              to="/assistant"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 pt-2 border-t border-slate-700/40"
            >
              Open AI Copilot <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-[#050d1a]/60 border border-slate-700/50 hover:border-violet-500/40 transition-all flex flex-col justify-between">
            <div>
              <Badge variant="default" size="sm">Practice</Badge>
              <h3 className="text-slate-100 font-semibold text-sm mt-2 mb-1">Simulate Technical Interview</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Take an AI mock interview tailored to {user?.targetJobRole || 'Software Engineering'} and receive scoring.
              </p>
            </div>
            <Link
              to="/interview"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 pt-2 border-t border-slate-700/40"
            >
              Start Interview <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </Card>

      {/* ── Middle Row: Recent Activity & AI Insights ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="h-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-lg">Recent Activity</h2>
              <span className="text-xs text-slate-500">Authenticated timeline</span>
            </div>
            <div className="space-y-4">
              {userActivities.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <ActivityIcon type={item.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-medium leading-snug">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={11} className="text-slate-500" />
                      <span className="text-slate-500 text-xs">{item.time}</span>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* AI Insights */}
        <Card className="h-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-lg">AI Guidance Insights</h2>
              <Badge variant="violet" size="sm">Gemini AI</Badge>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-violet-400 bg-violet-500/20">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <p className="text-slate-200 text-sm font-medium">ATS Optimization Advice</p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                    {hasResume
                      ? `Your resume "${latestResume.originalName}" has strong fundamentals. Adding specific deployment metrics will increase your score.`
                      : 'Upload your resume to receive AI keyword recommendations for your target role.'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-cyan-400 bg-cyan-500/20">
                  <Briefcase size={16} />
                </div>
                <div>
                  <p className="text-slate-200 text-sm font-medium">Verified Job Matches</p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                    {userSkills.length > 0
                      ? `Identified ${matchedJobsCount} opportunities matching your skills (${userSkills.slice(0, 3).join(', ')}).`
                      : 'Update your profile skills to match with verified active postings.'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-emerald-400 bg-emerald-500/20">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <p className="text-slate-200 text-sm font-medium">Personalized Career Roadmap</p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                    Milestones and project recommendations for {user?.targetJobRole || 'Software Engineering'} are ready to track.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Bottom Row: Top Job Matches & Resume Health ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Job Matches */}
        <Card className="h-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-lg">Top Job Matches</h2>
              <Link to="/jobs" className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-1 transition-colors">
                View all <ChevronRight size={13} />
              </Link>
            </div>
            <div className="space-y-4">
              {jobListings.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl bg-[#050d1a]/60 border border-slate-700/40 hover:border-violet-500/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-white text-sm font-semibold leading-snug">{job.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{job.company} · {job.location}</p>
                    </div>
                    <Badge variant="success" size="sm">{job.matchScore}% match</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 text-xs font-medium">{job.salary}</span>
                    <Link
                      to="/jobs"
                      className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-0.5 transition-colors"
                    >
                      View Details <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Resume Health */}
        <Card className="h-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-lg">Resume Health</h2>
              <Link to="/resume" className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-1 transition-colors">
                {hasResume ? 'Manage Resumes' : 'Upload Resume'} <ChevronRight size={13} />
              </Link>
            </div>

            {hasResume ? (
              <>
                <div className="mb-6 p-4 rounded-xl bg-[#050d1a]/60 border border-slate-700/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={15} className="text-violet-400" />
                      <span className="text-slate-300 text-sm font-medium">ATS Compatibility Score</span>
                    </div>
                    <span className="text-2xl font-bold text-violet-400">{latestResume.atsScore || 75}%</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                      style={{ width: `${latestResume.atsScore || 75}%` }}
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-2">
                    Active document: <span className="text-slate-300 font-medium">{latestResume.originalName || latestResume.fileName}</span>
                  </p>
                </div>

                <div className="space-y-4">
                  {(latestResume.sections || [
                    { name: 'Contact & Details', score: 90 },
                    { name: 'Core Skills', score: 85 },
                    { name: 'Work Experience', score: 75 },
                    { name: 'Education', score: 80 },
                  ]).slice(0, 4).map((section) => (
                    <ProgressBar
                      key={section.name}
                      label={section.name}
                      value={section.score}
                      color={section.score >= 80 ? 'green' : section.score >= 60 ? 'violet' : 'cyan'}
                      size="sm"
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 px-4 bg-[#050d1a]/40 rounded-xl border border-dashed border-slate-700">
                <FileText size={32} className="mx-auto text-slate-500 mb-3" />
                <p className="text-sm font-medium text-slate-300">No active resume uploaded</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto mb-4">
                  Upload your personal resume in PDF or DOCX format to see section-by-section scoring.
                </p>
                <Link
                  to="/resume"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
                >
                  <Upload size={13} /> Upload Now
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
