import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap,
  Download,
  Eye,
  XCircle,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  FolderGit2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { resumeAnalysis as demoData } from '../data/mockData';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import DemoBanner from '../components/DemoBanner';
import { uploadResumeApi, analyzeResumeAiApi } from '../services/api';

// ── Score Ring ───────────────────────────────────────────────
const ScoreRing = ({ score }) => (
  <div className="relative w-32 h-32">
    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="54" fill="none" stroke="#1f2937" strokeWidth="12" />
      <circle
        cx="64"
        cy="64"
        r="54"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="12"
        strokeDasharray={`${(score / 100) * 339} 339`}
        strokeLinecap="round"
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-3xl font-bold text-slate-100">{score}</span>
      <span className="text-xs text-slate-400">/ 100</span>
    </div>
  </div>
);

// ── Main Page ────────────────────────────────────────────────
const ResumeAnalyzer = () => {
  const [analyzed, setAnalyzed] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [uploadError, setUploadError] = useState(null);
  const [activeFileName, setActiveFileName] = useState('demo_resume.pdf');
  const [activeFileSize, setActiveFileSize] = useState('240 KB');

  // AI Deep Audit state (LangChain + Gemini)
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiError, setAiError] = useState(null);

  // Parsed Resume state from backend
  const [parsedData, setParsedData] = useState({
    overallScore: demoData.overallScore,
    atsScore: demoData.atsScore,
    sections: demoData.sections,
    keywords: demoData.keywords,
    extractionStatus: 'completed',
    extractionError: null,
    metadata: { wordCount: 420, characterCount: 2850, pageCount: 1 },
    structuredData: {
      contact: {
        name: 'Alex Mercer',
        email: 'alex.mercer@example.dev',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/alexmercer',
        github: 'github.com/alexmercer',
      },
      education: [
        {
          degree: 'B.S. in Computer Science',
          institution: 'University of California, Berkeley',
          year: '2019 - 2023',
          gpa: '3.8 / 4.0',
        },
      ],
      skills: [
        'React', 'JavaScript', 'TypeScript', 'Node.js', 'Express',
        'Next.js', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'Git', 'Tailwind CSS',
      ],
      workExperience: [
        {
          role: 'Full-Stack Developer',
          company: 'TechNova Solutions',
          duration: 'Jun 2023 - Present',
          highlights: [
            'Engineered high-performance microservices reducing API latency by 35%.',
            'Architected client portals with React and Vite serving 150,000+ active users.',
          ],
        },
      ],
      projects: [
        {
          title: 'CareerPilot AI Copilot',
          description: 'Full-stack AI career assistant with automated resume parsing and ATS scoring.',
          techStack: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
        },
      ],
      certifications: ['AWS Certified Solutions Architect (Associate)'],
      achievements: ['1st Place Hackathon Winner - UC Berkeley 2022'],
    },
  });

  const fileInputRef = useRef(null);

  const handleAnalyzeAnother = () => {
    setAnalyzed(false);
    setUploadProgress(0);
    setUploadError(null);
    setAiAnalysis(null);
    setAiError(null);
  };

  const handleRunAiAudit = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const textToAudit =
        parsedData.rawText ||
        `${parsedData.structuredData?.contact?.name || 'Alex Mercer'}\nSkills: ${(parsedData.structuredData?.skills || ['React', 'Node.js', 'TypeScript', 'Docker', 'PostgreSQL']).join(', ')}\nExperience: Full-Stack Developer at TechNova Solutions (2023-Present). Built high-throughput microservices using Node.js and TypeScript, decreasing API latency by 35%. Architected React UI serving 150k active users.\nEducation: B.S. in Computer Science, UC Berkeley.`;

      const res = await analyzeResumeAiApi({ resumeText: textToAudit });
      if (res?.data?.analysis) {
        setAiAnalysis({
          ...res.data.analysis,
          isAiGenerated: res.data.isAiGenerated,
          model: res.data.model,
          note: res.data.note,
        });
      }
    } catch (err) {
      console.error('[AI Audit Error]:', err);
      setAiError(err.response?.data?.message || err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const validateAndProcessFile = async (file) => {
    setUploadError(null);
    if (!file) return;

    // 1. Format validation
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      setUploadError('Unsupported file format. Please upload a PDF, DOC, or DOCX document.');
      return;
    }

    // 2. Size validation: 5MB
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 5MB.`
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);
    setUploadStage('Uploading document to server...');
    setActiveFileName(file.name);
    setActiveFileSize(`${(file.size / 1024).toFixed(0)} KB`);
    setAiAnalysis(null);

    try {
      const response = await uploadResumeApi(file, (percent) => {
        const mappedProgress = Math.min(80, Math.max(15, Math.round(percent * 0.8)));
        setUploadProgress(mappedProgress);
        if (mappedProgress > 60) {
          setUploadStage('Extracting text & parsing resume sections...');
        }
      });

      setUploadProgress(95);
      setUploadStage('Calculating ATS metrics and structured profiles...');

      setTimeout(() => {
        if (response?.data?.resume) {
          const resDoc = response.data.resume;
          setParsedData({
            rawText: resDoc.rawText || '',
            overallScore: resDoc.overallScore || 75,
            atsScore: resDoc.atsScore || 70,
            sections: resDoc.sections || [],
            keywords: resDoc.keywords || { found: [], missing: [] },
            extractionStatus: resDoc.extractionStatus || 'completed',
            extractionError: resDoc.extractionError || null,
            metadata: resDoc.metadata || { wordCount: 0, characterCount: 0, pageCount: 1 },
            structuredData: resDoc.structuredData || {},
          });
          setIsDemo(false);
        }

        setUploadProgress(100);
        setUploadStage('Complete! Rendering breakdown...');
        setIsUploading(false);
        setAnalyzed(true);
      }, 500);
    } catch (err) {
      console.error('[Upload Error]:', err);
      const serverMsg =
        err.response?.data?.message ||
        (err.message?.includes('Network Error')
          ? 'Could not connect to backend server at localhost:5000. Please ensure the server is running.'
          : err.message);

      setUploadError(serverMsg);
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const loadDemoResume = () => {
    setUploadError(null);
    setActiveFileName('demo_resume.pdf');
    setActiveFileSize('245 KB');
    setIsDemo(true);
    setAiAnalysis(null);
    setAiError(null);
    setParsedData({
      overallScore: demoData.overallScore,
      atsScore: demoData.atsScore,
      sections: demoData.sections,
      keywords: demoData.keywords,
      extractionStatus: 'completed',
      extractionError: null,
      metadata: { wordCount: 420, characterCount: 2850, pageCount: 1 },
      structuredData: {
        contact: {
          name: 'Alex Mercer',
          email: 'alex.mercer@example.dev',
          phone: '+1 (555) 234-5678',
          location: 'San Francisco, CA',
          linkedin: 'linkedin.com/in/alexmercer',
          github: 'github.com/alexmercer',
        },
        education: [
          {
            degree: 'B.S. in Computer Science',
            institution: 'University of California, Berkeley',
            year: '2019 - 2023',
            gpa: '3.8 / 4.0',
          },
        ],
        skills: [
          'React', 'JavaScript', 'TypeScript', 'Node.js', 'Express',
          'Next.js', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'Git', 'Tailwind CSS',
        ],
        workExperience: [
          {
            role: 'Full-Stack Developer',
            company: 'TechNova Solutions',
            duration: 'Jun 2023 - Present',
            highlights: [
              'Engineered high-performance microservices reducing API latency by 35%.',
              'Architected client portals with React and Vite serving 150,000+ active users.',
            ],
          },
        ],
        projects: [
          {
            title: 'CareerPilot AI Copilot',
            description: 'Full-stack AI career assistant with automated resume parsing and ATS scoring.',
            techStack: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
          },
        ],
        certifications: ['AWS Certified Solutions Architect (Associate)'],
        achievements: ['1st Place Hackathon Winner - UC Berkeley 2022'],
      },
    });
    setAnalyzed(true);
  };

  const {
    overallScore,
    atsScore,
    sections,
    keywords,
    extractionStatus,
    extractionError,
    metadata,
    structuredData,
  } = parsedData;

  const contact = structuredData?.contact || {};
  const education = structuredData?.education || [];
  const skillsList = structuredData?.skills || [];
  const workExperience = structuredData?.workExperience || [];
  const projects = structuredData?.projects || [];
  const certifications = structuredData?.certifications || [];
  const achievements = structuredData?.achievements || [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-100">
          Resume <span className="gradient-text">Analyzer</span>
        </h1>
        <p className="text-slate-400">
          Upload your PDF or DOCX resume for automated extraction and <span className="gradient-text font-medium">Gemini AI deep audit</span>
        </p>
      </div>

      {isDemo && <DemoBanner />}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx"
        className="hidden"
      />

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start justify-between text-red-400 text-sm gap-3">
          <div className="flex items-start gap-2.5">
            <XCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Upload / Extraction Notice</p>
              <p className="text-xs text-red-400/90 mt-0.5">{uploadError}</p>
            </div>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-xs text-red-400 hover:text-red-300 underline flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Scanned Document Warning */}
      {analyzed && extractionStatus === 'scanned_or_empty' && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300 text-sm">
          <AlertTriangle size={20} className="flex-shrink-0 mt-0.5 text-amber-400" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-200">Image-Based / Scanned Resume Detected</p>
            <p className="text-xs text-amber-300/90 leading-relaxed">
              {extractionError ||
                'This resume appears to be a scanned image or photo PDF without selectable text. For complete parsing and accurate ATS scoring, please upload a direct digital export from Microsoft Word, Google Docs, or LaTeX.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Upload Section ───────────────────────────────────── */}
      {!analyzed ? (
        <Card padding="none">
          {isUploading ? (
            <div className="p-10 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center animate-pulse">
                <Loader2 size={32} className="text-violet-400 animate-spin" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <p className="text-lg font-semibold text-slate-100">{uploadStage}</p>
                <p className="text-xs text-slate-400">
                  Processing {activeFileName} ({activeFileSize})
                </p>
                <div className="pt-2">
                  <ProgressBar value={uploadProgress} color="violet" size="md" showValue={true} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={[
                  'border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer',
                  isDragging
                    ? 'border-violet-500/80 bg-violet-500/5'
                    : 'border-slate-600 hover:border-violet-500/50',
                ].join(' ')}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-violet-500/10">
                    <Upload size={40} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-100 mb-1">
                      Drop your resume here, or <span className="text-violet-400 underline">browse</span>
                    </p>
                    <p className="text-sm text-slate-400">PDF, DOC, DOCX up to 5MB</p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <Upload size={16} className="mr-2" /> Select File
                  </Button>
                </div>
              </div>
              <div className="text-center pt-0 pb-5">
                <button
                  onClick={loadDemoResume}
                  className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                >
                  or try with our preloaded demo resume →
                </button>
              </div>
            </>
          )}
        </Card>
      ) : (
        <>
          {/* ── Upload Status Bar ─────────────────────────────── */}
          <Card padding="sm">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <FileText size={18} className="text-violet-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-200">{activeFileName}</p>
                    {isDemo ? (
                      <Badge variant="neutral">Demo Preview</Badge>
                    ) : (
                      <Badge variant={extractionStatus === 'completed' ? 'success' : 'warning'}>
                        {extractionStatus === 'completed' ? 'Processed' : 'Scanned PDF'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {activeFileSize} • {metadata?.wordCount || 0} words • {metadata?.pageCount || 1} page(s)
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.alert('Report download will be enabled in upcoming phase!')}
                >
                  <Download size={14} className="mr-1.5" /> Download Report
                </Button>
                <Button variant="secondary" size="sm" onClick={handleAnalyzeAnother}>
                  <Upload size={14} className="mr-1.5" /> Upload Another
                </Button>
                {!isDemo && (
                  <Button variant="ghost" size="sm" onClick={loadDemoResume} title="Switch to Demo">
                    <RefreshCw size={14} />
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* ── Extracted Candidate Profile ──────────────────── */}
          {(contact.name || contact.email || contact.phone) && (
            <Card hover padding="md">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
                  <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <User size={18} className="text-violet-400" />
                    Candidate Profile <span className="text-xs font-normal text-slate-400">(Extracted)</span>
                  </h2>
                  <Badge variant="violet">Structured Data</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1 text-sm">
                  {contact.name && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <User size={15} className="text-slate-400 flex-shrink-0" />
                      <span className="font-semibold text-slate-100">{contact.name}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2 text-slate-300 truncate">
                      <Mail size={15} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone size={15} className="text-slate-400 flex-shrink-0" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.location && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin size={15} className="text-slate-400 flex-shrink-0" />
                      <span>{contact.location}</span>
                    </div>
                  )}
                  {contact.linkedin && (
                    <div className="flex items-center gap-2 text-slate-300 truncate">
                      <span className="text-xs font-semibold text-cyan-400">in</span>
                      <span className="text-xs text-cyan-400/90 truncate">{contact.linkedin}</span>
                    </div>
                  )}
                  {contact.github && (
                    <div className="flex items-center gap-2 text-slate-300 truncate">
                      <FolderGit2 size={15} className="text-slate-400 flex-shrink-0" />
                      <span className="text-xs text-slate-300 truncate">{contact.github}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* ── Score Hero ───────────────────────────────────── */}
          <Card hover>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Ring */}
              <div className="flex flex-col items-center gap-2">
                <ScoreRing score={overallScore} />
                <p className="text-sm text-slate-400 font-medium">Overall Score</p>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-28 bg-slate-700/60" />

              {/* ATS + breakdown */}
              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">ATS Score</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {atsScore}
                      <span className="text-sm text-slate-400 font-normal"> / 100</span>
                    </p>
                  </div>
                  <Badge variant={atsScore >= 75 ? 'success' : atsScore >= 60 ? 'warning' : 'error'}>
                    <TrendingUp size={12} className="mr-1" />
                    {atsScore >= 80 ? 'ATS Optimized' : atsScore >= 65 ? 'Competitive' : 'Needs Optimization'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {sections.map((sec) => (
                    <div key={sec.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 truncate">{sec.name}</span>
                        <span className="text-slate-300 font-medium ml-1">{sec.score}</span>
                      </div>
                      <ProgressBar
                        value={sec.score}
                        showValue={false}
                        size="sm"
                        color={sec.score >= 80 ? 'violet' : sec.score >= 65 ? 'cyan' : 'violet'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* ── LangChain & Google Gemini AI Deep Audit ────────── */}
          <Card className="border border-violet-500/30 bg-gradient-to-br from-violet-950/20 via-[#0a1628] to-[#07101e]">
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      Gemini AI Deep Resume Audit
                    </h2>
                    <p className="text-xs text-slate-400">
                      Powered by LangChain.js & Google Gemini Structured Output
                    </p>
                  </div>
                </div>

                {!aiAnalysis ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleRunAiAudit}
                    disabled={isAiLoading}
                  >
                    {isAiLoading ? (
                      <>
                        <Loader2 size={15} className="mr-2 animate-spin" /> Analyzing with Gemini...
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} className="mr-2" /> Run AI Deep Audit
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant={aiAnalysis.isAiGenerated ? 'violet' : 'neutral'}>
                      {aiAnalysis.isAiGenerated ? 'Gemini 1.5 Flash' : 'Domain Heuristics'}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={handleRunAiAudit} disabled={isAiLoading}>
                      <RefreshCw size={14} className={isAiLoading ? 'animate-spin' : ''} />
                    </Button>
                  </div>
                )}
              </div>

              {aiError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  {aiError}
                </div>
              )}

              {aiAnalysis && (
                <div className="space-y-4 pt-2 border-t border-slate-700/40">
                  {/* Summary */}
                  <div className="p-3.5 rounded-xl bg-violet-500/5 border border-violet-500/20">
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-400 mb-1">
                      Executive Profile Summary
                    </p>
                    <p className="text-sm text-slate-200 leading-relaxed">{aiAnalysis.summary}</p>
                  </div>

                  {/* Strengths & Weaknesses Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle size={14} /> Competitive Strengths ({aiAnalysis.strengths?.length || 0})
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {aiAnalysis.strengths?.map((str, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <AlertCircle size={14} /> Identified Gaps & Vulnerabilities ({aiAnalysis.weaknesses?.length || 0})
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {aiAnalysis.weaknesses?.map((w, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-400 mt-0.5">•</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Soft Skills & Missing Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Soft Skills */}
                    {aiAnalysis.softSkills?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-300">
                          Demonstrated Soft Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {aiAnalysis.softSkills.map((sk) => (
                            <span
                              key={sk}
                              className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Sections */}
                    {aiAnalysis.missingSections?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-300">
                          Recommended Missing Sections
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {aiAnalysis.missingSections.map((sec) => (
                            <span
                              key={sec}
                              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700"
                            >
                              {sec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actionable Improvement Suggestions */}
                  {aiAnalysis.improvementSuggestions?.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-[#0a1628] border border-slate-700/60 space-y-2">
                      <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                        Actionable Suggestions for Recruiter Impact
                      </p>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {aiAnalysis.improvementSuggestions.map((sug, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-violet-400 font-bold">{idx + 1}.</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ATS Bullet Point Rewrites */}
                  {aiAnalysis.atsFeedback?.bulletImprovements?.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/30 space-y-2">
                      <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Zap size={14} /> Quantifiable ATS Bullet Point Rewrites (STAR Format)
                      </p>
                      <div className="space-y-2 text-xs">
                        {aiAnalysis.atsFeedback.bulletImprovements.map((bullet, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 font-mono text-[11px] text-slate-300">
                            {bullet}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* ── Detected Skills ──────────────────────────────── */}
          {skillsList.length > 0 && (
            <Card>
              <h2 className="text-base font-semibold text-slate-100 mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Code size={18} className="text-violet-400" />
                  Extracted Technical Skills ({skillsList.length})
                </span>
                <span className="text-xs text-slate-400">Parsed from document</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center text-xs px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* ── Work Experience & Education Highlights ──────── */}
          {(workExperience.length > 0 || education.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Experience */}
              {workExperience.length > 0 && (
                <Card padding="md">
                  <h3 className="text-base font-semibold text-slate-100 mb-3 flex items-center gap-2">
                    <Briefcase size={17} className="text-cyan-400" /> Work Experience
                  </h3>
                  <div className="space-y-3">
                    {workExperience.map((exp, idx) => (
                      <div key={idx} className="border-l-2 border-cyan-500/30 pl-3 space-y-1">
                        <p className="text-sm font-semibold text-slate-100">{exp.role}</p>
                        <p className="text-xs text-slate-400">
                          {exp.company} {exp.duration && `• ${exp.duration}`}
                        </p>
                        {exp.highlights && exp.highlights.length > 0 && (
                          <ul className="text-xs text-slate-300 list-disc list-inside space-y-1 pt-1">
                            {exp.highlights.slice(0, 2).map((h, hIdx) => (
                              <li key={hIdx} className="truncate">{h}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Education */}
              {education.length > 0 && (
                <Card padding="md">
                  <h3 className="text-base font-semibold text-slate-100 mb-3 flex items-center gap-2">
                    <GraduationCap size={17} className="text-emerald-400" /> Education
                  </h3>
                  <div className="space-y-3">
                    {education.map((edu, idx) => (
                      <div key={idx} className="border-l-2 border-emerald-500/30 pl-3 space-y-1">
                        <p className="text-sm font-semibold text-slate-100">{edu.degree || 'Degree'}</p>
                        <p className="text-xs text-slate-400">
                          {edu.institution || 'University'} {edu.year && `• ${edu.year}`}
                        </p>
                        {edu.gpa && (
                          <p className="text-xs text-emerald-400/90 font-medium">GPA: {edu.gpa}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ── Projects & Certifications (if available) ─────── */}
          {(projects.length > 0 || certifications.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.length > 0 && (
                <Card padding="md">
                  <h3 className="text-base font-semibold text-slate-100 mb-3 flex items-center gap-2">
                    <FolderGit2 size={17} className="text-violet-400" /> Projects
                  </h3>
                  <div className="space-y-2.5">
                    {projects.map((proj, idx) => (
                      <div key={idx} className="space-y-1">
                        <p className="text-sm font-semibold text-slate-200">{proj.title}</p>
                        {proj.description && (
                          <p className="text-xs text-slate-400 line-clamp-2">{proj.description}</p>
                        )}
                        {proj.techStack && proj.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {certifications.length > 0 && (
                <Card padding="md">
                  <h3 className="text-base font-semibold text-slate-100 mb-3 flex items-center gap-2">
                    <Award size={17} className="text-amber-400" /> Certifications & Honors
                  </h3>
                  <div className="space-y-2">
                    {certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle size={14} className="text-amber-400 flex-shrink-0" />
                        <span>{cert}</span>
                      </div>
                    ))}
                    {achievements.map((ach, idx) => (
                      <div key={`ach-${idx}`} className="flex items-center gap-2 text-xs text-slate-300">
                        <Award size={14} className="text-violet-400 flex-shrink-0" />
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ── Section Analysis Breakdown ───────────────────── */}
          {sections && sections.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                <Eye size={18} className="text-violet-400" /> Section Breakdown & Feedback
              </h2>
              <div className="space-y-3">
                {sections.map((sec) => (
                  <Card key={sec.name} hover padding="md">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <h3 className="font-semibold text-slate-100">{sec.name}</h3>
                        <Badge
                          variant={
                            sec.score >= 80 ? 'success' : sec.score >= 65 ? 'warning' : 'error'
                          }
                        >
                          {sec.score} / 100
                        </Badge>
                      </div>
                      <ProgressBar value={sec.score} showValue={false} size="sm" />
                      <p className="text-sm text-slate-400">{sec.feedback}</p>
                      {sec.suggestions && sec.suggestions.length > 0 && (
                        <ul className="space-y-1.5">
                          {sec.suggestions.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              {sec.score >= 70 ? (
                                <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                              ) : (
                                <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                              )}
                              <span className="text-slate-300">{s}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ── Keywords Panel ───────────────────────────────── */}
          {keywords && (keywords.found?.length > 0 || keywords.missing?.length > 0) && (
            <Card>
              <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <Zap size={18} className="text-violet-400" /> Keyword Analysis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Found */}
                <div>
                  <p className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-1.5">
                    <CheckCircle size={14} /> Found Keywords ({keywords.found?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(keywords.found || []).map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing */}
                <div>
                  <p className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-1.5">
                    <AlertCircle size={14} /> Missing Keywords ({keywords.missing?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(keywords.missing || []).map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
