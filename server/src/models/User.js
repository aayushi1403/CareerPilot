import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, default: '' },
    school: { type: String, default: '' },
    year: { type: String, default: '' },
    gpa: { type: String, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    education: {
      type: [educationSchema],
      default: [],
    },
    graduationYear: {
      type: String,
      default: '',
    },
    targetJobRole: {
      type: String,
      default: 'Full-Stack Developer',
      trim: true,
    },
    skills: {
      type: [String],
      default: ['React', 'JavaScript', 'Node.js', 'Git'],
    },
    experienceLevel: {
      type: String,
      enum: ['Entry-level', 'Mid-level', 'Senior', 'Lead', 'Executive'],
      default: 'Mid-level',
    },
    bio: {
      type: String,
      default: '',
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    location: {
      type: String,
      default: '',
    },
    resumeScore: {
      type: Number,
      default: 78,
    },
    interviewScore: {
      type: Number,
      default: 82,
    },
    profileCompletion: {
      type: Number,
      default: 85,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password prior to saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare input password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate and refresh profile completion
userSchema.methods.calculateProfileCompletion = function () {
  let score = 20; // Base score for registration
  if (this.name) score += 10;
  if (this.email) score += 10;
  if (this.targetJobRole) score += 15;
  if (this.skills && this.skills.length > 0) score += 15;
  if (this.education && this.education.length > 0) score += 15;
  if (this.bio) score += 10;
  if (this.location) score += 5;
  this.profileCompletion = Math.min(100, score);
  return this.profileCompletion;
};

const User = mongoose.model('User', userSchema);
export default User;

