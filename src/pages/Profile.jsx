import { useState } from 'react';
import { userProfile } from '../data/mockData';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import DemoBanner from '../components/DemoBanner';
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  Edit2,
  Camera,
  Star,
  Award,
  TrendingUp,
  Plus,
  X,
  Save,
} from 'lucide-react';

const mockExperience = [
  {
    id: 1,
    role: 'Frontend Developer',
    company: 'TechCorp Inc.',
    period: 'Jan 2022 – Present',
    description:
      'Built and maintained React-based web applications serving 50k+ daily users. Led migration from JavaScript to TypeScript, reducing production bugs by 30%.',
  },
  {
    id: 2,
    role: 'Junior Frontend Developer',
    company: 'Startup Studio',
    period: 'Jun 2020 – Dec 2021',
    description:
      'Developed responsive UI components and collaborated with designers to implement pixel-perfect interfaces. Participated in agile sprints and code reviews.',
  },
];

const mockEducation = [
  {
    id: 1,
    degree: 'B.S. Computer Science',
    school: 'University of California, Berkeley',
    period: '2016 – 2020',
    gpa: '3.7 / 4.0',
  },
];

export default function Profile() {
  const [bio, setBio] = useState(
    'Passionate frontend developer with 3+ years of experience building performant, accessible web applications. I love clean code, great UX, and working with modern JavaScript tooling.'
  );
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(bio);

  const [skills, setSkills] = useState(userProfile.skills);
  const [newSkill, setNewSkill] = useState('');
  const [addingSkill, setAddingSkill] = useState(false);

  const saveBio = () => {
    setBio(bioInput);
    setEditingBio(false);
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setNewSkill('');
    setAddingSkill(false);
  };

  const removeSkill = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const initials = userProfile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[#050d1a] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <User className="w-6 h-6 text-violet-400" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">My Profile</h1>
          </div>
          <p className="text-slate-400 ml-14">Manage your career identity and preferences</p>
        </div>

        <DemoBanner />

        {/* Profile Hero Card */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-violet-600 flex items-center justify-center glow-violet">
                <span className="text-2xl font-bold text-white">{initials}</span>
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-[#0a1628] border border-slate-700 rounded-full text-slate-400 hover:text-violet-400 transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-slate-100">{userProfile.name}</h2>
                <Badge variant="violet" size="sm">
                  <Star className="w-3 h-3 mr-1 inline" />
                  {userProfile.profileCompletion}% Complete
                </Badge>
              </div>
              <p className="text-slate-300 font-medium mb-3">{userProfile.title}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {userProfile.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-500" />
                  {userProfile.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  {userProfile.experience} experience
                </span>
              </div>
            </div>

            {/* Edit button */}
            <Button variant="secondary" size="sm" className="flex-shrink-0">
              <Edit2 className="w-4 h-4 mr-1" />
              Edit Profile
            </Button>
          </div>

          {/* Profile Completion Bar */}
          <div className="mt-6">
            <ProgressBar
              label="Profile Completion"
              value={userProfile.profileCompletion}
              color="violet"
              showValue={true}
            />
          </div>
        </Card>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT COLUMN */}
          <div className="space-y-6">

            {/* About */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-100 font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-violet-400" />
                  About
                </h3>
                {!editingBio ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setBioInput(bio);
                      setEditingBio(true);
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingBio(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={saveBio}>
                      <Save className="w-3.5 h-3.5 mr-1" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
              {editingBio ? (
                <textarea
                  rows={4}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="w-full bg-[#0a1628] border border-slate-700/50 rounded-xl p-3 text-slate-200 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-violet-500/60"
                />
              ) : (
                <p className="text-slate-400 text-sm leading-relaxed">{bio}</p>
              )}
            </Card>

            {/* Skills */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-100 font-semibold flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  Skills
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddingSkill((v) => !v)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Skill
                </Button>
              </div>

              {addingSkill && (
                <div className="mb-3 flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    placeholder="e.g. Next.js"
                    className="flex-1 bg-[#0a1628] border border-slate-700/50 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/60"
                    autoFocus
                  />
                  <Button variant="primary" size="sm" onClick={addSkill}>
                    Add
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="group flex items-center gap-1 px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 text-sm"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-violet-400/50 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">

            {/* Career Stats */}
            <Card className="p-5">
              <h3 className="text-slate-100 font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                Career Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Resume Score', value: `${userProfile.resumeScore}%`, color: 'text-violet-400' },
                  { label: 'Jobs Applied', value: userProfile.jobsApplied, color: 'text-cyan-400' },
                  { label: 'Interview Score', value: `${userProfile.interviewScore}%`, color: 'text-emerald-400' },
                  { label: 'Experience', value: userProfile.experience, color: 'text-amber-400' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-[#0a1628] rounded-xl p-4 border border-slate-700/50"
                  >
                    <p className={`text-2xl font-bold ${stat.color} mb-0.5`}>{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Experience */}
            <Card className="p-5">
              <h3 className="text-slate-100 font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                Experience
              </h3>
              <div className="space-y-5">
                {mockExperience.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className={`pb-5 ${idx < mockExperience.length - 1 ? 'border-b border-slate-700/50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="text-slate-100 font-medium">{exp.role}</p>
                        <p className="text-violet-400 text-sm">{exp.company}</p>
                      </div>
                      <span className="text-xs text-slate-500 flex-shrink-0">{exp.period}</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Education */}
            <Card className="p-5">
              <h3 className="text-slate-100 font-semibold mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                Education
              </h3>
              {mockEducation.map((edu) => (
                <div key={edu.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-slate-100 font-medium">{edu.degree}</p>
                      <p className="text-violet-400 text-sm">{edu.school}</p>
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0">{edu.period}</span>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">GPA: {edu.gpa}</p>
                </div>
              ))}
            </Card>
          </div>
        </div>

        {/* Privacy note */}
        <p className="text-center text-xs text-slate-600 pb-4">
          🔒 Demo Mode — All profile data shown is sample data. In the full version, your data
          is encrypted and private to you.
        </p>
      </div>
    </div>
  );
}
