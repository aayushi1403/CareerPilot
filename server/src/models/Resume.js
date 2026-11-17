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
    atsScore: {
      type: Number,
      default: 78,
    },
    overallScore: {
      type: Number,
      default: 82,
    },
    status: {
      type: String,
      enum: ['uploaded', 'parsed', 'analyzed'],
      default: 'analyzed',
    },
    sections: {
      type: [resumeSectionSchema],
      default: [
        {
          name: 'Work Experience',
          score: 85,
          feedback: 'Strong descriptions with quantifiable impact. Good use of action verbs.',
          suggestions: ['Add more metrics to recent achievements', 'Highlight leadership responsibilities'],
        },
        {
          name: 'Skills',
          score: 80,
          feedback: 'Good breadth of technical skills. Missing some in-demand cloud and testing tools.',
          suggestions: ['Add Next.js & Docker', 'Include testing frameworks (Vitest/Jest)'],
        },
        {
          name: 'Education',
          score: 90,
          feedback: 'Education section is complete and well formatted.',
          suggestions: ['Add relevant online certifications or honors'],
        },
        {
          name: 'Formatting & ATS',
          score: 74,
          feedback: 'Clean typography; ensure standard headings for optimal ATS parsing.',
          suggestions: ['Use standard single-column layout', 'Avoid graphics or complex table structures'],
        },
      ],
    },
    keywords: {
      found: {
        type: [String],
        default: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'REST API', 'Git', 'CSS', 'HTML5'],
      },
      missing: {
        type: [String],
        default: ['Next.js', 'CI/CD', 'Docker', 'PostgreSQL', 'Testing (Vitest)'],
      },
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;

