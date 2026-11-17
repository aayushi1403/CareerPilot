import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Resume from '../src/models/Resume.js';
import Roadmap from '../src/models/Roadmap.js';
import Job from '../src/models/Job.js';
import Chat from '../src/models/Chat.js';
import { initialJobs } from '../src/utils/seedJobs.js';

// In-memory data store
export const memoryStore = {
  users: [],
  resumes: [],
  roadmaps: [],
  jobs: [...initialJobs.map((j, i) => ({ ...j, _id: `job_${i + 1}` }))],
  chats: [],
};

// Reset store
export const resetMemoryStore = () => {
  memoryStore.users = [];
  memoryStore.resumes = [];
  memoryStore.roadmaps = [];
  memoryStore.jobs = [...initialJobs.map((j, i) => ({ ...j, _id: `job_${i + 1}` }))];
  memoryStore.chats = [];
};

let isMocked = false;

export const setupMockDb = () => {
  if (isMocked) return;
  isMocked = true;

  // Mock User
  User.findOne = (query) => {
    let result = null;
    if (query?.email) {
      result = memoryStore.users.find((u) => u.email.toLowerCase() === query.email.toLowerCase()) || null;
    }
    const createChain = (res) => {
      const chainable = Promise.resolve(res);
      chainable.select = () => Promise.resolve(res);
      return chainable;
    };
    return createChain(result);
  };

  User.findById = (id) => {
    const user = memoryStore.users.find((u) => String(u._id) === String(id)) || null;
    const chainable = Promise.resolve(user);
    chainable.select = () => Promise.resolve(user);
    return chainable;
  };

  User.findByIdAndUpdate = async (id, update) => {
    const user = memoryStore.users.find((u) => String(u._id) === String(id));
    if (user) {
      Object.assign(user, update);
    }
    return user;
  };

  User.prototype.save = async function () {
    if (!this._id) {
      this._id = new mongoose.Types.ObjectId();
    }
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = new Date();

    if (this.password && !this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 10);
    }

    const existingIndex = memoryStore.users.findIndex((u) => String(u._id) === String(this._id));
    if (existingIndex >= 0) {
      memoryStore.users[existingIndex] = this;
    } else {
      memoryStore.users.push(this);
    }
    return this;
  };

  // Mock Resume
  Resume.find = (query) => {
    const filtered = memoryStore.resumes.filter((r) => String(r.userId) === String(query?.userId));
    return {
      sort: () => Promise.resolve(filtered),
    };
  };

  Resume.findOne = async (query) => {
    return memoryStore.resumes.find(
      (r) => String(r._id) === String(query?._id) && String(r.userId) === String(query?.userId)
    ) || null;
  };

  Resume.deleteOne = async (query) => {
    const initialLen = memoryStore.resumes.length;
    memoryStore.resumes = memoryStore.resumes.filter(
      (r) => !(String(r._id) === String(query?._id))
    );
    return { deletedCount: initialLen - memoryStore.resumes.length };
  };

  Resume.prototype.save = async function () {
    if (!this._id) {
      this._id = new mongoose.Types.ObjectId();
    }
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = new Date();

    const existingIndex = memoryStore.resumes.findIndex((r) => String(r._id) === String(this._id));
    if (existingIndex >= 0) {
      memoryStore.resumes[existingIndex] = this;
    } else {
      memoryStore.resumes.push(this);
    }
    return this;
  };

  // Mock Roadmap
  Roadmap.findOne = (query) => {
    let item;
    if (query?._id) {
      item = memoryStore.roadmaps.find(
        (r) => String(r._id) === String(query._id) && (!query.userId || String(r.userId) === String(query.userId))
      );
    } else {
      item = memoryStore.roadmaps.find(
        (r) => String(r.userId) === String(query?.userId) && (!query.isArchived || r.isArchived === false)
      );
    }

    return {
      sort: () => Promise.resolve(item || null),
      then: (resolve, reject) => Promise.resolve(item || null).then(resolve, reject),
    };
  };

  Roadmap.prototype.save = async function () {
    if (!this._id) {
      this._id = new mongoose.Types.ObjectId();
    }
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = new Date();

    const existingIndex = memoryStore.roadmaps.findIndex((r) => String(r._id) === String(this._id));
    if (existingIndex >= 0) {
      memoryStore.roadmaps[existingIndex] = this;
    } else {
      memoryStore.roadmaps.push(this);
    }
    return this;
  };

  // Mock Job
  Job.countDocuments = async (_query) => {
    return memoryStore.jobs.length;
  };

  Job.find = (query) => {
    let result = [...memoryStore.jobs];
    if (query?.type) {
      result = result.filter((j) => j.type === query.type);
    }
    return {
      sort: () => ({
        skip: (s) => ({
          limit: (l) => Promise.resolve(result.slice(s, s + l)),
        }),
      }),
    };
  };

  Job.findById = async (id) => {
    return memoryStore.jobs.find((j) => String(j._id) === String(id)) || null;
  };

  Job.insertMany = async (jobs) => {
    const mapped = jobs.map((j, i) => ({ ...j, _id: `job_${Date.now()}_${i}` }));
    memoryStore.jobs.push(...mapped);
    return mapped;
  };

  // Mock Chat
  Chat.find = (query) => {
    const userChats = memoryStore.chats.filter((c) => String(c.userId) === String(query?.userId));
    return {
      select: () => ({
        sort: () => Promise.resolve(userChats),
      }),
    };
  };

  Chat.findOne = async (query) => {
    return memoryStore.chats.find(
      (c) => String(c._id) === String(query?._id) && String(c.userId) === String(query?.userId)
    ) || null;
  };

  Chat.deleteOne = async (query) => {
    const initialLen = memoryStore.chats.length;
    memoryStore.chats = memoryStore.chats.filter(
      (c) => !(String(c._id) === String(query?._id) && String(c.userId) === String(query?.userId))
    );
    return { deletedCount: initialLen - memoryStore.chats.length };
  };

  Chat.prototype.save = async function () {
    if (!this._id) {
      this._id = new mongoose.Types.ObjectId();
    }
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = new Date();

    const existingIndex = memoryStore.chats.findIndex((c) => String(c._id) === String(this._id));
    if (existingIndex >= 0) {
      memoryStore.chats[existingIndex] = this;
    } else {
      memoryStore.chats.push(this);
    }
    return this;
  };
};
