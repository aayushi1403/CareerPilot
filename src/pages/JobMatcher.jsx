import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Search,
  Filter,
  Bookmark,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
} from 'lucide-react';
import { jobListings, userProfile } from '../data/mockData';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import DemoBanner from '../components/DemoBanner';

// ── Match badge color ─────────────────────────────────────────
const matchVariant = (score) => {
  if (score >= 90) return 'success';
  if (score >= 75) return 'violet';
  return 'default';
};

// ── Job Card ──────────────────────────────────────────────────
const JobCard = ({ job, saved, onToggleSave, onSelect }) => {
  return (
    <Card hover padding="none" className="flex flex-col cursor-pointer" onClick={() => onSelect(job)}>
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Top row: company + match score */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
              <Briefcase size={16} className="text-violet-400" />
            </div>
            <span className="text-sm font-semibold text-violet-400">{job.company}</span>
          </div>
          <Badge variant={matchVariant(job.matchScore)} size="sm">
            {job.matchScore}% match
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-100 leading-snug hover:text-violet-300 transition-colors">
          {job.title}
        </h3>

        {/* Location + type */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin size={13} /> {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} /> {job.type}
          </span>
        </div>

        {/* Salary */}
        <div className="flex items-center gap-1 text-cyan-400 text-sm font-medium">
          <DollarSign size={14} />
          {job.salary}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {job.tags.map((tag) => (
            <Badge key={tag} variant="info" size="sm">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 line-clamp-2 flex-1">{job.description}</p>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-700/40 mt-auto pt-3">
        <span className="text-xs text-slate-500">Posted {job.posted}</span>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onToggleSave(job.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
            title={saved ? 'Unsave' : 'Save'}
            aria-label={saved ? 'Unsave job' : 'Save job'}
          >
            <Bookmark
              size={16}
              className={saved ? 'fill-violet-400 text-violet-400' : ''}
            />
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onSelect(job)}
          >
            View Details <ChevronRight size={13} className="ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const JobMatcher = () => {
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [matchFilter, setMatchFilter] = useState('All');
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicantName, setApplicantName] = useState(userProfile.name);
  const [applicantEmail, setApplicantEmail] = useState(userProfile.email);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  // Derive unique filter options
  const locations = useMemo(
    () => ['All', ...Array.from(new Set(jobListings.map((j) => j.location)))],
    []
  );
  const types = useMemo(
    () => ['All', ...Array.from(new Set(jobListings.map((j) => j.type)))],
    []
  );

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return jobListings.filter((job) => {
      const matchesSearch =
        !q || job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q);
      const matchesLocation =
        locationFilter === 'All' || job.location === locationFilter;
      const matchesType = typeFilter === 'All' || job.type === typeFilter;
      const matchesScore =
        matchFilter === 'All' ||
        (matchFilter === '90+' && job.matchScore >= 90) ||
        (matchFilter === '75+' && job.matchScore >= 75) ||
        (matchFilter === '<75' && job.matchScore < 75);
      return matchesSearch && matchesLocation && matchesType && matchesScore;
    });
  }, [search, locationFilter, typeFilter, matchFilter]);

  const toggleSave = (id) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch('');
    setLocationFilter('All');
    setTypeFilter('All');
    setMatchFilter('All');
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!applicantName.trim()) {
      setApplyError('Please enter your full name.');
      return;
    }
    if (!applicantEmail.trim() || !applicantEmail.includes('@')) {
      setApplyError('Please enter a valid email address.');
      return;
    }
    setApplyError('');
    setApplySuccess(true);
    setTimeout(() => {
      setApplySuccess(false);
      setShowApplyModal(false);
    }, 2000);
  };

  const selectClass =
    'bg-[#0a1628] border border-slate-700/50 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500/50 cursor-pointer';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-100">
          Job <span className="gradient-text">Matcher</span>
        </h1>
        <p className="text-slate-400">
          <span className="gradient-text font-medium">AI-matched</span> opportunities tailored to your profile
        </p>
      </div>

      <DemoBanner message="Demo Mode — Job listings and match scores are sample data for preview only. No real job applications are submitted." />

      {/* ── Stats Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">24</p>
          <p className="text-xs text-slate-400 mt-0.5">Jobs Matched</p>
        </div>
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-violet-400">8</p>
          <p className="text-xs text-slate-400 mt-0.5">New Today</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">97%</p>
          <p className="text-xs text-slate-400 mt-0.5">Top Match</p>
        </div>
      </div>

      {/* ── Search & Filter Bar ──────────────────────────────── */}
      <Card padding="sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles, companies..."
              className="w-full bg-[#0a1628] border border-slate-700/50 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          {/* Filter icon */}
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <Filter size={15} /> Filters:
          </div>

          {/* Location */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className={selectClass}
          >
            <option value="All">📍 All Locations</option>
            {locations.slice(1).map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={selectClass}
          >
            <option value="All">🕐 All Types</option>
            {types.slice(1).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Match Score */}
          <select
            value={matchFilter}
            onChange={(e) => setMatchFilter(e.target.value)}
            className={selectClass}
          >
            <option value="All">⭐ Match Score</option>
            <option value="90+">90%+ (Excellent)</option>
            <option value="75+">75%+ (Good)</option>
            <option value="<75">Below 75%</option>
          </select>

          {/* Results count */}
          <span className="text-xs text-slate-500 ml-auto whitespace-nowrap">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </Card>

      {/* ── Job Listings Grid ────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              saved={savedJobs.has(job.id)}
              onToggleSave={toggleSave}
              onSelect={(j) => setSelectedJob(j)}
            />
          ))}
        </div>
      ) : (
        /* ── Empty State ─────────────────────────────────────── */
        <Card padding="lg">
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="p-4 rounded-full bg-slate-700/30">
              <Search size={36} className="text-slate-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-200">No jobs found</p>
              <p className="text-sm text-slate-400 mt-1">
                Try adjusting your filters or search term
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        </Card>
      )}

      {/* ── Job Details Modal ───────────────────────────────── */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1f3d] border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in-up">
            {/* Header */}
            <div className="p-6 border-b border-slate-700/60 flex items-start justify-between gap-4 bg-[#0a1628]/60">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-violet-400 font-semibold text-sm">{selectedJob.company}</span>
                  <Badge variant={matchVariant(selectedJob.matchScore)} size="sm">
                    {selectedJob.matchScore}% Match
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold text-white">{selectedJob.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1"><MapPin size={13} /> {selectedJob.location}</span>
                  <span className="flex items-center gap-1"><Clock size={13} /> {selectedJob.type}</span>
                  <span className="flex items-center gap-1 text-cyan-400 font-medium"><DollarSign size={13} /> {selectedJob.salary}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Role Overview
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {selectedJob.description}
                </p>
              </div>

              {/* Requirements & Skill Match */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-violet-400" /> Key Requirements & Skill Match
                </h3>
                <div className="space-y-2">
                  {selectedJob.requirements?.map((req, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Match Breakdown */}
              <div className="p-4 rounded-xl bg-[#050d1a] border border-slate-700/50">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Skill Analysis vs Your Profile
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.tags.map((tag) => {
                    const isMatched = userProfile.skills.some((s) => s.toLowerCase() === tag.toLowerCase());
                    return (
                      <span
                        key={tag}
                        className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                          isMatched
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        }`}
                      >
                        {isMatched ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {tag} {isMatched ? '✓ Match' : '• Gap'}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer / Apply */}
            <div className="p-5 border-t border-slate-700/60 bg-[#0a1628]/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                ⚡ Apply using your analyzed CareerPilot profile
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)}>
                  Close
                </Button>
                <Button variant="primary" size="sm" onClick={() => setShowApplyModal(true)}>
                  Apply Now <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Easy Apply Modal ─────────────────────────────────── */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1f3d] border border-violet-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Apply to {selectedJob.company}</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {applySuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
                <p className="text-white font-semibold">Application Submitted (Demo Mode)!</p>
                <p className="text-xs text-slate-400">
                  In the live version, this application is transmitted directly to {selectedJob.company} recruiting partners.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                {applyError && (
                  <div className="p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
                    {applyError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full bg-[#0a1628] border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    className="w-full bg-[#0a1628] border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="p-3 rounded-lg bg-[#050d1a] border border-slate-700/40 text-xs text-slate-400 flex items-center justify-between">
                  <span>Attached Resume:</span>
                  <span className="text-violet-400 font-medium">demo_resume.pdf (78% ATS)</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowApplyModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="flex-1"
                  >
                    <Send size={13} className="mr-1.5" /> Submit Application
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatcher;
