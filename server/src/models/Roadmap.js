import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    tech: [{ type: String }],
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, default: '#' },
  },
  { _id: false }
);

const phaseSchema = new mongoose.Schema(
  {
    phaseNumber: { type: Number, required: true },
    title: { type: String, required: true },
    duration: { type: String, default: '2 months' },
    status: {
      type: String,
      enum: ['completed', 'in-progress', 'pending'],
      default: 'pending',
    },
    skills: [{ type: String }],
    resources: [resourceSchema],
    projects: [projectSchema],
    progress: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: true }
);

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    currentRole: {
      type: String,
      default: 'Frontend Developer',
      required: true,
    },
    targetRole: {
      type: String,
      default: 'Senior Full-Stack Engineer',
      required: true,
    },
    timelineMonths: {
      type: Number,
      default: 12,
    },
    overallProgress: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },
    phases: {
      type: [phaseSchema],
      default: [],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Method to recalculate overallProgress from phases & projects
roadmapSchema.methods.recalculateProgress = function () {
  let totalItems = 0;
  let completedItems = 0;

  this.phases.forEach((phase) => {
    if (phase.projects && phase.projects.length > 0) {
      phase.projects.forEach((proj) => {
        totalItems += 1;
        if (proj.completed) completedItems += 1;
      });
    } else {
      totalItems += 1;
      if (phase.status === 'completed') completedItems += 1;
      else if (phase.status === 'in-progress') completedItems += 0.5;
    }
  });

  this.overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  return this.overallProgress;
};

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
export default Roadmap;

