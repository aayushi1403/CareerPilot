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
} from 'lucide-react';
import { resumeAnalysis } from '../data/mockData';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import DemoBanner from '../components/DemoBanner';

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
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [uploadError, setUploadError] = useState(null);
  const [activeFileName, setActiveFileName] = useState('demo_resume.pdf');
  const [activeFileSize, setActiveFileSize] = useState('240 KB');

  const fileInputRef = useRef(null);

  const { overallScore, atsScore, sections, keywords } = resumeAnalysis;

  const handleAnalyzeAnother = () => {
    setAnalyzed(false);
    setUploadProgress(0);
    setUploadError(null);
  };

  const validateAndProcessFile = (file) => {
    setUploadError(null);
    if (!file) return;

    // Format validation
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      setUploadError('Unsupported file format. Please upload a PDF, DOC, or DOCX document.');
      return;
    }

    // Size validation: 5MB
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 5MB.`);
      return;
    }

    // Start simulated upload & parsing
    setIsUploading(true);
    setUploadProgress(15);
    setUploadStage('Validating document format and security...');
    setActiveFileName(file.name);
    setActiveFileSize(`${(file.size / 1024).toFixed(0)} KB`);

    setTimeout(() => {
      setUploadProgress(45);
      setUploadStage('Extracting text and identifying resume sections...');
    }, 600);

    setTimeout(() => {
      setUploadProgress(80);
      setUploadStage('Calculating ATS keyword compatibility & section scores...');
    }, 1300);

    setTimeout(() => {
      setUploadProgress(100);
      setUploadStage('Analysis complete! Rendering breakdown...');
      setTimeout(() => {
        setIsUploading(false);
        setAnalyzed(true);
      }, 500);
    }, 2000);
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
    setAnalyzed(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-100">
          Resume <span className="gradient-text">Analyzer</span>
        </h1>
        <p className="text-slate-400">
          Get <span className="gradient-text font-medium">AI-powered</span> insights on your resume
        </p>
      </div>

      <DemoBanner />

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
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-red-400 text-sm">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-xs text-red-400 hover:text-red-300 underline ml-3"
          >
            Dismiss
          </button>
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
                <p className="text-lg font-semibold text-slate-100">
                  {uploadStage}
                </p>
                <p className="text-xs text-slate-400">
                  Parsing {activeFileName} ({activeFileSize})
                </p>
                <div className="pt-2">
                  <ProgressBar
                    value={uploadProgress}
                    color="violet"
                    size="md"
                    showValue={true}
                  />
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
          {/* ── Upload Again bar ─────────────────────────────── */}
          <Card padding="sm">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <FileText size={18} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{activeFileName}</p>
                  <p className="text-xs text-slate-400">{activeFileSize} • Analyzed just now (Demo)</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => window.alert('Download feature coming in next phase!')}>
                  <Download size={14} className="mr-1.5" /> Download Report
                </Button>
                <Button variant="secondary" size="sm" onClick={handleAnalyzeAnother}>
                  <Upload size={14} className="mr-1.5" /> Analyze Another
                </Button>
              </div>
            </div>
          </Card>

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
                    <p className="text-2xl font-bold text-cyan-400">{atsScore}<span className="text-sm text-slate-400 font-normal"> / 100</span></p>
                  </div>
                  <Badge variant="violet">
                    <TrendingUp size={12} className="mr-1" /> Improving
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {sections.map((sec) => (
                    <div key={sec.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 truncate">{sec.name}</span>
                        <span className="text-slate-300 font-medium ml-1">{sec.score}</span>
                      </div>
                      <ProgressBar value={sec.score} showValue={false} size="sm" color={sec.score >= 80 ? 'violet' : sec.score >= 65 ? 'cyan' : 'violet'} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* ── Sections Analysis ────────────────────────────── */}
          <div>
            <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
              <Eye size={18} className="text-violet-400" /> Section Breakdown
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
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* ── Keywords Panel ───────────────────────────────── */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Zap size={18} className="text-violet-400" /> Keyword Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Found */}
              <div>
                <p className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-1.5">
                  <CheckCircle size={14} /> Found Keywords ({keywords.found.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {keywords.found.map((kw) => (
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
                  <AlertCircle size={14} /> Missing Keywords ({keywords.missing.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {keywords.missing.map((kw) => (
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
        </>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
