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
      if (config.headers?.set) {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: automatically handle 401 unauthenticated
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Only clear token if not already on auth login/register endpoint
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('careerpilot_token');
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Returns current JWT token from storage or null
 * @returns {string|null}
 */
export function ensureAuthToken() {
  return localStorage.getItem('careerpilot_token') || null;
}

// ─────────────────────────────────────────────────────────────
// Authentication & User Profile Endpoints
// ─────────────────────────────────────────────────────────────

/**
 * Register new user
 */
export async function registerApi(userData) {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
}

/**
 * Log in existing user
 */
export async function loginApi(credentials) {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
}

/**
 * Get current authenticated user
 */
export async function getMeApi() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

/**
 * Log out user
 */
export async function logoutApi() {
  const response = await apiClient.post('/auth/logout');
  return response.data;
}

/**
 * Get user profile
 */
export async function getProfileApi() {
  const response = await apiClient.get('/profile');
  return response.data;
}

/**
 * Update user profile
 */
export async function updateProfileApi(profileData) {
  const response = await apiClient.put('/profile', profileData);
  return response.data;
}

// ─────────────────────────────────────────────────────────────
// Resume Processing Endpoints
// ─────────────────────────────────────────────────────────────

/**
 * Upload resume document to backend
 * @param {File} file
 * @param {Function} [onProgress] - Callback with percent integer (0-100)
 * @returns {Promise<Object>}
 */
export async function uploadResumeApi(file, onProgress) {
  const token = ensureAuthToken();

  if (!token) {
    throw new Error('Authentication required. Please sign in to upload your resume.');
  }

  const formData = new FormData();
  formData.append('resume', file);

  const response = await apiClient.post('/resumes/upload', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
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
  const response = await apiClient.get('/resumes');
  return response.data;
}

/**
 * Retrieve single resume by ID
 */
export async function getResumeByIdApi(id) {
  const response = await apiClient.get(`/resumes/${id}`);
  return response.data;
}

/**
 * Delete resume by ID
 */
export async function deleteResumeApi(id) {
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
  const response = await apiClient.post('/ai/resume/analyze', payload);
  return response.data;
}

/**
 * 2. AI Career Recommendations
 * @param {Object} payload - { resumeId?: string, targetRole?: string, skills?: string[] }
 */
export async function getCareerRecommendationsAiApi(payload = {}) {
  const response = await apiClient.post('/ai/career/recommend', payload);
  return response.data;
}

/**
 * 3. AI Skill Gap Analysis
 * @param {Object} payload - { targetRole: string, currentSkills?: string[] }
 */
export async function getSkillGapAnalysisAiApi(payload = {}) {
  const response = await apiClient.post('/ai/skills/gap-analysis', payload);
  return response.data;
}

/**
 * 4. AI Career Roadmap Generator
 * @param {Object} payload - { currentRole?: string, targetRole: string, timelineMonths?: number, currentSkills?: string[] }
 */
export async function generateCareerRoadmapAiApi(payload = {}) {
  const response = await apiClient.post('/ai/roadmap/generate', payload);
  return response.data;
}

/**
 * 5a. AI Mock Interview Questions Generator
 * @param {Object} payload - { role?: string, category?: string, difficulty?: string, count?: number }
 */
export async function generateInterviewQuestionsAiApi(payload = {}) {
  const response = await apiClient.post('/ai/interview/questions', payload);
  return response.data;
}

/**
 * 5b. AI Mock Interview Answer Evaluator
 * @param {Object} payload - { role?: string, question: string, userAnswer: string }
 */
export async function evaluateInterviewAnswerAiApi(payload = {}) {
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
  const response = await apiClient.post('/rag/query', payload);
  return response.data;
}

/**
 * 7. Retrieve RAG Vector Store & Knowledge Base Status
 */
export async function getRagStatusApi() {
  const response = await apiClient.get('/rag/status');
  return response.data;
}

/**
 * 8. Ingest Custom Document into Vector Store
 * @param {Object} payload - { title: string, text: string, docType?: string, source?: string }
 */
export async function ingestDocumentRagApi(payload) {
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
  const response = await apiClient.post('/agent/chat', payload);
  return response.data;
}

/**
 * 10. Retrieve the list of available Agent Tools
 */
export async function getAgentToolsApi() {
  const response = await apiClient.get('/agent/tools');
  return response.data;
}
