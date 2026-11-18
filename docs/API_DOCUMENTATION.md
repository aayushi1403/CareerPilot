# CareerPilot – API Documentation

Complete REST API reference for **CareerPilot – Your AI Career Copilot**.

---

## 1. Overview & Conventions

### Base URL
- **Local Development**: `http://localhost:5000/api`
- **Production**: `https://careerpilot-api.onrender.com/api`

### Standard Response Envelope
All API responses adhere to a consistent JSON envelope format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

In the event of an error:
```json
{
  "success": false,
  "error": {
    "message": "Descriptive error message",
    "details": [ ... ]
  }
}
```

### Authentication Header
Protected endpoints require a Bearer token in the HTTP `Authorization` header:
```http
Authorization: Bearer <jwt_token>
```

### Rate Limiting
Tiered rate limiting is enforced via `express-rate-limit`:
- **General API**: 300 requests / 15 minutes per IP
- **Auth Endpoints**: 40 requests / 15 minutes per IP
- **AI / Agent / RAG Endpoints**: 80 requests / 15 minutes per IP

---

## 2. Authentication Endpoints (`/api/auth`)

### 2.1 Register New User
Creates a new student or job seeker account.

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "673b4...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "user"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "message": "User registered successfully"
  }
  ```

### 2.2 Login User
Authenticates an existing user and returns a JWT token.

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "673b4...",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "message": "Login successful"
  }
  ```

### 2.3 Get Current User
Retrieves profile data for the authenticated token holder.

- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "673b4...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "education": "B.S. in Computer Science",
      "graduationYear": 2025,
      "targetRole": "Backend Developer",
      "skills": ["JavaScript", "Node.js", "Docker"]
    }
  }
  ```

### 2.4 Logout User
Invalidates client session token.

- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Auth Required**: Yes
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

## 3. User Profile Endpoints (`/api/profile`)

### 3.1 Get Profile
Retrieves the full profile details for the authenticated user.

- **URL**: `/api/profile`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "673b4...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "education": "B.Tech Computer Science",
      "graduationYear": 2025,
      "targetRole": "Full Stack Developer",
      "skills": ["React", "Node.js", "Express", "MongoDB"],
      "experienceLevel": "Entry-Level"
    }
  }
  ```

### 3.2 Update Profile
Updates profile metadata and career targets.

- **URL**: `/api/profile`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "education": "M.S. in Software Engineering",
    "graduationYear": 2026,
    "targetRole": "Cloud & Backend Architect",
    "skills": ["Go", "Node.js", "Kubernetes", "PostgreSQL"],
    "experienceLevel": "Mid-Level"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Profile updated successfully"
  }
  ```

---

## 4. Resume Processing Endpoints (`/api/resumes`)

### 4.1 Upload & Parse Resume
Accepts multipart PDF or DOCX file (up to 5MB), extracts raw text, performs rule-based and entity parsing, and indexes metadata.

- **URL**: `/api/resumes/upload`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Form Fields**: `resume` (File)
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "673c1...",
      "fileName": "Jane_Doe_Resume.pdf",
      "fileSize": 142500,
      "mimeType": "application/pdf",
      "extractionStatus": "completed",
      "parsedData": {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "+1 555-0199",
        "skills": ["JavaScript", "Node.js", "MongoDB", "Express", "Docker"],
        "education": ["B.S. in Computer Science, State University, 2025"],
        "experience": ["Backend Intern at TechCorp (2024)"],
        "projects": ["CareerPilot AI Platform", "Realtime Chat Engine"]
      },
      "extractedText": "Jane Doe\njane@example.com\n..."
    },
    "message": "Resume uploaded and extracted successfully"
  }
  ```

### 4.2 List User Resumes
Retrieves all uploaded resumes belonging strictly to the authenticated user.

- **URL**: `/api/resumes`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "673c1...",
        "fileName": "Jane_Doe_Resume.pdf",
        "fileSize": 142500,
        "createdAt": "2026-11-18T10:00:00.000Z"
      }
    ]
  }
  ```

### 4.3 Get Single Resume
Retrieves full details of a specific resume, verifying user ownership.

- **URL**: `/api/resumes/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```

### 4.4 Delete Resume
Removes resume record from database and deletes the physical file from storage.

- **URL**: `/api/resumes/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Resume deleted successfully"
  }
  ```

---

## 5. Career Roadmap Endpoints (`/api/roadmaps`)

### 5.1 Create Personalized Roadmap
- **URL**: `/api/roadmaps`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "targetRole": "Backend Developer",
    "currentLevel": "Beginner",
    "durationWeeks": 12,
    "phases": [ ... ]
  }
  ```
