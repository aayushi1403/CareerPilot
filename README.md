# CareerPilot – Your AI Career Copilot 🚀

[![Node.js](https://img.shields.io/badge/Node.js-20+-68a063.svg?style=flat&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19.3-61dafb.svg?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg?style=flat&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg?style=flat&logo=tailwindcss)](https://tailwindcss.com)
[![LangChain](https://img.shields.io/badge/LangChain.js-Enabled-1C3C3C.svg?style=flat)](https://js.langchain.com)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-1.5%20Flash-4285F4.svg?style=flat&logo=google)](https://aistudio.google.com)
[![Tests](https://img.shields.io/badge/Tests-75%20Passing-brightgreen.svg?style=flat)](tests)

**CareerPilot** is a production-ready, full-stack, AI-powered career guidance platform designed for students, early-career engineers, and job seekers. It pairs an autonomous **LangChain.js multi-step career agent** with a **Gemini-embedded RAG vector search engine (ChromaDB)** to deliver verified, context-aware resume analysis, personalized roadmaps, job matching, and technical interview simulations.

---

## 📑 Table of Contents

- [Core Modules & Features](#-core-modules--features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start Guide](#-quick-start-guide)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Security & Performance](#-security--performance)
- [Deployment & Production Setup](#-deployment--production-setup)
- [Comprehensive Documentation](#-comprehensive-documentation)

---

## 🎯 Core Modules & Features

| Module | Features & Capabilities |
| :--- | :--- |
| **📊 Dashboard** | Personalized welcome, career readiness score meter, recent activity feed, quick action shortcuts, and ATS health summary. |
| **📄 Resume Analyzer** | Multi-format upload (`.pdf`, `.docx`), text extraction, heuristic entity parsing, ATS keyword scoring, strengths/weaknesses audit, and actionable suggestions. |
| **💼 Job Matcher** | Real-time career opportunities feed, multi-criteria filtering (Full-time, Internship, Remote), match percentage calculation based on user skills, and detailed job modals. |
| **🎯 Skill Gap Analyzer** | Target role comparison, side-by-side current vs missing skills, prioritized learning roadmap, and estimated time-to-learn indicators. |
| **🗺️ Career Roadmap** | Chronological milestone tracker, phase-by-phase skill progression, hands-on portfolio project recommendations, and real-time completion tracking. |
| **🎙️ Mock Interview** | Role and difficulty selection, Gemini-generated domain questions, answer recording interface, and instant rubrics-based feedback with model answers. |
| **🤖 AI Career Agent** | Autonomous multi-step LangChain agent with 6 registered tools, grounded citations, loop prevention (`maxIterations: 5`), and an interactive "Tools Executed" inspector. |
| **📚 Grounded RAG Assistant** | Gemini embeddings (`text-embedding-004`) + ChromaDB vector search with verifiable citations and strict multi-tenant resume sandboxing. |
| **👤 My Profile** | User career profile manager, education details, target role setting, and dynamic skill tag manager. |

---

## 🛠️ Architecture & Tech Stack

### Frontend Application
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) with dark navy / electric violet design language
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios with Bearer token interceptor and graceful error propagation
- **Icons**: Lucide React
- **Linter**: Oxlint (0 warnings, 0 errors across 88 files)
- **Asset Optimization**: Manual vendor chunk splitting (`vendor-react`, `vendor-axios`, `vendor-misc`), all chunks $< 280\text{ kB}$

### Backend API (`server/`)
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 4.21
- **Database & ODM**: MongoDB + Mongoose (normalized schemas with indexes)
- **Security**: Helmet security headers, tiered rate limiting (`express-rate-limit`), bcrypt password hashing, and token authentication (JWT)
- **File Uploads**: Multer file sandboxing for `.pdf` and `.docx` up to 5MB with UUID file hashing
- **Testing**: Native Node.js test runner (`node:test`) + Supertest (**75 passing tests**)

### AI & Vector Store
- **Agent Framework**: LangChain.js (`@langchain/core`, `@langchain/google-genai`)
- **LLM**: Google Gemini 1.5 Flash (`gemini-1.5-flash`)
- **Embeddings**: Google Gemini Embeddings (`text-embedding-004`)
- **Vector Store**: ChromaDB HTTP client with resilient in-memory cosine fallback adapter

---

## 📁 Project Structure

```
CareerPilot/
├── docs/                               # Production documentation
│   ├── API_DOCUMENTATION.md            # Comprehensive REST API reference
│   ├── ARCHITECTURE.md                 # System diagrams, layer details & RAG specs
│   └── DEPLOYMENT_GUIDE.md             # Vercel, Render & Atlas deployment walkthrough
├── public/                             # Public static assets
├── src/                                # React 19 Frontend
│   ├── assets/                         # Icons, brand graphics
│   ├── components/                     # Reusable UI library (Card, Button, Badge, ProgressBar)
│   ├── data/                           # Verified career guidance seed data
│   ├── layout/                         # AppLayout, Sidebar, TopNav
│   ├── pages/                          # Application views (Dashboard, Resume, Agent, etc.)
│   ├── services/                       # API client & auth interceptor
│   ├── App.jsx                         # Route definitions
│   └── main.jsx                        # Entry point
├── server/                             # Node.js Express Backend
│   ├── src/
│   │   ├── config/                     # Database connection & options
│   │   ├── controllers/                # REST Controllers (Auth, Resume, RAG, Agent, etc.)
│   │   ├── middleware/                 # Auth, Error, Upload, Rate Limiting, Helmet
│   │   ├── models/                     # Mongoose schemas (User, Resume, Job, Roadmap, Chat)
│   │   ├── routes/                     # Express route declarations
│   │   ├── services/
│   │   │   ├── agent/                  # LangChain Career Agent & 6 Structured Tools
│   │   │   ├── ai/                     # Gemini AI prompt pipelines (Zod validated)
│   │   │   └── rag/                    # ChromaDB store, document chunker, knowledge seeder
│   │   ├── utils/                      # Response envelope, JWT, seed scripts
│   │   ├── app.js                      # Express application assembly
│   │   └── server.js                   # Server bootstrap & lifecycle
│   ├── tests/                          # Automated backend test suites (75 tests)
│   └── uploads/resumes/                # Isolated disk storage for uploaded resumes
├── .env.example                        # Frontend environment template
├── render.yaml                         # Render blueprint specification
├── vercel.json                         # Vercel SPA routing & cache configuration
├── vite.config.js                      # Vite build configuration with chunking
└── package.json
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20 or higher
- **npm**: v9 or higher
- **MongoDB**: Local MongoDB daemon or free MongoDB Atlas URI
- **Google Gemini API Key**: Free key from [Google AI Studio](https://aistudio.google.com)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd server

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/careerpilot
JWT_SECRET=development_super_secret_jwt_key_12345
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

Start the backend server:
```bash
# Seed initial sample jobs and verified knowledge
npm run dev
```
The API server starts at `http://localhost:5000`.

### 3. Frontend Setup
```bash
# In the repository root
npm install

# Create environment configuration
cp .env.example .env

# Start frontend development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing & Quality Assurance

CareerPilot maintains automated test coverage across all layers:

### Running Backend Test Suite
```bash
cd server
npm test
```

**Results: 75 Passed, 0 Failed, 0 Flaky**
- `agent.test.js` (13 tests): Tool schemas, privacy isolation, composite workflows, loop prevention, REST endpoints.
- `rag.test.js` (10 tests): Text splitting, cosine retrieval, grounded citations, out-of-domain handling, user data isolation.
- `resume.test.js` (9 tests): PDF & DOCX text extraction, validation, MIME checking, user isolation.
- `ai.test.js` (9 tests): Structured Gemini analysis, gap analysis, roadmap generation, interview scoring.
- `auth.test.js` (8 tests): Registration, login, duplicate detection, JWT validation, logout.
- `jobs.test.js` (4 tests): Pagination, filtering, single-job retrieval.
- `roadmap.test.js` (4 tests): Creation, retrieval, milestone progress updates.
- `chat.test.js` (5 tests): Session creation, message appending, conversation retrieval, deletion.
- `profile.test.js` (3 tests): Retrieval, updates, auth guards.
- `health.test.js` (2 tests): Health check probe, 404 handler.

### Frontend Quality Checks
```bash
# Fast Oxlint check (88 files)
npm run lint

# Production Vite build
npm run build
```

---

## 🔒 Security & Performance

- **Defense in Depth**: Helmet security headers configure strict CSP, frameguard (`DENY`), and cross-origin resource isolation.
- **Tiered Rate Limiting**: Dedicated rate limits protect against credential stuffing on `/api/auth`, scraping on general routes, and quota exhaustion on `/api/agent` & `/api/ai`.
- **User Resume Isolation**: Every resume file and vector chunk is strictly scoped to the authenticated user's ID. Suitewide automated tests verify that User A cannot retrieve User B's resume data under any conditions.
- **Safe Error Responses**: Unhandled exceptions mask stack traces and internal errors in production mode.
- **Vite Chunk Optimization**: Rolldown/Rollup manual chunking isolates heavy vendor bundles, keeping individual assets below 280kB.

---

## 🚢 Deployment & Production Setup

CareerPilot is ready for one-click deployment:
- **Frontend**: [Vercel](https://vercel.com) via [vercel.json](file:///c:/Desktop/WEB%20DEVELOPMENT/CareerPilot/vercel.json) (SPA rewrites and immutable asset caching).
- **Backend API**: [Render](https://render.com) via [render.yaml](file:///c:/Desktop/WEB%20DEVELOPMENT/CareerPilot/render.yaml) (Web Service with health probes).
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas).
- **Vector Database**: Standalone ChromaDB daemon or built-in in-memory fallback.

For complete step-by-step instructions, see the [Deployment Guide](file:///c:/Desktop/WEB%20DEVELOPMENT/CareerPilot/docs/DEPLOYMENT_GUIDE.md).

---

## 📚 Comprehensive Documentation

- 📖 [REST API Documentation](file:///c:/Desktop/WEB%20DEVELOPMENT/CareerPilot/docs/API_DOCUMENTATION.md) – Endpoints, parameters, response envelopes, and status codes.
- 🏗️ [System Architecture & Design](file:///c:/Desktop/WEB%20DEVELOPMENT/CareerPilot/docs/ARCHITECTURE.md) – Component layering, agent execution flow, and RAG data pipeline.
- 🚀 [Production Deployment Guide](file:///c:/Desktop/WEB%20DEVELOPMENT/CareerPilot/docs/DEPLOYMENT_GUIDE.md) – Hosting setup, environment variables, and production checklist.

---

## 📄 License
This project is open-source under the MIT License.
