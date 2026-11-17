// ============================================================
// MOCK DATA — CareerPilot Demo
// All data below is SAMPLE / DEMO data for UI preview only.
// No real users, jobs, or companies are represented.
// ============================================================

// ─── User Profile ───────────────────────────────────────────
export const userProfile = {
  name: "Alex Johnson",
  title: "Frontend Developer",
  avatar: null, // using initials fallback
  email: "alex.johnson@demo.dev",
  location: "San Francisco, CA",
  skills: [
    "React", "TypeScript", "Node.js", "Tailwind CSS",
    "GraphQL", "PostgreSQL", "Docker", "Git",
  ],
  experience: "3 years",
  jobsApplied: 24,
  resumeScore: 78,
  interviewScore: 82,
  profileCompletion: 85,
};

// ─── Dashboard Stats ────────────────────────────────────────
export const dashboardStats = [
  {
    label: "Jobs Applied",
    value: "24",
    change: "+3 this week",
    trend: "up",
  },
  {
    label: "Profile Views",
    value: "142",
    change: "+18 this week",
    trend: "up",
  },
  {
    label: "Interview Score",
    value: "82%",
    change: "+5% vs last month",
    trend: "up",
  },
  {
    label: "Resume Score",
    value: "78%",
    change: "-2% vs last week",
    trend: "down",
  },
];

// ─── Recent Activity ────────────────────────────────────────
export const recentActivity = [
  {
    id: 1,
    type: "application",
    title: "Applied to Senior Frontend Engineer at Stripe",
    time: "2 hours ago",
    status: "pending",
  },
  {
    id: 2,
    type: "interview",
    title: "Completed mock interview — System Design",
    time: "Yesterday",
    status: "completed",
  },
  {
    id: 3,
    type: "resume",
    title: "Resume analyzed and updated score",
    time: "2 days ago",
    status: "completed",
  },
  {
    id: 4,
    type: "application",
    title: "Applied to React Developer at Vercel",
    time: "3 days ago",
    status: "reviewed",
  },
  {
    id: 5,
    type: "roadmap",
    title: "Completed Phase 1 of Full-Stack Roadmap",
    time: "1 week ago",
    status: "completed",
  },
  {
    id: 6,
    type: "application",
    title: "Applied to UI Engineer at Linear",
    time: "1 week ago",
    status: "rejected",
  },
];

// ─── Resume Analysis ────────────────────────────────────────
export const resumeAnalysis = {
  overallScore: 78,
  atsScore: 72,
  sections: [
    {
      name: "Work Experience",
      score: 85,
      feedback: "Strong descriptions with quantifiable impact. Good use of action verbs.",
      suggestions: [
        "Add more metrics to your most recent role",
        "Highlight leadership responsibilities",
      ],
    },
    {
      name: "Skills",
      score: 80,
      feedback: "Good breadth of technical skills. Missing some in-demand technologies.",
      suggestions: [
        "Add 'Next.js' — appears in 70% of matched job listings",
        "Include testing frameworks (Jest, Cypress)",
      ],
    },
    {
      name: "Education",
      score: 90,
      feedback: "Education section is well formatted and complete.",
      suggestions: [
        "Consider adding relevant online certifications",
      ],
    },
    {
      name: "Summary / Objective",
      score: 60,
      feedback: "Summary is generic and doesn't highlight your unique value proposition.",
      suggestions: [
        "Tailor summary to target Frontend Engineer roles",
        "Mention your top 2-3 achievements upfront",
      ],
    },
    {
      name: "Formatting & ATS",
      score: 72,
      feedback: "Layout is readable but may cause parsing issues for some ATS systems.",
      suggestions: [
        "Use a single-column layout for better ATS compatibility",
        "Avoid tables and text boxes",
      ],
    },
  ],
  keywords: {
    found: [
      "React", "JavaScript", "TypeScript", "CSS", "REST API",
      "Git", "Agile", "Node.js", "HTML5",
    ],
    missing: [
      "Next.js", "CI/CD", "AWS", "Jest", "Redux",
      "Webpack", "Performance Optimization",
    ],
  },
};