- **Success Response (201 Created)**: Returns created roadmap object with unique IDs for milestones.

### 5.2 Get User Roadmap
- **URL**: `/api/roadmaps`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response (200 OK)**: Returns the user's active roadmap.

### 5.3 Update Milestone Progress
- **URL**: `/api/roadmaps/:id/progress`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "phaseIndex": 0,
    "milestoneIndex": 1,
    "completed": true
  }
  ```
- **Success Response (200 OK)**: Returns updated roadmap with computed percentage progress.

---

## 6. Job Market Endpoints (`/api/jobs`)

### 6.1 List & Search Jobs
Retrieves verified job postings with pagination and keyword filtering.

- **URL**: `/api/jobs`
- **Method**: `GET`
- **Auth Required**: No (optional auth for personalized matching scores)
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `search` (string, keyword filter across title, company, skills)
  - `type` (string, e.g. `Full-time`, `Internship`, `Remote`)
  - `experienceLevel` (string, e.g. `Entry-level`, `Mid-level`)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "jobs": [ ... ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 45,
        "pages": 5
      }
    }
  }
  ```

### 6.2 Get Job by ID
- **URL**: `/api/jobs/:id`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response (200 OK)**: Returns full job posting details.

---

## 7. AI Intelligence Endpoints (`/api/ai`)
Powered by **LangChain.js + Google Gemini (gemini-1.5-flash)** with structured Zod schema validation.

### 7.1 Resume Analysis
- **URL**: `/api/ai/resume/analyze`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "resumeText": "Jane Doe, Software Engineer...",
    "targetRole": "Backend Developer"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "summary": "Strong junior candidate with solid foundational Node.js experience...",
      "overallScore": 82,
      "technicalSkills": ["JavaScript", "Node.js", "Express", "Docker"],
      "softSkills": ["Collaboration", "Problem Solving"],
      "strengths": ["Clear project descriptions with measurable outcomes"],
      "weaknesses": ["Lacks production cloud deployment metrics"],
      "missingSections": ["Certifications"],
      "improvementSuggestions": ["Add AWS/GCP architecture highlights"],
      "atsScore": 85,
      "atsFeedback": "Keywords match backend roles strongly."
    }
  }
  ```

### 7.2 Career Recommendations
- **URL**: `/api/ai/career/recommend`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "skills": ["JavaScript", "React", "Node.js", "SQL"],
    "targetRole": "Full Stack Engineer"
  }
  ```
- **Success Response (200 OK)**: Returns prioritized role options, fit scores, and career progression paths.

### 7.3 Skill Gap Analysis
- **URL**: `/api/ai/skills/gap-analysis`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "currentSkills": ["JavaScript", "Node.js"],
    "targetRole": "Backend Engineer"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "existingSkills": ["JavaScript", "Node.js"],
      "missingSkills": [
        { "name": "Docker", "priority": "High", "timeToLearn": "2 weeks" },
        { "name": "Redis", "priority": "Medium", "timeToLearn": "1 week" }
      ],
      "matchPercentage": 65,
      "recommendedActions": ["Build a caching layer project using Redis"]
    }
  }
  ```

### 7.4 AI Career Roadmap Generator
- **URL**: `/api/ai/roadmap/generate`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "targetRole": "DevOps Engineer",
    "durationWeeks": 12
  }
  ```

### 7.5 Mock Interview Question Generation
- **URL**: `/api/ai/interview/questions`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "role": "Backend Developer",
    "difficulty": "Intermediate",
    "count": 5
  }
  ```

### 7.6 Mock Interview Answer Evaluation
- **URL**: `/api/ai/interview/evaluate`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "question": "Explain the difference between synchronous and asynchronous code in Node.js.",
    "userAnswer": "Synchronous blocks the event loop while async uses callbacks or promises...",
    "role": "Backend Developer"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "score": 88,
      "strengths": ["Accurately identified event loop blocking"],
      "areasToImprove": ["Mention libuv threadpool for disk I/O operations"],
      "sampleIdealAnswer": "In Node.js, synchronous code executes on the single call stack...",
      "technicalAccuracy": "High"
    }
  }
  ```

