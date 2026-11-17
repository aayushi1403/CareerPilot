import Job from '../models/Job.js';
import { initialJobs } from '../utils/seedJobs.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Ensure database has initial sample job records if empty
 */
const ensureInitialJobs = async () => {
  const count = await Job.countDocuments();
  if (count === 0) {
    await Job.insertMany(initialJobs);
    console.log(`[Job Seed] Seeded ${initialJobs.length} initial job opportunities.`);
  }
};

/**
 * @desc    Retrieve and filter job listings
 * @route   GET /api/jobs
 * @access  Public
 */
export const getJobs = async (req, res, next) => {
  try {
    await ensureInitialJobs();

    const {
      q,
      location,
      type,
      tags,
      minScore,
      isRemote,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // Search query on title, company, or description
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      query.$or = [
        { title: regex },
        { company: regex },
        { description: regex },
        { tags: regex },
      ];
    }

    // Location filter
    if (location && location !== 'All') {
      query.location = new RegExp(location, 'i');
    }

    // Type filter
    if (type && type !== 'All') {
      query.type = type;
    }

    // Remote filter
    if (isRemote !== undefined) {
      query.isRemote = isRemote === 'true';
    }

    // Minimum match score filter
    if (minScore) {
      query.matchScore = { $gte: Number(minScore) };
    }

    // Tags filter
    if (tags) {
      const tagList = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
      query.tags = { $in: tagList };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [jobs, totalCount] = await Promise.all([
      Job.find(query).sort({ matchScore: -1, createdAt: -1 }).skip(skip).limit(limitNum),
      Job.countDocuments(query),
    ]);

    return successResponse(res, 200, 'Jobs retrieved successfully', {
      total: totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single job by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return errorResponse(res, 404, 'Job listing not found.');
    }

    return successResponse(res, 200, 'Job details retrieved successfully', {
      job,
    });
  } catch (error) {
    next(error);
  }
};

