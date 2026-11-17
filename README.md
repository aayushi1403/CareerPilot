# CareerPilot – Your AI Career Copilot

CareerPilot is a modern full-stack AI-powered career development platform that helps students and professionals analyze resumes, discover suitable jobs, identify skill gaps, generate personalized career roadmaps, and prepare for interviews.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Language**: JavaScript (ESM)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) with custom dark navy / electric violet theme
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios (configured for API calls)
- **Icons**: Lucide React
- **Linter**: Oxlint

### Backend Service (`server/`)
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database & ODM**: MongoDB + Mongoose
- **Authentication**: JWT (JSON Web Tokens) with Bearer token header
- **Security**: Password hashing via `bcryptjs`, CORS configuration for `http://localhost:5173`
- **File Uploads**: `multer` for `.pdf`, `.doc`, `.docx` resume processing up to 5MB
- **Testing**: Node.js native test runner (`node:test`) + `supertest`

---

## 📁 Full-Stack Project Structure

```
CareerPilot/
├── public/                     # Static assets (favicons, icons)
├── src/                        # Frontend Application
│   ├── assets/                 # Brand logos & visual assets
│   ├── components/             # Reusable design system components
│   │   ├── Badge.jsx               # Status badges and chip tags
│   │   ├── Button.jsx              # Multi-variant button (primary, secondary, ghost, danger)
│   │   ├── Card.jsx                # Dark navy card with subtle borders & glow effects
│   │   ├── DemoBanner.jsx          # Sticky indicator clarifying demo/mock state
│   │   ├── Notification.jsx        # Interactive notification dropdown
│   │   ├── ProfileDropdown.jsx     # User profile avatar menu
│   │   ├── ProgressBar.jsx         # Gradient progress indicators
│   │   └── StatCard.jsx            # Metric display with trend arrows
│   ├── data/
│   │   └── mockData.js         # Central mock data (profile, metrics, resume, jobs, roadmap, Q&As)
│   ├── layout/
│   │   ├── AppLayout.jsx       # Shell layout wrapping authenticated views
│   │   ├── Sidebar.jsx         # Collapsible desktop sidebar & mobile drawer
│   │   └── TopNav.jsx          # Top navigation with search, notifications, & avatar
│   ├── pages/
│   │   ├── Landing.jsx         # High-converting marketing landing page
│   │   ├── Dashboard.jsx       # Career health overview, metrics, readiness & recommendations
│   │   ├── ResumeAnalyzer.jsx  # Resume ATS score, feedback, keyword audit, & file upload parsing
│   │   ├── JobMatcher.jsx      # AI job matches with search, filters, details modal & easy apply
│   │   ├── SkillGapAnalyzer.jsx# Role comparison, current vs required skills & learning plan
│   │   ├── CareerRoadmap.jsx   # Phased step-by-step career progression tracker with projects
│   │   ├── MockInterview.jsx   # Role selection, interview questions, answer eval & feedback
│   │   ├── AiAssistant.jsx     # Conversational AI career copilot with prompt pills
│   │   └── Profile.jsx         # Profile completion, editable bio, & skill tag manager
│   ├── App.jsx                 # Main routing configuration
│   ├── main.jsx                # React root mount
│   └── index.css               # Global Tailwind v4 styles, custom gradients, animations
├── server/                     # Backend API Service
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection lifecycle & options
│   │   ├── controllers/
│   │   │   ├── authController.js   # Register, login, me, logout handlers
│   │   │   ├── profileController.js# User profile retrieval and updating
│   │   │   ├── resumeController.js # Upload, list, retrieve, and delete resumes
│   │   │   ├── roadmapController.js# Create, retrieve, and update roadmap progress
│   │   │   ├── jobController.js    # Job listings retrieval, searching & filtering
│   │   │   └── chatController.js   # Conversation history and messages persistence
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # JWT authentication verification middleware
│   │   │   ├── errorMiddleware.js  # Centralized error handler & 404 router
│   │   │   ├── uploadMiddleware.js # Multer disk storage and file validation
│   │   │   └── validateMiddleware.js# Request payload validation
│   │   ├── models/
│   │   │   ├── User.js             # User schema with bcrypt password hashing
│   │   │   ├── Resume.js           # Resume document schema with ATS scoring
│   │   │   ├── Roadmap.js          # Phased career roadmap schema
│   │   │   ├── Job.js              # Career opportunities schema with text index
│   │   │   └── Chat.js             # Chat session & message history schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js       # /api/auth endpoints
│   │   │   ├── profileRoutes.js    # /api/profile endpoints
│   │   │   ├── resumeRoutes.js     # /api/resumes endpoints
│   │   │   ├── roadmapRoutes.js    # /api/roadmaps endpoints
│   │   │   ├── jobRoutes.js        # /api/jobs endpoints
│   │   │   └── chatRoutes.js       # /api/chat endpoints
│   │   ├── utils/
│   │   │   ├── apiResponse.js      # Standardized JSON response utilities
│   │   │   ├── jwt.js              # Token signing & verification
│   │   │   └── seedJobs.js         # Default initial career opportunities seed
│   │   ├── app.js                  # Express app setup, CORS, static uploads, & routes
│   │   └── server.js               # Server bootstrap & MongoDB connection
│   ├── uploads/resumes/            # Uploaded resume files storage
│   ├── tests/                      # Comprehensive API test suite (38 passing tests)
│   ├── .env.example                # Sample environment variables template
│   └── package.json                # Server dependencies & scripts
├── index.html                  # HTML entry point with metadata
├── package.json                # Frontend dependencies and scripts
└── vite.config.js              # Vite config with React & Tailwind plugins
```