// ─── Job Listings ────────────────────────────────────────────
export const jobListings = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    company: "Stripe",
    location: "San Francisco, CA (Hybrid)",
    salary: "$150k – $200k",
    type: "Full-time",
    matchScore: 94,
    tags: ["React", "TypeScript", "GraphQL"],
    posted: "1 day ago",
    description:
      "Build the next generation of financial infrastructure UIs. Work with world-class engineers to craft delightful, performant user experiences.",
    requirements: [
      "5+ years of frontend engineering experience",
      "Deep expertise in React and TypeScript",
      "Experience with GraphQL APIs",
      "Strong eye for design and UX",
    ],
  },
  {
    id: 2,
    title: "React Developer",
    company: "Vercel",
    location: "Remote",
    salary: "$130k – $170k",
    type: "Full-time",
    matchScore: 91,
    tags: ["React", "Next.js", "Vercel"],
    posted: "2 days ago",
    description:
      "Join the team that powers the frontend cloud. Contribute to open-source tooling and work on products used by millions of developers.",
    requirements: [
      "3+ years of React experience",
      "Familiarity with Next.js",
      "Open-source contributions a plus",
      "Excellent communication skills",
    ],
  },
  {
    id: 3,
    title: "UI Engineer",
    company: "Linear",
    location: "Remote",
    salary: "$120k – $160k",
    type: "Full-time",
    matchScore: 88,
    tags: ["React", "CSS", "Design Systems"],
    posted: "3 days ago",
    description:
      "Help us craft the most loved project management tool for software teams. Focus on pixel-perfect UI and seamless interactions.",
    requirements: [
      "Strong CSS and animation skills",
      "Experience building design systems",
      "React proficiency",
      "Attention to detail",
    ],
  },
  {
    id: 4,
    title: "Frontend Software Engineer",
    company: "Figma",
    location: "New York, NY (Hybrid)",
    salary: "$140k – $190k",
    type: "Full-time",
    matchScore: 85,
    tags: ["JavaScript", "WebGL", "React"],
    posted: "4 days ago",
    description:
      "Work on the canvas and collaborative features of the world's leading design tool.",
    requirements: [
      "Experience with complex web applications",
      "Knowledge of canvas rendering or WebGL a plus",
      "Collaborative mindset",
    ],
  },
  {
    id: 5,
    title: "Full-Stack Developer",
    company: "Notion",
    location: "San Francisco, CA",
    salary: "$130k – $175k",
    type: "Full-time",
    matchScore: 79,
    tags: ["React", "Node.js", "PostgreSQL"],
    posted: "5 days ago",
    description:
      "Build the all-in-one workspace for teams. Work across the full stack on features used by millions.",
    requirements: [
      "Experience with React and Node.js",
      "Familiarity with PostgreSQL",
      "Ability to work across frontend and backend",
    ],
  },
  {
    id: 6,
    title: "Software Engineer — Frontend",
    company: "Loom",
    location: "Remote",
    salary: "$110k – $150k",
    type: "Full-time",
    matchScore: 76,
    tags: ["React", "TypeScript", "WebRTC"],
    posted: "1 week ago",
    description:
      "Help teams communicate asynchronously through video. Build recording, playback, and sharing features.",
    requirements: [
      "React and TypeScript experience",
      "Interest in real-time web technologies",
      "Video/media API experience a plus",
    ],
  },
  {
    id: 7,
    title: "Frontend Engineer — Growth",
    company: "Notion",
    location: "Remote",
    salary: "$120k – $160k",
    type: "Full-time",
    matchScore: 72,
    tags: ["React", "A/B Testing", "Analytics"],
    posted: "1 week ago",
    description:
      "Drive user acquisition and retention through data-driven experiments and high-quality landing pages.",
    requirements: [
      "Experience with growth engineering or marketing tech",
      "React proficiency",
      "Comfort with A/B testing frameworks",
    ],
  },
  {
    id: 8,
    title: "React Native Developer",
    company: "Shopify",
    location: "Remote",
    salary: "$125k – $165k",
    type: "Full-time",
    matchScore: 68,
    tags: ["React Native", "Mobile", "TypeScript"],
    posted: "2 weeks ago",
    description:
      "Build the mobile commerce platform used by millions of merchants worldwide.",
    requirements: [
      "React Native experience",
      "iOS and/or Android publishing experience",
      "TypeScript proficiency",
    ],
  },
];

