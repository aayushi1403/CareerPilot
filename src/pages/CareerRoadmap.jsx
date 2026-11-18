import { useState } from 'react';
import { roadmapData } from '../data/mockData';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import DemoBanner from '../components/DemoBanner';
import { generateCareerRoadmapAiApi } from '../services/api';
import {
  Map,
  CheckCircle,
  Circle,
  Clock,
  ChevronRight,
  Target,
  FolderGit2,
  CheckSquare,
  Square,
  Sparkles,
  Loader2,
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
  const [activeRoadmap, setActiveRoadmap] = useState(roadmapData);
  const [targetRoleInput, setTargetRoleInput] = useState(roadmapData.targetRole);
  const [timelineInput, setTimelineInput] = useState(roadmapData.timelineMonths);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [roadmapError, setRoadmapError] = useState(null);

  const [expandedPhase, setExpandedPhase] = useState(activeRoadmap.phases[1]?.id ?? 2);
  const [completedProjects, setCompletedProjects] = useState(
    new Set([activeRoadmap.phases[0]?.projects?.[0]?.title])
  );

  const toggleProject = (projectTitle) => {
    setCompletedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectTitle)) next.delete(projectTitle);
      else next.add(projectTitle);
      return next;
    });
  };

  const handleGenerateAiRoadmap = async (e) => {
    e?.preventDefault();
    setIsGeneratingRoadmap(true);
    setRoadmapError(null);

    try {
      const res = await generateCareerRoadmapAiApi({
        currentRole: activeRoadmap.currentRole || 'Junior Developer',
        targetRole: targetRoleInput || 'Full-Stack Developer',
        timelineMonths: Number(timelineInput) || 6,
      });

      if (res?.data?.roadmap) {
        const generated = res.data.roadmap;
        const mappedPhases = (generated.phases || []).map((p, idx) => ({
          id: p.phaseNumber || idx + 1,
          title: p.title,
          status: idx === 0 ? 'completed' : idx === 1 ? 'in-progress' : 'pending',
          duration: `${p.durationWeeks} weeks`,
          skills: p.skillsToMaster || [],
          projects: (p.projects || []).map((proj) => ({
            title: proj.title,
            description: proj.description,
            techStack: proj.techStack,
            repoUrl: '#',
          })),
          milestones: p.milestones || [],
          resources: [
            { title: 'Official Documentation & Guides', type: 'Documentation', url: '#' },
            { title: 'Interactive Practical Walkthroughs', type: 'Course', url: '#' },
          ],
        }));

        setActiveRoadmap({
          title: generated.title,
          currentRole: generated.currentRole,
          targetRole: generated.targetRole,
          timelineMonths: generated.timelineMonths,
          overview: generated.overview,
          phases: mappedPhases,
          isAiGenerated: res.data.isAiGenerated,
          model: res.data.model,
        });

        if (mappedPhases.length > 1) {
          setExpandedPhase(mappedPhases[1].id);
        }
        setCompletedProjects(new Set([mappedPhases[0]?.projects?.[0]?.title]));
      }
    } catch (err) {
      console.error('[Roadmap Generation Error]:', err);
      setRoadmapError(err.response?.data?.message || err.message);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const totalProjects = activeRoadmap.phases.reduce((acc, p) => acc + (p.projects?.length || 1), 0);
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
          <p className="text-slate-400 ml-14">
            AI-generated milestones tailored to your target engineering destination
          </p>
        </div>

        <DemoBanner />

        {/* ── AI Roadmap Generator Toolbar ──────────────────────── */}
        <Card className="border border-violet-500/30 bg-gradient-to-br from-violet-950/20 via-[#0a1628] to-[#07101e] p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <h3 className="text-base font-semibold text-slate-100">
                  Generate Custom AI Roadmap
                </h3>
              </div>
              {activeRoadmap.isAiGenerated && (
                <Badge variant="violet" size="sm">
                  Generated with {activeRoadmap.model || 'Gemini 1.5 Flash'}
                </Badge>
              )}
            </div>

            <form onSubmit={handleGenerateAiRoadmap} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Engineering Role</label>
                <input
                  type="text"
                  value={targetRoleInput}
                  onChange={(e) => setTargetRoleInput(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full bg-[#050d1a] border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Preparation Timeline</label>
                <select
                  value={timelineInput}
                  onChange={(e) => setTimelineInput(Number(e.target.value))}
                  className="w-full bg-[#050d1a] border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value={3}>3 Months (Intensive Sprint)</option>
                  <option value={6}>6 Months (Balanced Track)</option>
                  <option value={9}>9 Months (Deep Specialization)</option>
                  <option value={12}>12 Months (Comprehensive Mastery)</option>
                </select>
              </div>

              <div>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isGeneratingRoadmap}
                  className="w-full"
                >
                  {isGeneratingRoadmap ? (
                    <>
                      <Loader2 size={15} className="mr-2 animate-spin" /> Generating with Gemini...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} className="mr-2" /> Generate Roadmap
                    </>
                  )}
                </Button>
              </div>
            </form>

            {roadmapError && (
              <p className="text-xs text-red-400 p-2 rounded bg-red-500/10 border border-red-500/30">
                {roadmapError}
              </p>
            )}
          </div>
        </Card>

        {/* Journey Overview */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Journey Overview & Milestone Tracking
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-[#0a1628] rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current Role</p>
              <p className="text-slate-100 font-semibold">{activeRoadmap.currentRole}</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <ChevronRight className="w-6 h-6 text-violet-400 hidden sm:block" />
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activeRoadmap.timelineMonths} months
                </span>
              </div>
            </div>
            <div className="text-center p-4 bg-[#0a1628] rounded-xl border border-violet-500/30">
              <p className="text-xs text-violet-400 uppercase tracking-wider mb-1">Target Role</p>
              <p className="text-slate-100 font-semibold">{activeRoadmap.targetRole}</p>
            </div>
          </div>

          {activeRoadmap.overview && (
            <div className="mt-5 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 text-xs text-slate-300">
              {activeRoadmap.overview}
            </div>
          )}

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
            {activeRoadmap.phases.map((phase, idx) => {
              const cfg = statusConfig[phase.status] || statusConfig.pending;
              const isExpanded = expandedPhase === phase.id;
              const isLast = idx === activeRoadmap.phases.length - 1;

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
                        <div className="mt-5 space-y-5 border-t border-slate-700/50 pt-5">
                          {/* Skills to learn */}
                          <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                              Skills to Master
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {phase.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Projects */}
                          {phase.projects && phase.projects.length > 0 && (
                            <div>
                              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                                <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                                Milestone Projects
                              </p>
                              <div className="space-y-3">
                                {phase.projects.map((proj) => {
                                  const isChecked = completedProjects.has(proj.title);
                                  return (
                                    <div
                                      key={proj.title}
                                      onClick={() => toggleProject(proj.title)}
                                      className="p-3.5 rounded-xl bg-[#0a1628] border border-slate-700/60 hover:border-slate-600 transition-colors cursor-pointer"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2.5">
                                          <div className="mt-0.5">
                                            {isChecked ? (
                                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                              <Square className="w-4 h-4 text-slate-500" />
                                            )}
                                          </div>
                                          <div>
                                            <p
                                              className={`text-sm font-semibold transition-all ${
                                                isChecked
                                                  ? 'line-through text-slate-500'
                                                  : 'text-slate-100'
                                              }`}
                                            >
                                              {proj.title}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                              {proj.description}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Milestones list */}
                          {phase.milestones && phase.milestones.length > 0 && (
                            <div>
                              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
                                Checkpoint Milestones
                              </p>
                              <ul className="space-y-1.5 text-xs text-slate-300">
                                {phase.milestones.map((m, mIdx) => (
                                  <li key={mIdx} className="flex items-start gap-2">
                                    <CheckCircle className="w-3.5 h-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                                    <span>{m}</span>
                                  </li>
                                ))}
                              </ul>
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
      </div>
    </div>
  );
}
