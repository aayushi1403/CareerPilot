import mongoose from 'mongoose';

const resumeSectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    score: { type: Number, default: 75 },
    feedback: { type: String, default: '' },
    suggestions: [{ type: String }],
  },
  { _id: false }
);

const educationItemSchema = new mongoose.Schema(
  {
    degree: { type: String, default: '' },
    institution: { type: String, default: '' },
    year: { type: String, default: '' },
    gpa: { type: String, default: '' },
    details: { type: String, default: '' },
  },
  { _id: false }
);

const experienceItemSchema = new mongoose.Schema(
  {
    role: { type: String, default: '' },
    company: { type: String, default: '' },
    duration: { type: String, default: '' },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
    highlights: [{ type: String }],
  },
  { _id: false }
);

const projectItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    techStack: [{ type: String }],
    link: { type: String, default: '' },
  },
  { _id: false }
);

const structuredDataSchema = new mongoose.Schema(
  {
    contact: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
    },
    education: {
      type: [educationItemSchema],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    workExperience: {
      type: [experienceItemSchema],
      default: [],
    },
    projects: {
      type: [projectItemSchema],
      default: [],
    },
    certifications: {
      type: [String],
      default: [],
    },
    achievements: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const resumeMetadataSchema = new mongoose.Schema(
  {
    wordCount: { type: Number, default: 0 },
    characterCount: { type: Number, default: 0 },
    pageCount: { type: Number, default: 1 },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    rawText: {
      type: String,
      default: '',
    },
    extractionStatus: {
      type: String,
      enum: ['completed', 'scanned_or_empty', 'failed'],
      default: 'completed',
    },
    extractionError: {
      type: String,
      default: null,
    },
    metadata: {
      type: resumeMetadataSchema,
      default: () => ({ wordCount: 0, characterCount: 0, pageCount: 1 }),
    },
    structuredData: {
      type: structuredDataSchema,
      default: () => ({}),
    },
    atsScore: {
      type: Number,
      default: 75,
    },
    overallScore: {
      type: Number,
      default: 78,
    },
    status: {
      type: String,
      enum: ['uploaded', 'parsed', 'analyzed'],
      default: 'analyzed',
    },
    sections: {
      type: [resumeSectionSchema],
      default: [],
    },
    keywords: {
      found: {
        type: [String],
        default: [],
      },
      missing: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
