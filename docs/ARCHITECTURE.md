# CareerPilot – System Architecture

This document describes the high-level system architecture, design decisions, data flow, AI agent orchestration, and security mechanisms powering **CareerPilot – Your AI Career Copilot**.

---

## 1. High-Level Architecture

CareerPilot is organized as a decoupled, full-stack micro-modular system with an autonomous AI Agent and Retrieval-Augmented Generation (RAG) vector engine.

```mermaid
flowchart TD
    subgraph Client["Presentation Layer (React 19 + Vite SPA)"]
        UI["Tailwind CSS v4 UI Components"]
        Pages["Pages (Dashboard, Resume, Jobs, Roadmap, Interview, Assistant)"]
        Axios["API Client (Axios + JWT Interceptors)"]
        UI --> Pages --> Axios
    end

    subgraph Gateway["API & Security Layer (Express 4.21)"]
        Cors["CORS Whitelist"]
        Helmet["Helmet Security Headers"]
        RateLimit["Tiered Rate Limiters (API / Auth / AI)"]
        AuthMw["JWT Auth Middleware"]
        UploadMw["Multer File Validator (MIME & Size Limit)"]
        ErrorMw["Safe Error Handler (Stack Masking)"]
    end

    subgraph CoreBackend["Application Controllers & Services"]
        AuthCtrl["Auth & Profile Services"]
        ResumeCtrl["Resume Parser & Text Extractor"]
        JobCtrl["Job Search & Filter Engine"]
        RoadmapCtrl["Milestone & Progress Service"]
        ChatCtrl["Conversation History Manager"]
    end

    subgraph AIAgentLayer["AI Agent & LangChain Layer"]
        Agent["Autonomous Career Agent Orchestrator"]
        Tools["6 Structured Tools (Resume, Gap, Roadmap, Jobs, RAG, Interview)"]
        Planner["Loop Prevention & Multi-Step Planner"]
        GeminiLLM["Google Gemini 1.5 Flash (LangChain)"]
        Agent --> Tools
        Agent --> Planner
        Tools --> GeminiLLM
    end

    subgraph VectorRAG["RAG & Vector Retrieval Engine"]
        ChromaStore["ChromaVectorStore (ChromaDB API)"]
        FallbackStore["In-Memory Cosine Vector Adapter"]
        Embedder["Gemini Embeddings (text-embedding-004)"]
        KnowledgeColl["careerpilot_knowledge (Verified Guides)"]
        ResumeColl["careerpilot_resumes (Isolated User Resumes)"]
        ChromaStore -.-> FallbackStore
        ChromaStore --> KnowledgeColl
        ChromaStore --> ResumeColl
        Embedder --> ChromaStore
    end

    subgraph Persistence["Storage & Data Persistence"]
        MongoDB[(MongoDB Atlas / Local)]
        FileStorage[("Secure File Storage (uploads/resumes)")]
    end

    Axios --> Cors --> Helmet --> RateLimit --> AuthMw
    AuthMw --> CoreBackend
    AuthMw --> AIAgentLayer
    CoreBackend --> MongoDB
    CoreBackend --> FileStorage
    Tools --> VectorRAG
    Tools --> MongoDB
    ResumeCtrl --> FileStorage
```

---

## 2. Layered Component Architecture

### 2.1 Presentation Layer (`/src`)
- **React 19 & Vite 8**: Extremely fast Hot Module Replacement (HMR) and optimized Rollup/Rolldown production bundling with manual chunk splitting.
- **Tailwind CSS v4**: Utility-first responsive styling utilizing modern CSS variables and container queries.
- **Lucide React**: Scalable SVG icon system across all navigation, status badges, and tool output inspectors.
- **React Router DOM 7**: Client-side routing with route guards, preserving navigation state and scroll positions.
- **API Interceptor Engine**: `src/services/api.js` provides automatic Bearer token injection, request timeouts, and structured error propagation.

### 2.2 API Gateway & Middleware Layer (`server/src/middleware`)
1. **Security Headers (`helmet`)**: Configures Content-Security-Policy, Frameguard (`DENY`), and Cross-Origin Resource Policies.
2. **Tiered Rate Limiting (`express-rate-limit`)**:
   - `apiLimiter`: 300 requests / 15 minutes for read operations.
   - `authLimiter`: 40 requests / 15 minutes to thwart brute-force password guessing.
   - `aiLimiter`: 80 requests / 15 minutes to govern Gemini API quotas.
3. **Authentication Middleware (`authMiddleware.js`)**: Decodes and verifies HS256 JWT tokens, validating user existence and injecting the sanitized `req.user` payload into downstream handlers.
4. **File Sandboxing (`uploadMiddleware.js`)**: Restricts uploads strictly to `.pdf`, `.docx`, and `.doc` formats, enforcing a 5MB size limit and generating cryptographically randomized filenames (`crypto.randomUUID()`) to prevent directory traversal attacks.
5. **Safe Error Masking (`errorMiddleware.js`)**: Traps unhandled rejections, converts Mongoose validation errors into structured 400 responses, and conceals internal stack traces in `production` mode.

