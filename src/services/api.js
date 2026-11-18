import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 35000,
});

// Auto-inject JWT auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careerpilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Ensures an active authentication token exists, creating or logging into a demo account if needed.
 * @returns {Promise<string>}
 */
export async function ensureAuthToken() {
  const existingToken = localStorage.getItem('careerpilot_token');
  if (existingToken) {
    return existingToken;
  }

  const demoEmail = 'alex.mercer@careerpilot.io';
  const demoPassword = 'Password123!';

  try {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: demoEmail,
      password: demoPassword,
    });
    if (res.data?.data?.token) {
      localStorage.setItem('careerpilot_token', res.data.data.token);
      return res.data.data.token;
    }
  } catch {
    // If not found, register new demo account
    try {
      const regRes = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: 'Alex Mercer',
        email: demoEmail,
        password: demoPassword,
        targetJobRole: 'Full-Stack Developer',
        skills: ['React', 'JavaScript', 'Node.js', 'TypeScript', 'Git'],
      });
      if (regRes.data?.data?.token) {
        localStorage.setItem('careerpilot_token', regRes.data.data.token);
        return regRes.data.data.token;
      }
    } catch (regErr) {
      console.warn('[Auth Initialization Note]: Backend server may be offline or unreachable.', regErr.message);
    }
  }

  return null;
}

/**
 * Upload resume document to backend
 * @param {File} file
 * @param {Function} [onProgress] - Callback with percent integer (0-100)
 * @returns {Promise<Object>}
 */
export async function uploadResumeApi(file, onProgress) {
  await ensureAuthToken();

  const formData = new FormData();
  formData.append('resume', file);

  const response = await apiClient.post('/resumes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) {
          onProgress(percentCompleted);
        }
      }
    },
  });

  return response.data;
}

/**
 * Retrieve user's resumes
 */
export async function getResumesApi() {
  await ensureAuthToken();
  const response = await apiClient.get('/resumes');
  return response.data;
}

/**
 * Delete resume by ID
 */
export async function deleteResumeApi(id) {
  await ensureAuthToken();
  const response = await apiClient.delete(`/resumes/${id}`);
  return response.data;
}

// ─────────────────────────────────────────────────────────────
// LangChain & Google Gemini AI Endpoints
// ─────────────────────────────────────────────────────────────

/**
 * 1. AI Resume Analysis
 * @param {Object} payload - { resumeId?: string, resumeText?: string }
 */
export async function analyzeResumeAiApi(payload = {}) {
  await ensureAuthToken();
  const response = await apiClient.post('/ai/resume/analyze', payload);
  return response.data;
}

/**
 * 2. AI Career Recommendations
 * @param {Object} payload - { resumeId?: string, targetRole?: string, skills?: string[] }
 */
export async function getCareerRecommendationsAiApi(payload = {}) {
  await ensureAuthToken();
  const response = await apiClient.post('/ai/career/recommend', payload);
  return response.data;
}

/**
 * 3. AI Skill Gap Analysis
 * @param {Object} payload - { targetRole: string, currentSkills?: string[] }
 */
export async function getSkillGapAnalysisAiApi(payload = {}) {
  await ensureAuthToken();
  const response = await apiClient.post('/ai/skills/gap-analysis', payload);
  return response.data;
}

/**
 * 4. AI Career Roadmap Generator
 * @param {Object} payload - { currentRole?: string, targetRole: string, timelineMonths?: number, currentSkills?: string[] }
 */
export async function generateCareerRoadmapAiApi(payload = {}) {
  await ensureAuthToken();
  const response = await apiClient.post('/ai/roadmap/generate', payload);
  return response.data;
}

/**
 * 5a. AI Mock Interview Questions Generator
 * @param {Object} payload - { role?: string, category?: string, difficulty?: string, count?: number }
 */
export async function generateInterviewQuestionsAiApi(payload = {}) {
  await ensureAuthToken();
  const response = await apiClient.post('/ai/interview/questions', payload);
  return response.data;
}

/**
 * 5b. AI Mock Interview Answer Evaluator
 * @param {Object} payload - { role?: string, question: string, userAnswer: string }
 */
export async function evaluateInterviewAnswerAiApi(payload = {}) {
  await ensureAuthToken();
  const response = await apiClient.post('/ai/interview/evaluate', payload);
  return response.data;
}

// ─────────────────────────────────────────────────────────────
// Retrieval-Augmented Generation (RAG) Endpoints
// ─────────────────────────────────────────────────────────────

/**
 * 6. Query Grounded AI Career Assistant (LangChain + Gemini + ChromaDB)
 * @param {Object} payload - { question: string, filterDocType?: string, includeUserResume?: boolean, conversationId?: string }
 */
export async function queryRagAssistantApi(payload) {
  await ensureAuthToken();
  const response = await apiClient.post('/rag/query', payload);
  return response.data;
}

/**
 * 7. Retrieve RAG Vector Store & Knowledge Base Status
 */
export async function getRagStatusApi() {
  await ensureAuthToken();
  const response = await apiClient.get('/rag/status');
  return response.data;
}

/**
 * 8. Ingest Custom Document into Vector Store
 * @param {Object} payload - { title: string, text: string, docType?: string, source?: string }
 */
export async function ingestDocumentRagApi(payload) {
  await ensureAuthToken();
  const response = await apiClient.post('/rag/ingest', payload);
  return response.data;
}

// ─────────────────────────────────────────────────────────────
// Autonomous AI Career Agent (LangChain Tool Calling)
// ─────────────────────────────────────────────────────────────

/**
 * 9. Chat with the Tool-Enabled Autonomous Career Agent
 * @param {Object} payload - { message: string, conversationId?: string }
 */
export async function queryAgentChatApi(payload) {
  await ensureAuthToken();
  const response = await apiClient.post('/agent/chat', payload);
  return response.data;
}

/**
 * 10. Retrieve the list of available Agent Tools
 */
export async function getAgentToolsApi() {
  await ensureAuthToken();
  const response = await apiClient.get('/agent/tools');
  return response.data;
}
