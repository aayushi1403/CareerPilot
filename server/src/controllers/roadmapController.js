import Roadmap from '../models/Roadmap.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Default phases template
 */
const getDefaultPhases = (currentRole, targetRole) => [
  {
    phaseNumber: 1,
    title: `Phase 1 — Consolidate Core ${currentRole || 'Frontend'} Foundations`,
    duration: '2 months',
    status: 'completed',
    skills: ['Advanced React Patterns', 'TypeScript Generics', 'Performance Optimization'],
    resources: [
      { name: 'React Deep Dive Documentation', url: 'https://react.dev' },
      { name: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/' },
    ],
    projects: [
      {
        title: 'Modular UI Design System',
        description: 'Design accessible, themeable components with test coverage.',
        tech: ['React', 'TypeScript', 'Tailwind'],
        completed: true,
      },
    ],
    progress: 100,
  },
  {
    phaseNumber: 2,
    title: 'Phase 2 — Backend & API Architecture',
    duration: '3 months',
    status: 'in-progress',
    skills: ['Node.js & Express', 'PostgreSQL & Prisma', 'REST & GraphQL APIs'],
    resources: [
      { name: 'Node.js Best Practices', url: 'https://nodejs.org' },
      { name: 'Prisma Getting Started', url: 'https://www.prisma.io' },
    ],
    projects: [
      {
        title: 'Full-Stack Task & Workspace API',
        description: 'Build JWT authenticated endpoints with role-based permissions.',
        tech: ['Node.js', 'Express', 'PostgreSQL'],
        completed: false,
      },
    ],
    progress: 50,
  },
  {
    phaseNumber: 3,
    title: 'Phase 3 — Containerization & DevOps',
    duration: '2 months',
    status: 'pending',
    skills: ['Docker & Compose', 'GitHub Actions CI/CD', 'Cloud Deployment'],
    resources: [
      { name: 'Docker Handbook', url: 'https://docs.docker.com' },
      { name: 'GitHub Actions Documentation', url: 'https://docs.github.com' },
    ],
    projects: [
      {
        title: 'Multi-Service CI/CD Deployment',
        description: 'Automate container staging builds and automated testing workflows.',
        tech: ['Docker', 'GitHub Actions'],
        completed: false,
      },
    ],
    progress: 0,
  },
  {
    phaseNumber: 4,
    title: `Phase 4 — Senior Level Portfolio & Capstone for ${targetRole || 'Full-Stack'}`,
    duration: '3 months',
    status: 'pending',
    skills: ['System Design', 'Microservices', 'Caching Strategies (Redis)'],
    resources: [
      { name: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' },
    ],
    projects: [
      {
        title: 'Production SaaS Capstone',
        description: 'Deploy an end-to-end cloud solution showcasing high availability.',
        tech: ['Next.js', 'PostgreSQL', 'Redis', 'Docker'],
        completed: false,
      },
    ],
    progress: 0,
  },
];

/**
 * @desc    Create a new career roadmap
 * @route   POST /api/roadmaps
 * @access  Private
 */
export const createRoadmap = async (req, res, next) => {
  try {
    const { currentRole, targetRole, timelineMonths, phases } = req.body;

    const roadmapPhases = phases && phases.length > 0
      ? phases
      : getDefaultPhases(currentRole, targetRole);

    const roadmap = new Roadmap({
      userId: req.user._id,
      currentRole: currentRole || req.user.targetJobRole || 'Frontend Developer',
      targetRole: targetRole || 'Senior Full-Stack Engineer',
      timelineMonths: timelineMonths || 12,
      phases: roadmapPhases,
    });

    roadmap.recalculateProgress();
    await roadmap.save();

    return successResponse(res, 201, 'Career roadmap created successfully', {
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Retrieve user's roadmaps (most recent first)
 * @route   GET /api/roadmaps
 * @access  Private
 */
export const getRoadmaps = async (req, res, next) => {
  try {
    let roadmap = await Roadmap.findOne({
      userId: req.user._id,
      isArchived: false,
    }).sort({ createdAt: -1 });

    // If user doesn't have an active roadmap yet, generate default one
    if (!roadmap) {
      const defaultPhases = getDefaultPhases(req.user.targetJobRole, 'Senior Full-Stack Engineer');
      roadmap = new Roadmap({
        userId: req.user._id,
        currentRole: req.user.targetJobRole || 'Frontend Developer',
        targetRole: 'Senior Full-Stack Engineer',
        timelineMonths: 12,
        phases: defaultPhases,
      });
      roadmap.recalculateProgress();
      await roadmap.save();
    }

    return successResponse(res, 200, 'Career roadmap retrieved successfully', {
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get roadmap by ID
 * @route   GET /api/roadmaps/:id
 * @access  Private
 */
export const getRoadmapById = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!roadmap) {
      return errorResponse(res, 404, 'Roadmap not found or access unauthorized.');
    }

    return successResponse(res, 200, 'Roadmap details retrieved', {
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update roadmap progress (phase or project completion)
 * @route   PATCH /api/roadmaps/:id/progress
 * @access  Private
 */
export const updateRoadmapProgress = async (req, res, next) => {
  try {
    const { phaseNumber, phaseStatus, projectTitle, projectCompleted } = req.body;

    const roadmap = await Roadmap.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!roadmap) {
      return errorResponse(res, 404, 'Roadmap not found.');
    }

    // Update phase status if provided
    if (phaseNumber !== undefined && phaseStatus !== undefined) {
      const phase = roadmap.phases.find((p) => p.phaseNumber === Number(phaseNumber));
      if (phase) {
        phase.status = phaseStatus;
        if (phaseStatus === 'completed') phase.progress = 100;
        else if (phaseStatus === 'pending') phase.progress = 0;
      }
    }

    // Update specific project completion if provided
    if (projectTitle) {
      roadmap.phases.forEach((phase) => {
        const proj = phase.projects?.find((p) => p.title.toLowerCase() === projectTitle.toLowerCase());
        if (proj) {
          proj.completed = Boolean(projectCompleted);
        }
      });
    }

    roadmap.recalculateProgress();
    await roadmap.save();

    return successResponse(res, 200, 'Roadmap progress updated successfully', {
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};

