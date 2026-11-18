import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
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
  Check,
  GraduationCap,
} from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [bio, setBio] = useState('');
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [addingSkill, setAddingSkill] = useState(false);

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    targetJobRole: '',
    location: '',
    experienceLevel: 'Mid-level',
    bio: '',
    graduationYear: '',
    degree: '',
    school: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize data from current authenticated user
  useEffect(() => {
    if (user) {
      setBio(user.bio || 'Passionate software engineer building modern applications with clean code and great UX.');
      setBioInput(user.bio || 'Passionate software engineer building modern applications with clean code and great UX.');
      setSkills(user.skills || ['React', 'JavaScript', 'Node.js', 'Git']);
      const primaryEdu = Array.isArray(user.education) && user.education.length > 0 ? user.education[0] : {};
      setEditForm({
        name: user.name || '',
        targetJobRole: user.targetJobRole || 'Full-Stack Developer',
        location: user.location || 'San Francisco, CA',
        experienceLevel: user.experienceLevel || 'Mid-level',
        bio: user.bio || '',
        graduationYear: user.graduationYear || '2025',
        degree: primaryEdu.degree || 'B.S. Computer Science',
        school: primaryEdu.school || 'University of California, Berkeley',
      });
    }
  }, [user]);

  const saveBio = async () => {
    setSaving(true);
    try {
      await updateProfile({ bio: bioInput });
      setBio(bioInput);
      setEditingBio(false);
      showSuccessNotice();
    } catch (err) {
      console.error('Failed to update bio:', err);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = async () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      const nextSkills = [...skills, trimmed];
      setSkills(nextSkills);
      setNewSkill('');
      setAddingSkill(false);
      await updateProfile({ skills: nextSkills });
      showSuccessNotice();
    }
  };

  const removeSkill = async (skillToRemove) => {
    const nextSkills = skills.filter((s) => s !== skillToRemove);
    setSkills(nextSkills);
    await updateProfile({ skills: nextSkills });
    showSuccessNotice();
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: editForm.name,
        targetJobRole: editForm.targetJobRole,
        location: editForm.location,
        experienceLevel: editForm.experienceLevel,
        bio: editForm.bio,
        graduationYear: editForm.graduationYear,
        education: [
          {
            degree: editForm.degree,
            school: editForm.school,
            year: editForm.graduationYear,
            gpa: '3.8',
          },
        ],
      });
      setIsEditModalOpen(false);
      showSuccessNotice();
    } catch (err) {
      console.error('Failed to save profile modal:', err);
    } finally {
      setSaving(false);
    }
  };

  const showSuccessNotice = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const initials = (user?.name || 'CP')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const displayEdu = Array.isArray(user?.education) && user.education.length > 0
    ? user.education[0]
    : { degree: 'B.S. in Computer Science', school: 'University of California, Berkeley', year: '2025', gpa: '3.8' };

  return (
    <div className="min-h-screen bg-[#050d1a] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <User className="w-6 h-6 text-violet-400" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">My Profile</h1>
            </div>
            <p className="text-slate-400 ml-11">Manage your personalized career identity, education, and skills</p>
          </div>
          {saveSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Check size={14} /> Profile updated successfully!
            </div>
          )}
        </div>

        {/* Profile Hero Card */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-violet-600 flex items-center justify-center glow-violet select-none">
                <span className="text-2xl font-bold text-white">{initials}</span>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="absolute bottom-0 right-0 p-1.5 bg-[#0a1628] border border-slate-700 rounded-full text-slate-400 hover:text-violet-400 transition-colors"
                title="Edit profile photo / details"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-slate-100">{user?.name || 'Personal Account'}</h2>
                <Badge variant="violet" size="sm">
                  <Star className="w-3 h-3 mr-1 inline" />
                  {user?.profileCompletion || 70}% Complete
                </Badge>
              </div>
              <p className="text-slate-300 font-medium mb-3">{user?.targetJobRole || 'Full-Stack Developer'}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {user?.location || 'San Francisco, CA'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-500" />
                  {user?.email || 'authenticated@user.com'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  {user?.experienceLevel || 'Mid-level'}
                </span>
              </div>
            </div>

            {/* Edit button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="flex-shrink-0"
            >
              <Edit2 className="w-4 h-4 mr-1.5" />
              Edit Profile
            </Button>
          </div>

          {/* Profile Completion Bar */}
          <div className="mt-6">
            <ProgressBar
              label="Profile Completion"
              value={user?.profileCompletion || 70}
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
                  Professional Summary
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
                    <Button variant="primary" size="sm" onClick={saveBio} disabled={saving}>
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
                  placeholder="Tell recruiters about your key accomplishments, target roles, and strengths..."
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
                  Technical & Domain Skills
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
                    placeholder="e.g. Docker, TypeScript, Go"
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
                    className="group flex items-center gap-1 px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 text-sm font-medium"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="opacity-60 hover:opacity-100 transition-opacity ml-1 hover:text-red-400"
                      title={`Remove ${skill}`}
                    >
                      <X className="w-3.5 h-3.5" />
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
                Personal Career Metrics
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Resume ATS Score', value: `${user?.resumeScore || 75}%`, color: 'text-violet-400' },
                  { label: 'Verified Skills', value: skills.length, color: 'text-cyan-400' },
                  { label: 'Interview Readiness', value: `${user?.interviewScore || 80}%`, color: 'text-emerald-400' },
                  { label: 'Experience Level', value: user?.experienceLevel || 'Mid-level', color: 'text-amber-400' },
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

            {/* Education */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-100 font-semibold flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  Education & Background
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(true)}>
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
              </div>
              <div className="p-4 rounded-xl bg-[#0a1628] border border-slate-700/50">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-slate-100 font-medium">{displayEdu.degree || 'Degree In Progress'}</p>
                    <p className="text-violet-400 text-sm">{displayEdu.school || 'University'}</p>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">Class of {user?.graduationYear || displayEdu.year || '2025'}</span>
                </div>
                {displayEdu.gpa && <p className="text-slate-500 text-xs mt-1.5">GPA: {displayEdu.gpa}</p>}
              </div>
            </Card>
          </div>
        </div>

        {/* ── Edit Profile Modal ───────────────────────────────── */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0a1628] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Edit2 size={18} className="text-violet-400" /> Edit Profile Information
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveModal} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-[#0f1f3d] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Target Career Role
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.targetJobRole}
                    onChange={(e) => setEditForm({ ...editForm, targetJobRole: e.target.value })}
                    className="w-full bg-[#0f1f3d] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full bg-[#0f1f3d] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Experience Level
                    </label>
                    <select
                      value={editForm.experienceLevel}
                      onChange={(e) => setEditForm({ ...editForm, experienceLevel: e.target.value })}
                      className="w-full bg-[#0f1f3d] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    >
                      <option value="Entry-level">Entry-level</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Degree
                  </label>
                  <input
                    type="text"
                    value={editForm.degree}
                    onChange={(e) => setEditForm({ ...editForm, degree: e.target.value })}
                    className="w-full bg-[#0f1f3d] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      School / University
                    </label>
                    <input
                      type="text"
                      value={editForm.school}
                      onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                      className="w-full bg-[#0f1f3d] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Graduation Year
                    </label>
                    <input
                      type="text"
                      value={editForm.graduationYear}
                      onChange={(e) => setEditForm({ ...editForm, graduationYear: e.target.value })}
                      className="w-full bg-[#0f1f3d] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Bio Summary
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full bg-[#0f1f3d] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 resize-none focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-700/80">
                  <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
