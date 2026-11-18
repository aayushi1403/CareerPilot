import crypto from 'crypto';

/**
 * In-memory development store used when MongoDB daemon is not running locally.
 * Guarantees strict multi-user isolation, real registration, password hashing, and user-specific resume scoping.
 */
class DevStore {
  constructor() {
    this.users = new Map(); // id -> user object
    this.resumes = []; // array of resume objects
  }

  findUserByEmail(email) {
    if (!email) return null;
    const norm = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === norm) {
        return user;
      }
    }
    return null;
  }

  findUserById(id) {
    return this.users.get(String(id)) || null;
  }

  saveUser(userData) {
    const id = userData._id ? String(userData._id) : `dev_user_${crypto.randomUUID()}`;
    const user = {
      _id: id,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      password: userData.password, // bcrypt hashed
      targetJobRole: userData.targetJobRole || 'Full-Stack Developer',
      skills: Array.isArray(userData.skills) ? userData.skills : ['React', 'JavaScript', 'Node.js'],
      education: userData.education || [],
      graduationYear: userData.graduationYear || '',
      experienceLevel: userData.experienceLevel || 'Mid-level',
      bio: userData.bio || '',
      location: userData.location || '',
      resumeScore: userData.resumeScore || 0,
      interviewScore: userData.interviewScore || 0,
      profileCompletion: userData.profileCompletion || 50,
      role: 'user',
      createdAt: userData.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  updateUser(id, updateData) {
    const existing = this.findUserById(id);
    if (!existing) return null;
    Object.assign(existing, updateData, { updatedAt: new Date() });
    return existing;
  }

  // Resumes
  saveResume(resumeData) {
    const id = resumeData._id ? String(resumeData._id) : `dev_res_${crypto.randomUUID()}`;
    const resume = {
      ...resumeData,
      _id: id,
      userId: String(resumeData.userId),
      createdAt: resumeData.createdAt || new Date(),
    };
    this.resumes.push(resume);
    return resume;
  }

  findResumesByUserId(userId) {
    return this.resumes.filter((r) => String(r.userId) === String(userId));
  }

  findResumeByIdAndUserId(resumeId, userId) {
    return (
      this.resumes.find(
        (r) => String(r._id) === String(resumeId) && String(r.userId) === String(userId)
      ) || null
    );
  }

  deleteResume(resumeId, userId) {
    const idx = this.resumes.findIndex(
      (r) => String(r._id) === String(resumeId) && String(r.userId) === String(userId)
    );
    if (idx !== -1) {
      this.resumes.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export const devStore = new DevStore();
