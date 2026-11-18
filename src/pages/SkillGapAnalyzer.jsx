import React, { useState } from 'react';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  GraduationCap,
  Award,
} from 'lucide-react';
import { skillGapData } from '../data/mockData';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import DemoBanner from '../components/DemoBanner';
import { getSkillGapAnalysisAiApi } from '../services/api';

export default function SkillGapAnalyzer() {
  const [selectedRoleId, setSelectedRoleId] = useState(skillGapData.roles[0].id);
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [aiGapData, setAiGapData] = useState(null);

  const currentRoleData =
    skillGapData.roles.find((r) => r.id === selectedRoleId) ?? skillGapData.roles[0];

  const handleToggleCourse = (courseName) => {
    setEnrolledCourses((prev) => {
      const next = new Set(prev);
      if (next.has(courseName)) next.delete(courseName);
      else next.add(courseName);
      return next;
    });
  };

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const skillsPayload = currentRoleData.currentSkills.map((s) => s.name);
      const res = await getSkillGapAnalysisAiApi({
        targetRole: currentRoleData.title,
        currentSkills: skillsPayload,
      });
      if (res?.data?.skillGap) {
        setAiGapData({
          ...res.data.skillGap,
          isAiGenerated: res.data.isAiGenerated,
          model: res.data.model,
        });
      }
      setPlanGenerated(true);
    } catch (err) {
      console.warn('[Skill Gap AI Error]:', err.message);
      setPlanGenerated(true);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const getPriorityBadge = (importance) => {
    switch (importance.toLowerCase()) {
      case 'critical':
        return <Badge variant="error" size="sm">Critical Gap</Badge>;
      case 'high':
        return <Badge variant="warning" size="sm">High Priority</Badge>;
      default:
        return <Badge variant="info" size="sm">Recommended</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-violet-500/20 rounded-lg">
            <Target className="w-6 h-6 text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100">
            Skill Gap <span className="gradient-text">Analyzer</span>
          </h1>
        </div>
        <p className="text-slate-400 ml-10">
          Compare your current skillset against industry standards for target roles
        </p>
      </div>

      <DemoBanner />

      {/* ── Role Selector & Target Benchmark ─────────────────── */}
      <Card className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Select Target Career Role
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {skillGapData.roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRoleId(role.id);
                    setPlanGenerated(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    selectedRoleId === role.id
                      ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-600/25'
                      : 'bg-[#0a1628] text-slate-400 border-slate-700/60 hover:border-slate-500 hover:text-slate-200'
                  }`}
                >
                  {role.title}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleGeneratePlan}
            disabled={isGeneratingPlan}
            className="self-start sm:self-auto"
          >
            <Sparkles size={14} className="mr-1.5 text-violet-400" />
            {isGeneratingPlan ? 'Analyzing Gaps...' : 'Generate AI Learning Plan'}
          </Button>
        </div>

        {/* Role Quick Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#050d1a] border border-slate-700/50">
          <div>
            <span className="text-xs text-slate-500">Skill Match</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-violet-400">
                {currentRoleData.matchPercentage}%
              </span>
              <span className="text-xs text-slate-400">Coverage</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-500">Market Demand</span>
            <p className="text-base font-semibold text-emerald-400 mt-0.5">
              🔥 {currentRoleData.marketDemand}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Average Salary</span>
            <p className="text-base font-semibold text-cyan-400 mt-0.5">
              {currentRoleData.avgSalary}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Identified Gaps</span>
            <p className="text-base font-semibold text-amber-400 mt-0.5">
              {currentRoleData.missingSkills.length} Critical Skills
            </p>
          </div>
        </div>
      </Card>

      {/* Plan Generated Notification */}
      {planGenerated && (
        <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-start justify-between gap-3 animate-fade-in-up">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-violet-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-100">
                  AI Action Plan Generated for {currentRoleData.title}
                </p>
                <Badge variant={aiGapData?.isAiGenerated ? 'violet' : 'neutral'} size="sm">
                  {aiGapData?.isAiGenerated ? 'Gemini 1.5 Flash' : 'Domain Benchmark'}
                </Badge>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {aiGapData?.overallAnalysis ||
                  `Mastering the top 2 missing skills below will boost your role compatibility from ${currentRoleData.matchPercentage}% to ${currentRoleData.matchPercentage + 18}% in approximately 4–6 weeks.`}
              </p>
            </div>
          </div>
          {aiGapData?.readinessScore !== undefined && (
            <div className="text-right flex-shrink-0 pl-3 border-l border-violet-500/30">
              <span className="text-xs text-slate-400">Readiness</span>
              <p className="text-xl font-bold text-cyan-400">{aiGapData.readinessScore}%</p>
            </div>
          )}
        </div>
      )}

      {/* ── Two Columns: Current Skills vs Missing Skills ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Current Profile Skills */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-slate-100">
                Current Matching Skills ({currentRoleData.currentSkills.length})
              </h2>
            </div>
            <span className="text-xs text-slate-500">From Profile</span>
          </div>

          <div className="space-y-4">
            {currentRoleData.currentSkills.map((skill) => (
              <div
                key={skill.name}
                className="p-3.5 rounded-xl bg-[#050d1a]/60 border border-slate-700/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-200">{skill.name}</span>
                    <Badge variant="success" size="sm">{skill.level}</Badge>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">
                    {skill.currentProficiency}% / {skill.requiredProficiency}% Required
                  </span>
                </div>
                <ProgressBar
                  value={skill.currentProficiency}
                  color="green"
                  size="sm"
                  showValue={false}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column: Missing Skills (Skill Gaps) */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-slate-100">
                Missing Skill Gaps ({currentRoleData.missingSkills.length})
              </h2>
            </div>
            <span className="text-xs text-amber-400/80 font-medium">Requires Attention</span>
          </div>

          <div className="space-y-4">
            {currentRoleData.missingSkills.map((gap) => {
              const isEnrolled = enrolledCourses.has(gap.suggestedCourse);
              return (
                <div
                  key={gap.name}
                  className="p-4 rounded-xl bg-[#050d1a]/70 border border-amber-500/20 hover:border-amber-500/40 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-100">{gap.name}</span>
                        {getPriorityBadge(gap.importance)}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{gap.reason}</p>
                    </div>
                    <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 flex-shrink-0">
                      +{gap.matchWeight}
                    </span>
                  </div>

                  {/* Course recommendation item */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0a1628] border border-slate-700/50 text-xs">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <GraduationCap className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      <span className="text-slate-300 truncate font-medium">
                        {gap.suggestedCourse}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> ~{gap.estHours}h
                      </span>
                      <button
                        onClick={() => handleToggleCourse(gap.suggestedCourse)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                          isEnrolled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-violet-600/30 text-violet-300 hover:bg-violet-600/50 border border-violet-500/40'
                        }`}
                      >
                        {isEnrolled ? '✓ Enrolled' : '+ Add to Plan'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Skill Improvement Strategy Box ───────────────────── */}
      <Card className="p-6 border-violet-500/30">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400 flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-semibold text-slate-100">
              Personalized Skill Improvement Strategy
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Based on your resume and target role as a <strong>{currentRoleData.title}</strong>, we recommend completing the high-priority gaps first. Adding <strong>Next.js 14</strong> and <strong>PostgreSQL</strong> will significantly raise your resume match ranking for top hiring algorithms.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