// ─── Career Roadmap ─────────────────────────────────────────
export const roadmapData = {
  currentRole: "Frontend Developer",
  targetRole: "Senior Full-Stack Engineer",
  timelineMonths: 12,
  phases: [
    {
      id: 1,
      title: "Phase 1 — Strengthen Core Frontend",
      duration: "2 months",
      status: "completed",
      skills: ["Advanced React Patterns", "TypeScript Generics", "Performance Optimization"],
      resources: [
        { name: "React Docs — Advanced Guides", url: "#" },
        { name: "TypeScript Deep Dive", url: "#" },
      ],
      projects: [
        {
          title: "Production Component Design System",
          description: "Build an accessible, themeable UI library with Storybook, Tailwind, and Jest tests.",
          tech: ["React", "TypeScript", "Tailwind", "Storybook"],
          completed: true,
        },
      ],
    },
    {
      id: 2,
      title: "Phase 2 — Backend Fundamentals",
      duration: "3 months",
      status: "in-progress",
      skills: ["Node.js & Express", "REST & GraphQL APIs", "PostgreSQL & Prisma"],
      resources: [
        { name: "The Odin Project — NodeJS", url: "#" },
        { name: "Prisma Documentation", url: "#" },
      ],
      projects: [
        {
          title: "Full-Stack Task & Workspace API",
          description: "Implement JWT authentication, role-based access control, and PostgreSQL migrations.",
          tech: ["Node.js", "Express", "Prisma", "PostgreSQL"],
          completed: false,
        },
      ],
    },
    {
      id: 3,
      title: "Phase 3 — DevOps & Infrastructure",
      duration: "2 months",
      status: "pending",
      skills: ["Docker & Containers", "CI/CD Pipelines", "AWS Basics"],
      resources: [
        { name: "Docker Getting Started", url: "#" },
        { name: "GitHub Actions Docs", url: "#" },
      ],
      projects: [
        {
          title: "Containerized CI/CD Deployment Pipeline",
          description: "Dockerize a multi-container full-stack app and automate staging deployments with GitHub Actions.",
          tech: ["Docker", "GitHub Actions", "AWS ECS"],
          completed: false,
        },
      ],
    },
    {
      id: 4,
      title: "Phase 4 — System Design & Architecture",
      duration: "3 months",
      status: "pending",
      skills: ["Scalable System Design", "Microservices", "Caching Strategies"],
      resources: [
        { name: "System Design Primer (GitHub)", url: "#" },
        { name: "Designing Data-Intensive Applications", url: "#" },
      ],
      projects: [
        {
          title: "Distributed Rate Limiter & URL Shortener",
          description: "Design and benchmark a Redis-backed high-throughput API gateway.",
          tech: ["Redis", "Node.js", "Docker", "Nginx"],
          completed: false,
        },
      ],
    },
    {
      id: 5,
      title: "Phase 5 — Interview Prep & Job Search",
      duration: "2 months",
      status: "pending",
      skills: ["LeetCode Patterns", "Behavioral Questions", "Salary Negotiation"],
      resources: [
        { name: "Blind 75 LeetCode List", url: "#" },
        { name: "Levels.fyi Salary Data", url: "#" },
      ],
      projects: [
        {
          title: "Portfolio & Live Full-Stack Capstone",
          description: "Deploy a production-ready SaaS application with monitoring and case studies for recruiters.",
          tech: ["Next.js", "Tailwind", "PostgreSQL", "Vercel"],
          completed: false,
        },
      ],
    },
  ],
};

