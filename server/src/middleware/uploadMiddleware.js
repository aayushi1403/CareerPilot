import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDirectory = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomHex = crypto.randomBytes(12).toString('hex');
    const safeBaseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    cb(null, `resume-${Date.now()}-${randomHex}-${safeBaseName}${ext}`);
  },
});

// Strictly allowed extensions and MIME types
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.doc']);
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/octet-stream', // Fallback MIME for some OS/browser uploads
]);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // 1. Strict extension check
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new Error('Invalid file format. Only PDF, DOCX, and DOC files are supported.'),
      false
    );
  }

  // 2. Strict MIME type check
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(
      new Error('Invalid file MIME type. Only PDF, DOCX, and DOC documents are allowed.'),
      false
    );
  }

  // 3. Prevent executable or malicious double extensions (e.g. resume.pdf.exe)
  const baseName = path.basename(file.originalname);
  if (/\.(exe|sh|bat|cmd|vbs|js|php|py|jar|msi)$/i.test(baseName)) {
    return cb(new Error('Unsafe file upload rejected.'), false);
  }

  cb(null, true);
};

const maxSizeBytes = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5) * 1024 * 1024;

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: maxSizeBytes,
    files: 1,
  },
  fileFilter,
});