---

## 📡 Backend API Endpoints

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user with password hashing & return JWT |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials & return JWT |
| `POST` | `/api/auth/logout` | Public | Logout confirmation |
| `GET` | `/api/auth/me` | Protected | Retrieve currently authenticated user |

### 2. User Profile (`/api/profile`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | Protected | Retrieve user profile (education, graduation year, target role, skills, etc.) |
| `PUT` | `/api/profile` | Protected | Update profile details and recalculate profile completion |

### 3. Resume APIs (`/api/resumes`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/resumes/upload` | Protected | Upload `.pdf`, `.doc`, or `.docx` resume (up to 5MB) & receive ATS analysis |
| `GET` | `/api/resumes` | Protected | Retrieve all uploaded resumes for authenticated user |
| `GET` | `/api/resumes/:id` | Protected | Retrieve single resume metadata and section score analysis |
| `DELETE` | `/api/resumes/:id` | Protected | Delete resume record and remove file from disk |

### 4. Career Roadmap APIs (`/api/roadmaps`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/roadmaps` | Protected | Create personalized career roadmap with custom or default milestones |
| `GET` | `/api/roadmaps` | Protected | Retrieve active roadmap for authenticated user |
| `GET` | `/api/roadmaps/:id` | Protected | Retrieve specific roadmap by ID |
| `PATCH` | `/api/roadmaps/:id/progress` | Protected | Update phase status or toggle project completion |

### 5. Job APIs (`/api/jobs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/jobs` | Public | Retrieve jobs with query filters (`q`, `location`, `type`, `tags`, `minScore`, `page`, `limit`) |
| `GET` | `/api/jobs/:id` | Public | Retrieve detailed job opportunity by ID |

### 6. Chat History APIs (`/api/chat`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/chat` | Protected | Save new conversation or append messages to an existing conversation |
| `GET` | `/api/chat` | Protected | Retrieve list of previous conversation sessions |
| `GET` | `/api/chat/:id` | Protected | Retrieve full conversation message history |
| `DELETE` | `/api/chat/:id` | Protected | Delete conversation history |

### 7. System Health
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Service health status, uptime, and timestamp |

---

## 🛠️ How to Run Frontend and Backend Together

### Step 1: Configure Environment Variables
Inside the `server/` directory, verify or create `.env` based on `.env.example`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/careerpilot
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE_MB=5
UPLOAD_DIR=uploads/resumes
```

### Step 2: Start the Backend Server
Open a terminal in `CareerPilot/server` and run:
```bash
# Start in watch mode for development
npm run dev

# Or start in standard mode
npm start
```
The backend will launch at `http://localhost:5000`. You can confirm service health at `http://localhost:5000/api/health`.

### Step 3: Run Backend Tests
In the `server/` terminal:
```bash
npm run test
```
Runs the 38 unit & integration test suites validating all authentication, profile, resume, roadmap, job, and chat endpoints.

### Step 4: Start the Frontend Application
In a separate terminal at the root `CareerPilot` directory:
```bash
npm run dev
```
Open your browser to `http://localhost:5173`. CORS is pre-configured so frontend requests to `http://localhost:5000/api/...` will communicate seamlessly without origin blocks.

---

## 🔮 Next Phase (AI Integration)
- **LangChain.js + Google Gemini**: Integrating structured prompt chains for automated resume text extraction, dynamic ATS scoring, real-time job matching vector similarity, and intelligent chat copilot responses.