// ─── Interview Questions ─────────────────────────────────────
export const interviewQuestions = [
  {
    id: 1,
    category: "React",
    question: "Explain the difference between useEffect and useLayoutEffect.",
    difficulty: "medium",
    tips: [
      "Mention the timing of execution relative to DOM updates",
      "Talk about use cases: animations, measuring DOM",
    ],
    sampleAnswer:
      "useEffect runs asynchronously after the browser has painted, making it safe for most side effects. useLayoutEffect fires synchronously after DOM mutations but before the paint, making it ideal for reading layout or making DOM mutations that must be reflected before the user sees anything.",
  },
  {
    id: 2,
    category: "React",
    question: "What are React Server Components and how do they differ from Client Components?",
    difficulty: "hard",
    tips: [
      "Mention the server/client boundary",
      "Talk about no state or effects in Server Components",
    ],
    sampleAnswer:
      "React Server Components render on the server and send serialized UI to the client, reducing JavaScript bundle size. They cannot use browser APIs, state, or effects. Client Components are marked with 'use client' and run in the browser with full React capabilities.",
  },
  {
    id: 3,
    category: "JavaScript",
    question: "How does the JavaScript event loop work?",
    difficulty: "medium",
    tips: [
      "Mention call stack, Web APIs, callback queue, microtask queue",
      "Give a code example with setTimeout and Promise",
    ],
    sampleAnswer:
      "The event loop continuously checks if the call stack is empty. If it is, it moves callbacks from the microtask queue (Promises) first, then the macrotask queue (setTimeout, setInterval). Web APIs handle async operations and push callbacks to the appropriate queue.",
  },
  {
    id: 4,
    category: "CSS",
    question: "Explain CSS specificity and how it determines which styles are applied.",
    difficulty: "easy",
    tips: [
      "Use the 0-0-0-0 notation",
      "Mention inline styles and !important",
    ],
    sampleAnswer:
      "Specificity is calculated as a 4-part value: inline styles (1-0-0-0), IDs (0-1-0-0), classes/attributes/pseudo-classes (0-0-1-0), elements/pseudo-elements (0-0-0-1). Higher specificity wins; equal specificity defers to source order.",
  },
  {
    id: 5,
    category: "System Design",
    question: "How would you design a URL shortening service like bit.ly?",
    difficulty: "hard",
    tips: [
      "Cover base62 encoding, database schema, caching",
      "Mention scale considerations (read-heavy)",
    ],
    sampleAnswer:
      "I'd use a distributed key-value store for fast lookups, generate a 6-7 character base62 ID for each URL, and cache popular URLs in Redis to handle read-heavy traffic. The system would use a load balancer, with the redirect service separated from the creation API.",
  },
  {
    id: 6,
    category: "Behavioral",
    question: "Tell me about a time you had a disagreement with a teammate. How did you resolve it?",
    difficulty: "medium",
    tips: [
      "Use the STAR method (Situation, Task, Action, Result)",
      "Focus on communication and compromise",
    ],
    sampleAnswer:
      "During a project at my previous job, I disagreed with a colleague on the architecture for a new feature. I requested a meeting where we each presented our approaches with trade-offs. We ended up combining ideas — their simplicity with my scalability concern — and shipped a solution we were both proud of.",
  },
  {
    id: 7,
    category: "JavaScript",
    question: "What is the difference between null, undefined, and not defined?",
    difficulty: "easy",
    tips: [
      "Cover typeof behavior for each",
      "Mention common gotchas",
    ],
    sampleAnswer:
      "'undefined' means a variable has been declared but not assigned. 'null' is an explicit assignment of 'no value'. 'not defined' throws a ReferenceError — the variable doesn't exist in scope at all. typeof null === 'object' is a known quirk.",
  },
  {
    id: 8,
    category: "React",
    question: "How do you optimize performance in a large React application?",
    difficulty: "hard",
    tips: [
      "Mention React.memo, useMemo, useCallback",
      "Talk about code splitting and lazy loading",
      "Mention virtualization for long lists",
    ],
    sampleAnswer:
      "I'd start with profiling using React DevTools to find bottlenecks. Then apply React.memo to prevent unnecessary re-renders, useMemo/useCallback for expensive computations and stable references, code splitting with React.lazy for route-based chunks, and react-window for virtualizing long lists.",
  },
  {
    id: 9,
    category: "CSS",
    question: "What is the difference between flexbox and CSS Grid? When would you use each?",
    difficulty: "easy",
    tips: [
      "One-dimensional vs two-dimensional",
      "Mention practical examples",
    ],
    sampleAnswer:
      "Flexbox is one-dimensional (row OR column) and excels at distributing items along a single axis — great for navigation bars, card rows, or centering content. CSS Grid is two-dimensional and handles rows AND columns simultaneously — ideal for page layouts, galleries, or any design that needs alignment in both directions.",
  },
  {
    id: 10,
    category: "Behavioral",
    question: "Describe a project you're most proud of and why.",
    difficulty: "easy",
    tips: [
      "Highlight your contribution specifically",
      "Quantify impact if possible",
      "Connect to the role you're applying for",
    ],
    sampleAnswer:
      "I rebuilt our company's customer portal from scratch using React and TypeScript, reducing load time by 60% and improving the accessibility score from 54 to 97. The project gave me end-to-end ownership and I collaborated closely with design and backend teams to ship it in 8 weeks.",
  },
];

// ─── Notifications ───────────────────────────────────────────
export const notifications = [
  {
    id: 1,
    type: "match",
    title: "New Job Match",
    message: "Senior Frontend Engineer at Stripe — 94% match score.",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "resume",
    title: "Resume Analysis Complete",
    message: "Your resume scored 78/100. View suggestions to improve your ATS score.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "interview",
    title: "Interview Practice Reminder",
    message: "You haven't practiced System Design questions this week. Keep your streak going!",
    time: "Yesterday",
    read: true,
  },
  {
    id: 4,
    type: "roadmap",
    title: "Phase 2 Milestone",
    message: "You're 60% through Phase 2 — Backend Fundamentals. Great progress!",
    time: "2 days ago",
    read: true,
  },
  {
    id: 5,
    type: "application",
    title: "Application Status Update",
    message: "Your application to React Developer at Vercel has been viewed.",
    time: "3 days ago",
    read: true,
  },
];