### 2.3 AI Agent Orchestration (`server/src/services/agent`)
The career assistant operates as an autonomous agent utilizing **LangChain.js** structured tool calling:

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as React Assistant UI
    participant Agent as Career Agent Orchestrator
    participant Tool as Agent Tool Registry
    participant RAG as Vector Store / DB
    participant Gemini as Gemini 1.5 Flash

    User->>Frontend: "Am I ready to be a backend developer? Analyze my resume."
    Frontend->>Agent: POST /api/agent/chat { message, token }
    Agent->>Agent: Initialize step loop (maxIterations: 5)
    
    Agent->>Tool: Execute resume_analyzer(focus: "backend")
    Tool->>Gemini: Analyze extracted resume text
    Gemini-->>Tool: Return technical skills & ATS score
    Tool-->>Agent: Structured resume summary
    
    Agent->>Tool: Execute skill_gap_analyzer(targetRole: "Backend Developer")
    Tool->>Gemini: Compare candidate skills vs target role
    Gemini-->>Tool: Return missing skills (Docker, PostgreSQL)
    Tool-->>Agent: Missing skills & priority metrics
    
    Agent->>Tool: Execute rag_retriever(query: "Junior backend developer essentials")
    Tool->>RAG: Cosine query on careerpilot_knowledge
    RAG-->>Tool: Verified career guide excerpts & citations
    Tool-->>Agent: Grounded passages
    
    Agent->>Gemini: Synthesize final personalized synthesis with citations
    Gemini-->>Agent: Cohesive advisory answer
    Agent-->>Frontend: HTTP 200 { reply, toolsExecuted, citations }
    Frontend-->>User: Render message with interactive Tools Executed drawer
```

#### Loop Prevention & Guardrails
- **`maxIterations: 5`**: Hard limit preventing infinite agent execution cycles or runaway token consumption.
- **Tool Result Memoization**: Prevents duplicate tool invocations within the same user turn.
- **Deterministic Fallback Planner**: If LangChain tool calling reaches max iterations or encounters an unparseable response, a deterministic multi-stage planner fulfills the request reliably.

---

## 3. RAG Pipeline & Vector Storage Architecture

### 3.1 Collections & Embeddings
CareerPilot segments knowledge into two collections:
1. `careerpilot_knowledge`: Verified industry guides, career roadmaps, and interview guidelines.
2. `careerpilot_resumes`: Chunks derived from user resumes, strictly partitioned by `userId`.

### 3.2 Dual Vector Engine (ChromaDB + In-Memory Fallback)
To ensure continuous availability in all environments (local, Docker, or serverless):
- **Primary Engine**: ChromaDB HTTP client connecting to `CHROMA_URL` (`http://localhost:8000`).
- **Resilient Fallback**: If ChromaDB is offline, `ChromaVectorStore` automatically transitions to an in-memory vector collection executing exact cosine similarity calculations over normalized Gemini vector embeddings (`text-embedding-004`).

### 3.3 Privacy & Data Isolation Guarantees
CareerPilot guarantees multi-tenant data isolation:
- Resumes are indexed with metadata: `{ userId: "<mongo_user_id>", resumeId: "<mongo_resume_id>" }`.
- All RAG queries on the resume collection enforce a mandatory metadata filter:
  ```javascript
  where: { userId: user._id.toString() }
  ```
- **Automated Verification**: Suite tests verify that User A cannot retrieve User B's resume chunks under any circumstances, even when spoofing target resume IDs.

---

## 4. Database Schema Design (MongoDB)

```mermaid
erDiagram
    USER ||--o{ RESUME : owns
    USER ||--o{ ROADMAP : tracks
    USER ||--o{ CHAT : participates
    
    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string education
        number graduationYear
        string targetRole
        array skills
        string experienceLevel
        date createdAt
    }

    RESUME {
        ObjectId _id PK
        ObjectId userId FK
        string fileName
        string storedFileName
        string filePath
        number fileSize
        string mimeType
        string extractionStatus
        string extractedText
        object parsedData
        date createdAt
    }

    ROADMAP {
        ObjectId _id PK
        ObjectId userId FK
        string targetRole
        string currentLevel
        number durationWeeks
        array phases
        number progressPercentage
        date createdAt
    }

    JOB {
        ObjectId _id PK
        string title
        string company
        string location
        string type
        string experienceLevel
        string salary
        string description
        array requiredSkills
        date postedDate
    }

    CHAT {
        ObjectId _id PK
        ObjectId userId FK
        string title
        array messages
        date createdAt
        date updatedAt
    }
```

---

## 5. Performance & Build Optimizations

1. **Frontend Asset Code-Splitting**:
   - `vite.config.js` splits vendor dependencies into distinct chunks (`vendor-react`, `vendor-axios`, `vendor-misc`), ensuring no single bundle exceeds 300kB.
   - Total compressed frontend bundle: **~149 kB gzipped**.
2. **Database Indexing**:
   - `User.email`: Unique index for $O(1)$ lookups during authentication.
   - `Resume.userId`: Index for instantaneous resume list queries.
   - `Job.title` & `Job.requiredSkills`: Text index for fast multi-field search.
3. **Payload Sanitization**:
   - Resume extraction ignores images and embedded binaries, preserving only textual content to minimize memory footprint.
