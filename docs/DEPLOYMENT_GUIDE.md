# CareerPilot – Production Deployment Guide

This guide provides step-by-step instructions for deploying **CareerPilot – Your AI Career Copilot** to production using **Vercel** (Frontend), **Render** (Backend API), **MongoDB Atlas** (Database), and **Google AI Studio** (Gemini AI).

---

## Architecture Topology

```
                  ┌───────────────────────────────────────────────┐
                  │                 Vercel / CDN                  │
                  │    React 19 + Vite Frontend SPA (careerpilot)  │
                  └───────────────────────┬───────────────────────┘
                                          │ HTTPS
                                          ▼
                  ┌───────────────────────────────────────────────┐
                  │               Render Web Service              │
                  │      Express 4.21 API (careerpilot-api)       │
                  └─────────┬─────────────┬─────────────┬─────────┘
                            │             │             │
              ┌─────────────▼───┐   ┌─────▼─────┐   ┌───▼─────────────┐
              │  MongoDB Atlas  │   │  Gemini   │   │    ChromaDB     │
              │  Cloud Cluster  │   │ Flash/Emb │   │ Docker/Fallback │
              └─────────────────┘   └───────────┘   └─────────────────┘
```

---

## 1. Prerequisites Checklist

Before beginning deployment, ensure you have accounts with:
- [GitHub](https://github.com) – Repository hosting
- [MongoDB Atlas](https://www.mongodb.com/atlas) – Managed MongoDB database
- [Google AI Studio](https://aistudio.google.com) – Google Gemini API key
- [Render](https://render.com) – Node.js web service hosting
- [Vercel](https://vercel.com) – Static frontend hosting

---

## 2. Step 1: MongoDB Atlas Database Setup

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Click **Create** to deploy a new database cluster (select **M0 Free** or dedicated tier).
3. Under **Security → Database Access**:
   - Click **Add New Database User**.
   - Select **Password** authentication.
   - Enter a secure username and password (e.g., `careerpilot_user`).
   - Assign the `Read and write to any database` privilege.
4. Under **Security → Network Access**:
   - Click **Add IP Address**.
   - Choose **Allow Access from Anywhere** (`0.0.0.0/0`) so that hosting providers like Render can connect.
5. Under **Deployments → Database → Connect**:
   - Select **Drivers** (Node.js).
   - Copy the connection string. It will look like:
     ```
     mongodb+srv://careerpilot_user:<password>@cluster0.xxxxx.mongodb.net/careerpilot?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password and `careerpilot` as the database name.

---

## 3. Step 2: Google Gemini API Configuration

1. Visit [Google AI Studio](https://aistudio.google.com).
2. Sign in with your Google account.
3. Click **Get API key** and generate a new key for your project.
4. Copy the API key. Keep this confidential.
5. CareerPilot utilizes:
   - **Chat & Tool Calling**: `gemini-1.5-flash`
   - **Vector Embeddings**: `text-embedding-004`

---

## 4. Step 3: Backend API Deployment on Render

### Method A: Automated Deployment via `render.yaml`
1. Fork or push your CareerPilot repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), click **New → Blueprint**.
3. Select your GitHub repository.
4. Render will parse [render.yaml](file:///c:/Desktop/WEB%20DEVELOPMENT/CareerPilot/render.yaml) and configure the `careerpilot-api` service.
5. Provide the required secrets (`MONGODB_URI`, `GEMINI_API_KEY`, `CLIENT_URL`).
6. Click **Apply**.

### Method B: Manual Web Service Setup
1. In Render Dashboard, click **New + → Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name**: `careerpilot-api`
   - **Region**: Oregon (or closest to your users)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. Under **Environment Variables**, add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production security & masks stack traces |
   | `PORT` | `5000` | Render dynamically forwards port |
   | `CLIENT_URL` | `https://careerpilot.vercel.app` | Frontend production origin for CORS |
   | `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
   | `JWT_SECRET` | *(64-char random string)* | Secret key for signing auth tokens |
   | `JWT_EXPIRES_IN` | `7d` | Token lifetime |
   | `GEMINI_API_KEY` | `AIzaSy...` | Google Gemini API key |
   | `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini model name |
   | `GEMINI_EMBEDDING_MODEL` | `text-embedding-004` | Gemini embedding model |
   | `CHROMA_URL` | `http://localhost:8000` | ChromaDB URL (or rely on built-in fallback) |
5. Click **Create Web Service**.
6. Note the deployed URL: `https://careerpilot-api.onrender.com`.

---

## 5. Step 4: Frontend Deployment on Vercel

1. In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New... → Project**.
2. Import your GitHub repository.
3. Configure project build settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (Project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, configure:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://careerpilot-api.onrender.com/api` | Full URL to deployed Express API |
5. Click **Deploy**.
6. Vercel automatically honors [vercel.json](file:///c:/Desktop/WEB%20DEVELOPMENT/CareerPilot/vercel.json) for SPA client-side route rewrites and asset caching headers.
7. Once deployed, note your frontend URL (e.g., `https://careerpilot.vercel.app`).
8. If the frontend domain differs from what was entered in Render's `CLIENT_URL`, update `CLIENT_URL` in Render and trigger a re-deploy.

---

## 6. Step 5: ChromaDB Vector Store (Optional Docker Deployment)

CareerPilot is architected with a **dual vector engine**:
- **Automatic Fallback (Zero Config)**: If no ChromaDB instance is found at `CHROMA_URL`, CareerPilot automatically initializes an in-memory vector store performing exact cosine similarity search over Gemini vector embeddings.
- **Hosted ChromaDB (Optional)**: If persistent standalone vector storage is preferred:
  1. Deploy Chroma via Docker on Render (Private Service) or Fly.io:
     ```bash
     docker run -p 8000:8000 chromadb/chroma:latest
     ```
  2. Set `CHROMA_URL` in the backend service to the internal URL (e.g. `http://chroma-service:8000`).

---

## 7. Step 6: Post-Deployment Smoke Verification

Run these verification tests against your live endpoints:

### 1. Backend Health Check
```bash
curl -i https://careerpilot-api.onrender.com/api/health
```
**Expected Response**:
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "vectorStore": "connected",
    "geminiApi": "configured"
  }
}
```

### 2. Verified Knowledge Base Status
```bash
curl -i https://careerpilot-api.onrender.com/api/rag/status
```
**Expected Response**:
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "totalDocuments": 5,
    "totalChunks": 28
  }
}
```

### 3. Agent Tool Catalog
```bash
curl -i https://careerpilot-api.onrender.com/api/agent/tools
```
**Expected Response**:
```json
{
  "success": true,
  "data": [
    { "name": "resume_analyzer" },
    { "name": "skill_gap_analyzer" },
    { "name": "career_roadmap_generator" },
    { "name": "job_recommendation_tool" },
    { "name": "rag_retriever" },
    { "name": "mock_interview_tool" }
  ]
}
```

### 4. Frontend Route Navigation
1. Open `https://careerpilot.vercel.app` in your browser.
2. Verify page transitions: `/dashboard`, `/resume-analyzer`, `/job-matcher`, `/skill-gap`, `/roadmap`, `/mock-interview`, `/ai-assistant`.
3. Test direct deep linking: refresh the browser on `/mock-interview` to ensure Vercel rewrites to `/index.html` without 404.

---

## 8. Production Security & Maintenance Checklist

- [x] **SSL / TLS**: Both Vercel and Render provide automated Let's Encrypt SSL certificates.
- [x] **Rate Limiting**: Tiered limiters prevent denial-of-service and API abuse.
- [x] **Environment Secrets**: API keys (`GEMINI_API_KEY`, `JWT_SECRET`) are never bundled in client code.
- [x] **File Upload Sandbox**: Max 5MB file size limit and strict MIME validation protect host storage.
- [x] **Data Isolation**: User resume embeddings and documents are isolated using user ID metadata constraints.
- [x] **Database Backups**: Enable continuous backups in MongoDB Atlas under **Backup & Recovery**.