// ─── Career Readiness Overview ──────────────────────────────
export const careerReadiness = {
  overallScore: 82,
  level: "Job-Ready (Senior Associate)",
  benchmark: "Top 15% of Candidates in Your Region",
  metrics: [
    { label: "Resume ATS Compatibility", score: 78, target: 85, color: "violet" },
    { label: "Technical Skill Coverage", score: 72, target: 90, color: "cyan" },
    { label: "Mock Interview Performance", score: 85, target: 80, color: "green" },
    { label: "Portfolio & Project Strength", score: 90, target: 85, color: "orange" },
  ],
  recommendedActions: [
    {
      id: 1,
      title: "Bridge Backend & Next.js Skill Gap",
      description: "Learn Next.js 14 and Prisma to match 6 additional high-paying full-stack roles.",
      link: "/skill-gap",
      actionText: "Analyze Gaps",
      priority: "High",
    },
    {
      id: 2,
      title: "Practice System Design Questions",
      description: "Complete 2 architecture questions to boost your senior interview readiness above 90%.",
      link: "/interview",
      actionText: "Start Practice",
      priority: "Medium",
    },
    {
      id: 3,
      title: "Add Measurable Metrics to Resume",
      description: "Your experience bullet points lack quantitative metrics. Boost ATS score by ~10 points.",
      link: "/resume",
      actionText: "Improve Resume",
      priority: "High",
    },
  ],
};

// ─── Skill Gap Data ─────────────────────────────────────────
export const skillGapData = {
  roles: [
    {
      id: "senior-fullstack",
      title: "Senior Full-Stack Engineer",
      matchPercentage: 74,
      marketDemand: "Very High",
      avgSalary: "$165,000 / yr",
      currentSkills: [
        { name: "React", level: "Advanced", currentProficiency: 90, requiredProficiency: 85 },
        { name: "TypeScript", level: "Intermediate", currentProficiency: 75, requiredProficiency: 85 },
        { name: "Node.js", level: "Intermediate", currentProficiency: 70, requiredProficiency: 80 },
        { name: "Tailwind CSS", level: "Advanced", currentProficiency: 95, requiredProficiency: 80 },
        { name: "Git & GitHub", level: "Advanced", currentProficiency: 85, requiredProficiency: 80 },
      ],
      missingSkills: [
        {
          name: "Next.js & App Router",
          importance: "Critical",
          matchWeight: "15%",
          reason: "Appears in 84% of senior frontend/full-stack postings.",
          suggestedCourse: "Mastering Next.js 14 & Server Actions",
          estHours: 18,
        },
        {
          name: "PostgreSQL & Prisma ORM",
          importance: "High",
          matchWeight: "12%",
          reason: "Essential for robust relational data modeling in modern stacks.",
          suggestedCourse: "PostgreSQL for Node.js Developers",
          estHours: 14,
        },
        {
          name: "Docker & Containerization",
          importance: "Medium",
          matchWeight: "10%",
          reason: "Required for standardized dev environments and cloud deployments.",
          suggestedCourse: "Docker & Kubernetes Primer",
          estHours: 10,
        },
        {
          name: "Automated Testing (Vitest & Cypress)",
          importance: "High",
          matchWeight: "11%",
          reason: "Critical qualification for senior code reviews and production QA.",
          suggestedCourse: "Testing React & Node with Vitest",
          estHours: 12,
        },
      ],
    },
    {
      id: "ai-engineer",
      title: "AI / Full-Stack Engineer",
      matchPercentage: 58,
      marketDemand: "Extreme",
      avgSalary: "$180,000 / yr",
      currentSkills: [
        { name: "React", level: "Advanced", currentProficiency: 90, requiredProficiency: 80 },
        { name: "JavaScript / TypeScript", level: "Intermediate", currentProficiency: 75, requiredProficiency: 85 },
        { name: "Node.js", level: "Intermediate", currentProficiency: 70, requiredProficiency: 80 },
      ],
      missingSkills: [
        {
          name: "LangChain.js & Vector Embeddings",
          importance: "Critical",
          matchWeight: "22%",
          reason: "Standard framework for building RAG applications and LLM agents.",
          suggestedCourse: "Building GenAI Apps with LangChain",
          estHours: 24,
        },
        {
          name: "Python for AI/Data",
          importance: "High",
          matchWeight: "18%",
          reason: "Commonly used for model evaluation and backend data pipelines.",
          suggestedCourse: "Python for Modern Developers",
          estHours: 20,
        },
        {
          name: "ChromaDB / Vector Databases",
          importance: "High",
          matchWeight: "15%",
          reason: "Required for semantic search and context retrieval architectures.",
          suggestedCourse: "Vector Databases & Retrieval Augmented Generation",
          estHours: 8,
        },
      ],
    },
    {
      id: "lead-frontend",
      title: "Frontend Tech Lead",
      matchPercentage: 81,
      marketDemand: "High",
      avgSalary: "$175,000 / yr",
      currentSkills: [
        { name: "React Architecture", level: "Advanced", currentProficiency: 90, requiredProficiency: 90 },
        { name: "CSS & Design Systems", level: "Advanced", currentProficiency: 95, requiredProficiency: 85 },
        { name: "Web Performance & Core Vitals", level: "Intermediate", currentProficiency: 70, requiredProficiency: 85 },
      ],
      missingSkills: [
        {
          name: "System Design & Micro-frontends",
          importance: "Critical",
          matchWeight: "18%",
          reason: "Required for orchestrating multi-team enterprise web apps.",
          suggestedCourse: "Frontend System Design by Ex-Staff Engineers",
          estHours: 20,
        },
        {
          name: "Engineering Mentorship & RFCs",
          importance: "High",
          matchWeight: "12%",
          reason: "Essential leadership skill for code governance and architectural RFCs.",
          suggestedCourse: "Staff Engineer Leadership Fundamentals",
          estHours: 10,
        },
      ],
    },
  ],
};

