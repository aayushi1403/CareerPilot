import { useState } from 'react';
import { roadmapData } from '../data/mockData';
import Card from '../components/Card';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import DemoBanner from '../components/DemoBanner';
import {
  Map,
  CheckCircle,
  Circle,
  Clock,
  ChevronRight,
  BookOpen,
  ExternalLink,
  Target,
  FolderGit2,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';

const statusConfig = {
  completed: {
    icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
    dot: 'bg-emerald-500 ring-emerald-500/40',
    badge: 'success',
    label: 'Completed',
  },
  'in-progress': {
    icon: <Circle className="w-6 h-6 text-violet-400" />,
    dot: 'bg-violet-500 ring-violet-500/40',
    badge: 'violet',
    label: 'In Progress',
  },
  pending: {
    icon: <Circle className="w-6 h-6 text-slate-500" />,
    dot: 'bg-slate-600 ring-slate-600/40',
    badge: 'default',
    label: 'Upcoming',
  },
};

export default function CareerRoadmap() {
  const [expandedPhase, setExpandedPhase] = useState(2); // default open in-progress
  const [completedProjects, setCompletedProjects] = useState(new Set([roadmapData.phases[0].projects?.[0]?.title]));

  const toggleProject = (projectTitle) => {
    setCompletedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectTitle)) next.delete(projectTitle);
      else next.add(projectTitle);
      return next;
    });
  };

  // Calculate dynamic progress
  const totalProjects = roadmapData.phases.reduce((acc, p) => acc + (p.projects?.length || 1), 0);
  const overallPercentage = Math.round((completedProjects.size / totalProjects) * 100) || 25;

  return (
    <div className="min-h-screen bg-[#050d1a] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">

        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <Map className="w-6 h-6 text-violet-400" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Career Roadmap</h1>
          </div>
          <p className="text-slate-400 ml-14">Your personalized path to the next level</p>
        </div>

        <DemoBanner />

        {/* Journey Overview */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Journey Overview & Milestone Tracking
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-[#0a1628] rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current Role</p>
              <p className="text-slate-100 font-semibold">{roadmapData.currentRole}</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <ChevronRight className="w-6 h-6 text-violet-400 hidden sm:block" />
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {roadmapData.timelineMonths} months
                </span>
              </div>
            </div>
            <div className="text-center p-4 bg-[#0a1628] rounded-xl border border-violet-500/30">
              <p className="text-xs text-violet-400 uppercase tracking-wider mb-1">Target Role</p>
              <p className="text-slate-100 font-semibold">{roadmapData.targetRole}</p>
            </div>
          </div>

          {/* Overall progress */}
          <div className="mt-6">
            <ProgressBar
              label="Overall Career Journey Completion"
              value={overallPercentage}
              color="violet"
              showValue={true}
            />
            <span className="text-xs text-slate-500 mt-1 block">
              {completedProjects.size} of {totalProjects} milestone projects verified
            </span>
          </div>
        </Card>

        {/* Roadmap Timeline */}
        <div>
          <h2 className="text-lg font-semibold text-slate-100 mb-6">Roadmap Phases & Milestones</h2>
          <div className="relative space-y-0">
            {roadmapData.phases.map((phase, idx) => {
              const cfg = statusConfig[phase.status] || statusConfig.pending;
              const isExpanded = expandedPhase === phase.id;
              const isLast = idx === roadmapData.phases.length - 1;

              return (
                <div key={phase.id} className="flex gap-5">
                  {/* Left — connector + dot */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-5 h-5 rounded-full ring-4 mt-1 flex-shrink-0 ${cfg.dot}`}
                    />
                    {!isLast && (
                      <div
                        className={`w-0.5 flex-1 mt-1 ${
                          phase.status === 'completed'
                            ? 'bg-emerald-500/50'
                            : phase.status === 'in-progress'
                            ? 'bg-violet-500/50'
                            : 'bg-slate-700/50'
                        }`}
                        style={{ minHeight: '2rem' }}
                      />
                    )}
                  </div>

                  {/* Right — Card */}
                  <div className="flex-1 pb-8">
                    <Card
                      hover
                      className={`p-5 cursor-pointer transition-all ${
                        isExpanded ? 'ring-1 ring-violet-500/40' : ''
                      }`}
                    >
                      {/* Header row */}
                      <div
                        className="flex items-start justify-between gap-3"
                        onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                      >
                        <div className="flex-1">
                          <h3 className="text-slate-100 font-semibold mb-2">{phase.title}</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="default" size="sm">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {phase.duration}
                            </Badge>
                            <Badge variant={cfg.badge} size="sm">
                              {cfg.label}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 text-slate-400 mt-1 flex-shrink-0 transition-transform ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="mt-4 space-y-5 border-t border-slate-700/50 pt-4" onClick={(e) => e.stopPropagation()}>
                          {/* Skills to Learn */}
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">
                              Skills to Learn
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {phase.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="px-2.5 py-1 text-xs rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Suggested Hands-on Projects */}
                          {phase.projects && phase.projects.length > 0 && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium flex items-center gap-1.5">
                                <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" /> Suggested Hands-on Projects
                              </p>
                              <div className="space-y-2">
                                {phase.projects.map((proj) => {
                                  const isDone = completedProjects.has(proj.title);
                                  return (
                                    <div
                                      key={proj.title}
                                      onClick={() => toggleProject(proj.title)}
                                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                                        isDone
                                          ? 'bg-emerald-500/5 border-emerald-500/30'
                                          : 'bg-[#0a1628] border-slate-700/50 hover:border-violet-500/40'
                                      }`}
                                    >
                                      <button className="mt-0.5 text-slate-400 hover:text-white">
                                        {isDone ? (
                                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                          <Square className="w-4 h-4 text-slate-500" />
                                        )}
                                      </button>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                          <span className={`text-sm font-medium ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                                            {proj.title}
                                          </span>
                                          <span className={`text-[11px] ${isDone ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                                            {isDone ? 'Completed' : 'Click to complete'}
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                          {proj.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                          {proj.tech?.map((t) => (
                                            <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                              {t}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Resources */}
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1 font-medium">
                              <BookOpen className="w-3 h-3" /> Recommended Curated Resources
                            </p>
                            <ul className="space-y-1.5">
                              {phase.resources.map((res) => (
                                <li key={res.name}>
                                  <a
                                    href={res.url}
                                    className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                                  >
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    {res.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Phase Progress bar */}
                          {phase.status === 'in-progress' && (
                            <div className="pt-2">
                              <ProgressBar
                                label="Active Phase Progress"
                                value={60}
                                color="violet"
                                showValue={true}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom disclaimer */}
        <Card className="p-5 border-violet-500/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-violet-500/10 rounded-lg flex-shrink-0">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-slate-100 font-medium mb-1">AI-Personalized Roadmap</h3>
              <p className="text-slate-400 text-sm">
                In the full version, your roadmap will be dynamically generated and updated by AI
                based on your resume, target roles, and market trends. This is a demo preview with
                sample data.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
