import { splitDocumentIntoChunks } from './documentProcessor.js';
import { vectorStore, COLLECTIONS } from './chromaVectorStore.js';

/**
 * High-quality verified career knowledge documents
 */
export const VERIFIED_CAREER_DOCUMENTS = [
  {
    docId: 'backend-engineering-guide',
    title: 'Backend Engineering Career Track & Competency Guide',
    source: 'verified-docs/backend-engineering.md',
    docType: 'career_guide',
    userId: 'global',
    content: `# Backend Engineering Career Track & Competency Guide

## 1. Core Runtime & Architecture (Node.js & Express)
A production-ready backend engineer specializing in Node.js must master the asynchronous event loop, non-blocking I/O, streams, and worker threads.
Key architectural patterns include:
- Express.js middleware pipelines for authentication, request logging, body parsing, and centralized error handling.
- Modular layered architecture: strict separation of concerns across Routes, Controllers, Business Services, Data Access Models, and Utility modules.
- Secure environment management via dotenv with zero credential leaks to version control.

## 2. Database Design & Persistence (MongoDB & SQL)
- MongoDB & Mongoose: Schema design, embedding vs referencing, compound indexes, aggregation pipelines, and query optimization.
- Relational databases (PostgreSQL/MySQL): ACID transactions, normalization, foreign keys, connection pooling, and migration management.
- Caching: Leveraging Redis for session storage, query caching, and rate limiting to reduce database load.

## 3. API Design & Security Standards
- RESTful standards: Idempotent HTTP methods (GET, PUT, DELETE), standard HTTP status codes (200, 201, 400, 401, 403, 404, 500), and predictable JSON envelopes.
- Security best practices: JWT authentication with expiration and refresh strategies, bcrypt hashing with appropriate work factor (salt rounds 10+), CORS whitelisting, Helmet headers, and input sanitization to prevent injection.

## 4. Testing & Verification
- Unit and integration testing: Node.js native test runner, Jest, and Supertest for testing HTTP endpoints end-to-end.
- Mocking databases and external services during testing to ensure deterministic, fast test runs.

## 5. Deployment, Containerization & CI/CD
- Containerization with Docker: Multi-stage builds, alpine base images, and container orchestration.
- Continuous Integration: Automated GitHub Actions pipelines executing linting, unit tests, and security scans on every pull request.`,
  },

  {
    docId: 'react-frontend-guide',
    title: 'Modern React & Frontend Developer Competency Framework',
    source: 'verified-docs/react-frontend.md',
    docType: 'skill_benchmark',
    userId: 'global',
    content: `# Modern React & Frontend Developer Competency Framework

## 1. Core React Mental Model & Hooks
Modern frontend engineering requires deep fluency in React 18/19 primitives:
- Essential hooks: useState for local state, useEffect for external system synchronization, useCallback and useMemo for reference stability and expensive calculations, useRef for DOM nodes and mutable instance variables.
- Custom hooks: Abstracting reusable business logic, API requests, and browser APIs into clean, composable hooks (e.g. useAuth, useDebounce, useLocalStorage).
- Declarative UI: Deriving state rather than duplicating it, ensuring predictable unidirectional data flow.

## 2. State Management & Data Fetching
- Client-side state: Lightweight state management with Zustand or Context API for UI state; Redux Toolkit for complex enterprise applications.
- Server-side state: React Query (TanStack Query) or SWR for caching, background revalidation, optimistic updates, and automatic retries.
- HTTP client layer: Axios or native fetch with standardized request interceptors for JWT token injection and centralized 401 response handling.

## 3. Styling, Theming & UI Systems
- Tailwind CSS (v3/v4): Utility-first responsive design, dark mode theme tokens, custom utility classes, and fluid layout design.
- Reusable component architecture: Card, Button, Badge, Modal, and Layout wrappers that enforce consistent spacing, accessible color contrasts, and typography.
- Icons & micro-interactions: Lucide React for consistent icons and CSS transitions for interactive feedback.

## 4. Build Tools, Routing & Routing Architecture
- Vite: Fast Hot Module Replacement (HMR), ESM-based dev server, and optimized rollup production bundles.
- React Router DOM (v6/v7): Nested routes, route guards / protected routes, dynamic parameter extraction, and programmatic navigation.
- Performance optimization: Dynamic imports with React.lazy and Suspense for route-based code-splitting and reduced initial bundle sizes.`,
  },

  {
    docId: 'technical-interview-prep',
    title: 'Technical & Behavioral Interview Mastery (STAR Framework)',
    source: 'verified-docs/interview-mastery.md',
    docType: 'interview_prep',
    userId: 'global',
    content: `# Technical & Behavioral Interview Mastery (STAR Framework)

## 1. The STAR Method for Behavioral Questions
When interviewing for engineering roles, structure every behavioral and situational answer using STAR:
- **Situation (S)**: Set the context. Describe the specific challenge, project, or problem faced by the team or company. Keep this concise (15-20% of your answer).
- **Task (T)**: Clarify your exact responsibility. What were you specifically tasked to accomplish or fix?
- **Action (A)**: Detail the concrete steps YOU took. Explain technical choices, trade-offs evaluated, how you collaborated, and how you overcame obstacles (60% of your answer).
- **Result (R)**: Highlight quantifiable outcomes. Mention metrics: latency reduction (e.g. 40% faster), test coverage increase, revenue impact, or on-time project delivery (20% of your answer).

## 2. System Design & Distributed Systems
For mid to senior full-stack and backend roles, system design rounds evaluate trade-offs:
- Scalability: Horizontal scaling vs vertical scaling, stateless service design, and load balancing algorithms (Round Robin, Least Connections).
- Data storage trade-offs: SQL (strong consistency, relational schema) vs NoSQL (horizontal partition tolerance, flexible document schema).
- Caching strategies: Cache-aside, write-through, cache invalidation policies (TTL, LRU), and mitigating cache stampede or thundering herds.
- Message queues: Asynchronous task processing using RabbitMQ, Kafka, or BullMQ for heavy background jobs.

## 3. Live Coding & Problem Solving Strategy
- Clarify requirements: Ask questions to uncover constraints, input sizes, and edge cases (null inputs, empty arrays, negative values) before typing any code.
- Communicate thought process: Talk aloud while thinking; interviewers evaluate your reasoning and receptiveness to hints as much as the final code.
- Analyze complexity: Always state the Big-O Time and Space complexity of your solution and discuss how it could be optimized.`,
  },

  {
    docId: 'resume-ats-optimization',
    title: 'High-Impact Tech Resume & ATS Optimization Blueprint',
    source: 'verified-docs/resume-optimization.md',
    docType: 'career_guide',
    userId: 'global',
    content: `# High-Impact Tech Resume & ATS Optimization Blueprint

## 1. ATS (Applicant Tracking System) Parsing Rules
Over 90% of tech companies utilize ATS scanners (such as Greenhouse, Lever, Workday) to filter incoming resumes:
- Single-column layout: Never use multi-column tables, graphics, text boxes, or headers/footers for key content, as ATS parsers often flatten or scramble columns.
- Standard section headers: Use unambiguous headings: 'Professional Experience', 'Technical Skills', 'Projects', and 'Education'. Avoid non-standard creative labels like 'My Journey' or 'Toolbox'.
- Clean digital formats: Export directly as a clean PDF or DOCX with selectable, digital text. Never submit scanned image PDFs.

## 2. Google's XYZ Impact Formula for Bullet Points
Transform passive responsibility descriptions into high-impact accomplishments using the formula:
"Accomplished [X] as measured by [Y], by doing [Z]"
- Weak: "Worked on backend APIs for user management."
- High-Impact: "Architected 12 RESTful microservices in Node.js and Express, reducing API response latency by 35% and supporting 50,000+ daily active users."
- Weak: "Responsible for creating React frontend components."
- High-Impact: "Developed 25+ reusable React and Tailwind CSS components with 95% unit test coverage, cutting frontend development turnaround time by 4 weeks."

## 3. Strategic Skill Presentation & Keyword Alignment
- Categorize technical skills logically: 'Languages', 'Frontend', 'Backend & APIs', 'Databases', 'DevOps & Tools'.
- Match keyword terminology precisely to target job descriptions (e.g., if a posting requires 'RESTful APIs', list 'RESTful APIs' rather than just 'Web services').
- Include live URLs and GitHub repository links for top showcase projects demonstrating clean commits and architectural documentation.`,
  },

  {
    docId: 'fullstack-job-benchmarks',
    title: 'Full-Stack Software Engineer Job Description & Market Expectations',
    source: 'verified-docs/job-benchmarks.md',
    docType: 'job_description',
    userId: 'global',
    content: `# Full-Stack Software Engineer Job Description & Market Expectations

## 1. Role Summary & Core Responsibilities
A Full-Stack Software Engineer designs, develops, and maintains end-to-end web applications. They bridge user-facing interfaces with robust server-side architectures, database schemas, and cloud deployments.
Primary duties include:
- Implementing responsive, accessible web applications using modern JavaScript/TypeScript and React.
- Designing high-throughput, secure REST and GraphQL APIs using Node.js and Express.
- Managing relational and NoSQL database schemas, queries, and caching layers.
- Collaborating in cross-functional teams with Git version control, continuous integration, and agile sprints.

## 2. Technical Skill Prerequisites by Level
- **Junior Engineer (0-2 years)**:
  - Solid fundamentals in JavaScript (ES6+), HTML5, CSS3, and React component state.
  - Familiarity with basic Node.js, Express, CRUD operations, and MongoDB or PostgreSQL.
  - Understanding of Git branching, pull requests, and debugging in browser DevTools.
- **Mid-Level Engineer (2-5 years)**:
  - Strong proficiency in modern React hooks, state management (Zustand/Redux), and performance tuning.
  - Production experience with database indexing, schema migrations, and authentication protocols (JWT, OAuth).
  - Writing automated test suites (unit, integration, and E2E) with high coverage.
  - Deployment familiarity with Docker, Linux environments, and CI/CD automation.
- **Senior Engineer (5+ years)**:
  - System architecture design, distributed system trade-offs, caching strategies, and microservices.
  - Mentoring junior engineers, establishing architectural standards, and driving code quality.`,
  },
];

/**
 * Seed verified documents into the vector store
 * @param {import('./chromaVectorStore.js').ChromaVectorStore} [customStore]
 * @returns {Promise<{ seededCount: number, totalChunks: number }>}
 */
export async function seedKnowledgeBase(customStore = vectorStore) {
  let totalChunks = 0;
  let seededDocs = 0;

  for (const doc of VERIFIED_CAREER_DOCUMENTS) {
    const chunks = await splitDocumentIntoChunks({
      text: doc.content,
      docId: doc.docId,
      title: doc.title,
      source: doc.source,
      docType: doc.docType,
      userId: doc.userId,
    });

    if (chunks.length > 0) {
      await customStore.addChunks(COLLECTIONS.KNOWLEDGE, chunks);
      totalChunks += chunks.length;
      seededDocs++;
    }
  }

  console.log(`[RAG Seeder]: Seeded ${seededDocs} verified documents (${totalChunks} chunks) into ${COLLECTIONS.KNOWLEDGE}`);
  return { seededCount: seededDocs, totalChunks };
}
