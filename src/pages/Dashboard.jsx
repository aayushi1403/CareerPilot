import { dashboardStats, recentActivity, userProfile, jobListings, resumeAnalysis, careerReadiness } from '../data/mockData'
import StatCard from '../components/StatCard'
import Card from '../components/Card'
import ProgressBar from '../components/ProgressBar'
import Badge from '../components/Badge'
import DemoBanner from '../components/DemoBanner'
import {
  TrendingUp, Briefcase, FileText, Mic,
  ChevronRight, Clock, CheckCircle, AlertCircle,
  ArrowUpRight, Sparkles, Zap
} from 'lucide-react'
import { Link } from 'react-router-dom'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

// ─── Activity icon helper ─────────────────────────────────────────────────────
function ActivityIcon({ type }) {
  const map = {
    resume:    { icon: FileText,     cls: 'text-violet-400 bg-violet-500/20' },
    job:       { icon: Briefcase,    cls: 'text-cyan-400 bg-cyan-500/20'     },
    interview: { icon: Mic,          cls: 'text-orange-400 bg-orange-500/20' },
    insight:   { icon: TrendingUp,   cls: 'text-emerald-400 bg-emerald-500/20' },
  }
  const { icon: Icon, cls } = map[type] ?? map.insight
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cls}`}>
      <Icon size={16} />
    </div>
  )
}

// ─── Status badge helper ───────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    completed: { label: 'Done',    variant: 'success' },
    pending:   { label: 'Pending', variant: 'warning' },
    new:       { label: 'New',     variant: 'info'    },
    alert:     { label: 'Alert',   variant: 'error'   },
  }
  const { label, variant } = map[status] ?? { label: status, variant: 'default' }
  return <Badge variant={variant} size="sm">{label}</Badge>
}

// ─── Recent Activity ──────────────────────────────────────────────────────────
function RecentActivity() {
  return (
    <Card className="h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">Recent Activity</h2>
          <span className="text-xs text-slate-500">Last 7 days</span>
        </div>
        <div className="space-y-4">
          {recentActivity.map((item) => (
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
  )
}

// ─── AI Insights ──────────────────────────────────────────────────────────────
const AI_INSIGHTS = [
  {
    color: 'text-violet-400 bg-violet-500/20',
    icon: TrendingUp,
    title: 'Boost your ATS score',
    description: 'Adding "TypeScript" and "CI/CD" keywords to your resume could increase ATS match rate by ~12%.',
  },
  {
    color: 'text-cyan-400 bg-cyan-500/20',
    icon: Briefcase,
    title: 'High-match jobs available',
    description: '3 new Senior Engineer roles posted in the last 24 hours match your profile above 90%.',
  },
  {
    color: 'text-emerald-400 bg-emerald-500/20',
    icon: CheckCircle,
    title: 'Interview readiness',
    description: 'Your mock interview scores improved 18% this week. You\'re ready to apply for FAANG roles.',
  },
]

function AIInsights() {
  return (
    <Card className="h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">AI Insights</h2>
          <Badge variant="violet" size="sm">AI Demo</Badge>
        </div>
        <div className="space-y-4">
          {AI_INSIGHTS.map((insight) => {
            const Icon = insight.icon
            return (
              <div key={insight.title} className="flex gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${insight.color}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-slate-200 text-sm font-medium">{insight.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

// ─── Top Job Matches ──────────────────────────────────────────────────────────
function TopJobMatches() {
  const topJobs = jobListings.slice(0, 3)
  return (
    <Card className="h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">Top Job Matches</h2>
          <Link to="/jobs" className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-1 transition-colors">
            View all <ChevronRight size={13} />
          </Link>
        </div>
        <div className="space-y-4">
          {topJobs.map((job) => (
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
                  View <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// ─── Resume Health ─────────────────────────────────────────────────────────────
function ResumeHealth() {
  return (
    <Card className="h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">Resume Health</h2>
          <Link to="/resume" className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-1 transition-colors">
            Analyze <ChevronRight size={13} />
          </Link>
        </div>

        {/* ATS Score prominent */}
        <div className="mb-6 p-4 rounded-xl bg-[#050d1a]/60 border border-slate-700/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-violet-400" />
              <span className="text-slate-300 text-sm font-medium">ATS Compatibility Score</span>
            </div>
            <span className="text-2xl font-bold text-violet-400">{resumeAnalysis.atsScore}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
              style={{ width: `${resumeAnalysis.atsScore}%` }}
            />
          </div>
          <p className="text-slate-500 text-xs mt-2">
            {resumeAnalysis.atsScore >= 80 ? 'Great! Most ATS systems will process your resume.' : 'Improve keywords to boost ATS compatibility.'}
          </p>
        </div>

        {/* Section scores */}
        <div className="space-y-4">
          {resumeAnalysis.sections.map((section) => (
            <ProgressBar
              key={section.name}
              label={section.name}
              value={section.score}
              color={section.score >= 80 ? 'green' : section.score >= 60 ? 'violet' : 'cyan'}
              size="sm"
            />
          ))}
        </div>

        {/* Missing keywords hint */}
        {resumeAnalysis.keywords?.missing?.length > 0 && (
          <div className="mt-5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-400 text-xs font-medium mb-1">Missing keywords</p>
            <div className="flex flex-wrap gap-1.5">
              {resumeAnalysis.keywords.missing.slice(0, 4).map((kw) => (
                <span key={kw} className="text-amber-300/70 text-xs bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {kw}
                </span>
              ))}
              {resumeAnalysis.keywords.missing.length > 4 && (
                <span className="text-slate-500 text-xs px-1">+{resumeAnalysis.keywords.missing.length - 4} more</span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// ─── Career Readiness Overview ──────────────────────────────────────────────
function CareerReadinessOverview() {
  return (
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Overall badge & title */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-lg text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-semibold text-lg">Career Readiness Overview</h2>
                <Badge variant="violet" size="sm">AI Evaluation</Badge>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">{careerReadiness.benchmark}</p>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400">
              {careerReadiness.overallScore}%
            </span>
            <span className="text-slate-300 text-sm font-medium bg-[#050d1a] px-3 py-1 rounded-full border border-slate-700/60">
              🎯 {careerReadiness.level}
            </span>
          </div>
        </div>

        {/* Right: Key readiness breakdown meters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          {careerReadiness.metrics.map((metric) => (
            <div key={metric.label} className="bg-[#050d1a]/50 p-3 rounded-lg border border-slate-700/40">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 truncate">{metric.label}</span>
                <span className="font-semibold text-violet-400">{metric.score}%</span>
              </div>
              <ProgressBar
                value={metric.score}
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
  )
}

// ─── Recommended Next Actions ────────────────────────────────────────────────
function RecommendedActions() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h2 className="text-white font-semibold text-lg">Recommended Next Actions</h2>
        </div>
        <span className="text-xs text-slate-500">Curated for your profile</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {careerReadiness.recommendedActions.map((action) => (
          <div
            key={action.id}
            className="p-4 rounded-xl bg-[#050d1a]/60 border border-slate-700/50 hover:border-violet-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={action.priority === 'High' ? 'warning' : 'info'} size="sm">
                  {action.priority} Priority
                </Badge>
              </div>
              <h3 className="text-slate-100 font-medium text-sm leading-snug mb-1">{action.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{action.description}</p>
            </div>
            <Link
              to={action.link}
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors pt-2 border-t border-slate-700/40"
            >
              {action.actionText} <ArrowUpRight size={13} />
            </Link>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const greeting = getGreeting()
  const dateStr = formatDate()

  return (
    <div className="space-y-6 pb-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, {userProfile.name.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">{dateStr}</p>
        </div>
        <Link
          to="/resume"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all self-start sm:self-auto"
        >
          <FileText size={16} /> Analyze Resume
        </Link>
      </div>

      {/* Demo Banner */}
      <DemoBanner />

      {/* Career Readiness Overview */}
      <CareerReadinessOverview />

      {/* Stats row — 2 on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Resume Score"
          value={`${dashboardStats.find(s => s.label === 'Resume Score')?.value ?? resumeAnalysis.overallScore}%`}
          change={dashboardStats.find(s => s.label === 'Resume Score')?.change ?? '+5%'}
          trend={dashboardStats.find(s => s.label === 'Resume Score')?.trend ?? 'up'}
          icon={<FileText size={20} />}
          color="violet"
        />
        <StatCard
          label="Jobs Matched"
          value={dashboardStats.find(s => s.label === 'Jobs Matched')?.value ?? jobListings.length}
          change={dashboardStats.find(s => s.label === 'Jobs Matched')?.change ?? '+3'}
          trend={dashboardStats.find(s => s.label === 'Jobs Matched')?.trend ?? 'up'}
          icon={<Briefcase size={20} />}
          color="cyan"
        />
        <StatCard
          label="Interview Score"
          value={`${dashboardStats.find(s => s.label === 'Interview Score')?.value ?? userProfile.interviewScore}%`}
          change={dashboardStats.find(s => s.label === 'Interview Score')?.change ?? '+8%'}
          trend={dashboardStats.find(s => s.label === 'Interview Score')?.trend ?? 'up'}
          icon={<Mic size={20} />}
          color="green"
        />
        <StatCard
          label="Profile Complete"
          value={`${dashboardStats.find(s => s.label === 'Profile Complete')?.value ?? userProfile.profileCompletion}%`}
          change={dashboardStats.find(s => s.label === 'Profile Complete')?.change ?? '+2%'}
          trend={dashboardStats.find(s => s.label === 'Profile Complete')?.trend ?? 'up'}
          icon={<TrendingUp size={20} />}
          color="orange"
        />
      </div>

      {/* Recommended Next Actions */}
      <RecommendedActions />

      {/* Middle row: Recent Activity + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <AIInsights />
      </div>

      {/* Bottom row: Top Job Matches + Resume Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopJobMatches />
        <ResumeHealth />
      </div>
    </div>
  )
}