// ─── AI Career Assistant ────────────────────────────────────
export const aiAssistantData = {
  suggestedQuestions: [
    "How can I tailor my resume for a Senior Frontend role at Stripe?",
    "What specific skills do I need to transition to Full-Stack development?",
    "Explain the JavaScript event loop with a simple example.",
    "Give me 3 behavioral questions based on the STAR method.",
    "Which projects should I build to impress FAANG engineering hiring managers?",
  ],
  presetKnowledgeBase: [
    {
      triggers: ["resume", "stripe", "tailor", "ats"],
      response: `Here are 3 high-impact strategies to tailor your resume for Stripe and tier-1 tech companies:

1. **Quantify Business Impact**: Rather than writing *"Built reusable React components"*, write *"Engineered a modular design system adopted by 14 product teams, reducing frontend sprint delivery time by 35%"*.
2. **Highlight Distributed Systems & Reliability**: Stripe deeply values idempotency, API resilience, and zero-downtime deployments. Mention experience with optimistic UI, error boundaries, and API rate-limiting patterns.
3. **Include Missing Core Keywords**: Ensure **TypeScript**, **GraphQL**, **CI/CD**, and **Testing (Vitest/Playwright)** are explicitly represented in your Skills and Experience sections.`,
    },
    {
      triggers: ["skills", "full-stack", "transition", "backend"],
      response: `To transition from Frontend to Full-Stack Engineer seamlessly:

1. **Master Relational Modeling**: Move beyond simple JSON stores. Learn **PostgreSQL** schema design, indexing, and an ORM like **Prisma**.
2. **Deepen API Architecture**: Understand the tradeoffs between REST, GraphQL, and tRPC. Practice designing authenticated CRUD endpoints with Express or Next.js Route Handlers.
3. **Containerization & Deployment**: Dockerize your services and deploy them with automated CI/CD using GitHub Actions on platforms like Railway or AWS.`,
    },
    {
      triggers: ["event loop", "javascript", "async", "promise"],
      response: `The **JavaScript Event Loop** manages asynchronous execution on a single thread:

- **Call Stack**: Executes synchronous code (e.g., function invocations) one frame at a time.
- **Web APIs**: Background browser/Node engines that handle timers, network requests, and DOM events.
- **Microtask Queue (High Priority)**: Holds callbacks from \`Promise.then()\`, \`async/await\`, and \`queueMicrotask\`. Runs immediately after the current stack empties.
- **Macrotask Queue**: Holds callbacks from \`setTimeout\`, \`setInterval\`, and I/O.

💡 **Quick Interview Rule**: *Microtasks always drain completely before the event loop picks up the next macrotask!*`,
    },
  ],
};