---

## 8. RAG Grounded Intelligence Endpoints (`/api/rag`)
Powered by **Gemini embeddings (`text-embedding-004`) + ChromaDB** with verifiable citations and strict user resume sandboxing.

### 8.1 Grounded Query
Queries verified career knowledge base and authorized user resume context.

- **URL**: `/api/rag/query`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "question": "What are the core skills needed for a junior backend developer in 2026?",
    "includeResume": true
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "answer": "Based on verified industry guides, junior backend developers require...",
      "citations": [
        {
          "source": "Backend_Developer_Career_Guide.md",
          "section": "Core Technical Proficiencies",
          "relevanceScore": 0.89
        }
      ],
      "contextChunksUsed": 3
    }
  }
  ```

### 8.2 Ingest Knowledge Document
Ingests and chunks a verified career knowledge guide into the vector database.

- **URL**: `/api/rag/ingest`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "Cloud Architect Guidelines 2026",
    "category": "career_guidance",
    "content": "Full markdown or text content...",
    "metadata": { "author": "CareerPilot Editorial Team" }
  }
  ```

### 8.3 Vector Store Status
Retrieves collection metrics, chunk counts, and verified topics.

- **URL**: `/api/rag/status`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "status": "connected",
      "vectorStore": "chromadb",
      "totalDocuments": 5,
      "totalChunks": 28,
      "collections": ["careerpilot_knowledge", "careerpilot_resumes"],
      "verifiedTopics": [
        "Backend Developer Roadmap",
        "Frontend Engineering Guide",
        "Technical Interview Strategies"
      ]
    }
  }
  ```

---

## 9. AI Career Agent Endpoints (`/api/agent`)
Autonomous multi-step tool-calling career assistant powered by LangChain structured agents.

### 9.1 Agent Dialogue Execution
- **URL**: `/api/agent/chat`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "message": "Am I ready to become a backend developer? Analyze my resume and tell me what's missing.",
    "resumeId": "optional_resume_id",
    "conversationHistory": [ ... ]
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "reply": "Based on your uploaded resume, you have strong JavaScript and Node.js fundamentals...",
      "toolsExecuted": [
        {
          "tool": "resume_analyzer",
          "input": { "focus": "backend" },
          "output": { "overallScore": 82, "technicalSkills": ["JavaScript", "Node.js"] },
          "durationMs": 142
        },
        {
          "tool": "skill_gap_analyzer",
          "input": { "targetRole": "Backend Developer" },
          "output": { "missingSkills": ["Docker", "PostgreSQL"] },
          "durationMs": 118
        }
      ],
      "citations": [
        { "source": "Backend_Developer_Career_Guide.md", "snippet": "..." }
      ],
      "iterationCount": 2,
      "status": "completed"
    }
  }
  ```

### 9.2 Tool Catalog Discovery
Returns all 6 registered agent tools and their input parameter schemas.

- **URL**: `/api/agent/tools`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "name": "resume_analyzer",
        "description": "Analyzes the authenticated user's uploaded resume...",
        "parameters": { ... }
      },
      { "name": "skill_gap_analyzer", ... },
      { "name": "career_roadmap_generator", ... },
      { "name": "job_recommendation_tool", ... },
      { "name": "rag_retriever", ... },
      { "name": "mock_interview_tool", ... }
    ]
  }
  ```

---

## 10. Chat History Endpoints (`/api/chat`)

- `POST /api/chat` - Start or append to a conversation thread.
- `GET /api/chat` - List user conversations.
- `GET /api/chat/:id` - Retrieve full message history of a conversation.
- `DELETE /api/chat/:id` - Delete conversation thread.

---

## 11. System Health (`/api/health`)

- **URL**: `/api/health`
- **Method**: `GET`
- **Success Response (200 OK)**:
  ```json
  {
    "status": "healthy",
    "uptime": 12450.2,
    "timestamp": "2026-11-18T12:00:00.000Z",
    "services": {
      "database": "connected",
      "vectorStore": "connected",
      "geminiApi": "configured"
    }
  }
  ```
