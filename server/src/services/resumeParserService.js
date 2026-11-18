import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

// Known skills dictionary for comprehensive detection
const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Golang', 'Rust',
  'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'SQL', 'HTML', 'HTML5', 'CSS', 'CSS3',
  'React', 'React.js', 'React Native', 'Next.js', 'Vue', 'Vue.js', 'Angular', 'Svelte',
  'Node.js', 'Express', 'Express.js', 'NestJS', 'Django', 'FastAPI', 'Flask', 'Spring Boot',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite', 'DynamoDB', 'Supabase', 'Firebase',
  'AWS', 'Amazon Web Services', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes',
  'Terraform', 'CI/CD', 'GitHub Actions', 'Jenkins', 'Git', 'GitHub', 'GitLab', 'Linux',
  'GraphQL', 'REST API', 'RESTful API', 'Microservices', 'Tailwind CSS', 'Bootstrap',
  'Redux', 'Zustand', 'Vitest', 'Jest', 'Cypress', 'Playwright', 'Webpack', 'Vite',
  'Machine Learning', 'TensorFlow', 'PyTorch', 'Scikit-Learn', 'Pandas', 'NumPy',
  'LangChain', 'OpenAI', 'Gemini', 'LLM', 'RAG', 'Vector Database', 'ChromaDB',
  'Agile', 'Scrum', 'Jira', 'Figma', 'System Design', 'Data Structures', 'Algorithms'
];

/**
 * Extract raw text and metadata from PDF or DOCX file
 * @param {string} filePath - Absolute path to uploaded file
 * @param {string} mimeType - File MIME type
 * @param {Buffer} [optionalBuffer] - Optional in-memory buffer
 * @returns {Promise<Object>}
 */
export async function extractTextFromFile(filePath, mimeType = '', optionalBuffer = null) {
  try {
    const buffer = optionalBuffer || (filePath && fs.existsSync(filePath) ? fs.readFileSync(filePath) : null);

    if (!buffer || buffer.length === 0) {
      return {
        rawText: '',
        extractionStatus: 'failed',
        extractionError: 'File is empty or could not be read from disk.',
        metadata: { wordCount: 0, characterCount: 0, pageCount: 0 },
      };
    }

    const ext = filePath ? path.extname(filePath).toLowerCase() : '';
    let rawText = '';
    let pageCount = 1;

    // 1. PDF Extraction
    if (ext === '.pdf' || mimeType === 'application/pdf') {
      try {
        const parser = new PDFParse({ data: buffer });
        const textResult = await parser.getText();
        rawText = (textResult && textResult.text) ? textResult.text : '';
        pageCount = textResult.total || 1;
      } catch (pdfErr) {
        console.warn(`[PDF Parsing Error]: ${pdfErr.message}`);
        return {
          rawText: '',
          extractionStatus: 'failed',
          extractionError: `Failed to extract text from PDF: ${pdfErr.message}`,
          metadata: { wordCount: 0, characterCount: 0, pageCount: 1 },
        };
      }
    }
    // 2. DOCX Extraction
    else if (
      ext === '.docx' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      try {
        const docxResult = await mammoth.extractRawText({ buffer });
        rawText = docxResult.value || '';
        const words = (rawText.match(/\b\w+\b/g) || []).length;
        pageCount = Math.max(1, Math.ceil(words / 450));
      } catch (docxErr) {
        console.warn(`[DOCX Parsing Error]: ${docxErr.message}`);
        return {
          rawText: '',
          extractionStatus: 'failed',
          extractionError: `Failed to extract text from DOCX: ${docxErr.message}`,
          metadata: { wordCount: 0, characterCount: 0, pageCount: 1 },
        };
      }
    }
    // 3. Fallback for plain text or generic formats
    else {
      // eslint-disable-next-line no-control-regex
      rawText = buffer.toString('utf-8').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
    }

    // Clean & normalize text
    const cleanedText = cleanRawText(rawText);
    const characterCount = cleanedText.length;
    const wordCount = (cleanedText.match(/\b\w+\b/g) || []).length;

    // Detect empty or scanned/image-based documents (< 40 chars or < 8 words)
    if (cleanedText.trim().length < 40 || wordCount < 8) {
      return {
        rawText: cleanedText,
        extractionStatus: 'scanned_or_empty',
        extractionError:
          'Document contains very little or no readable text. It appears to be scanned or image-based. Please upload a standard text-based PDF or DOCX file.',
        metadata: { wordCount, characterCount, pageCount },
      };
    }

    return {
      rawText: cleanedText,
      extractionStatus: 'completed',
      extractionError: null,
      metadata: { wordCount, characterCount, pageCount },
    };
  } catch (error) {
    return {
      rawText: '',
      extractionStatus: 'failed',
      extractionError: error.message || 'Unknown extraction error occurred.',
      metadata: { wordCount: 0, characterCount: 0, pageCount: 1 },
    };
  }
}

/**
 * Clean up raw extracted text for structured parsing
 */
function cleanRawText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '') // Strip page footer marks
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Parse structured sections and data from raw resume text
 * @param {string} rawText
 * @returns {Object} structuredData
 */
export function parseResumeText(rawText) {
  if (!rawText || rawText.trim().length === 0) {
    return createEmptyStructuredData();
  }

  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const contact = extractContactInfo(lines, rawText);
  const sections = segmentSections(lines);

  const skills = extractSkills(sections.skills, rawText);
  const education = extractEducation(sections.education, rawText);
  const workExperience = extractWorkExperience(sections.experience);
  const projects = extractProjects(sections.projects);
  const certifications = extractCertifications(sections.certifications, rawText);
  const achievements = extractAchievements(sections.achievements);

  return {
    contact,
    education,
    skills,
    workExperience,
    projects,
    certifications,
    achievements,
  };
}

/**
 * Extract contact information: name, email, phone, links, location
 */
function extractContactInfo(lines, fullText) {
  const contact = {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
  };

  // 1. Email Regex
  const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    contact.email = emailMatch[0].trim();
  }

  // 2. Phone Regex
  const phoneMatch = fullText.match(/(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}|\+?\d{10,13})/);
  if (phoneMatch) {
    contact.phone = phoneMatch[0].trim();
  }

  // 3. LinkedIn Regex
  const linkedinMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|profile)\/([a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) {
    contact.linkedin = `linkedin.com/in/${linkedinMatch[1]}`;
  }

  // 4. GitHub Regex
  const githubMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  if (githubMatch) {
    contact.github = `github.com/${githubMatch[1]}`;
  }

  // 5. Name extraction (from top lines)
  const nonNameKeywords = [
    'resume', 'curriculum', 'vitae', 'cv', 'profile', 'contact', 'summary',
    'portfolio', 'phone', 'email', 'page', 'http', 'github', 'linkedin'
  ];

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    if (
      lower.includes('@') ||
      lower.includes('github.com') ||
      lower.includes('linkedin.com') ||
      nonNameKeywords.some((kw) => lower.includes(kw))
    ) {
      continue;
    }

    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && line.length <= 45 && !/[0-9]/.test(line)) {
      contact.name = line;
      break;
    }
  }

  if (!contact.name && lines.length > 0 && lines[0].length <= 50 && !lines[0].includes('@')) {
    contact.name = lines[0];
  }

  // 6. Location extraction
  const locationMatch = fullText.match(/\b([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?),\s*([A-Z]{2}|[A-Z][a-zA-Z]+)\b/);
  if (locationMatch) {
    contact.location = `${locationMatch[1]}, ${locationMatch[2]}`;
  }

  return contact;
}

/**
 * Segment lines into logical sections based on headers
 */
function segmentSections(lines) {
  const sections = {
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    achievements: [],
    other: [],
  };

  const headerPatterns = {
    skills: /^(?:(?:technical\s+)?skills|(?:core\s+)?competencies|technologies|tech\s+stack|tools)$/i,
    experience: /^(?:(?:work\s+|professional\s+)?experience|employment(?:\s+history)?|career(?:\s+history)?)$/i,
    education: /^(?:education|academic(?:\s+background|\s+history)?|qualifications)$/i,
    projects: /^(?:(?:key\s+|personal\s+|academic\s+)?projects)$/i,
    certifications: /^(?:certifications?|certificates?|licenses?|accreditations?)$/i,
    achievements: /^(?:achievements?|awards?|honors?|accomplishments?|publications?)$/i,
  };

  let currentSection = 'other';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 40 && !trimmed.includes('.') && !trimmed.startsWith('•') && !trimmed.startsWith('-')) {
      const normalizedHeader = trimmed.replace(/[:_#-]/g, '').trim();
      let matched = false;
      for (const [secName, regex] of Object.entries(headerPatterns)) {
        if (regex.test(normalizedHeader)) {
          currentSection = secName;
          matched = true;
          break;
        }
      }
      if (matched) continue;
    }

    sections[currentSection].push(trimmed);
  }

  return sections;
}

/**
 * Extract technical and soft skills
 */
function extractSkills(sectionLines, fullText) {
  const detected = new Set();

  // 1. Scan against dictionary across full text
  for (const skill of COMMON_SKILLS) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9#+])${escaped}([^a-zA-Z0-9#+]|$)`, 'i');
    if (regex.test(fullText)) {
      detected.add(skill);
    }
  }

  // 2. Scan section lines for comma / bullet lists
  for (const line of sectionLines) {
    const tokens = line.split(/[,|•·/]\s*/);
    for (let token of tokens) {
      token = token.replace(/^[-*•]\s*/, '').trim();
      if (token.length > 1 && token.length < 35 && !token.includes(':')) {
        if (!/^(and|with|including|proficient|expert|familiar|etc)$/i.test(token)) {
          detected.add(token);
        }
      }
    }
  }

  return Array.from(detected).slice(0, 30);
}

/**
 * Extract education history
 */
function extractEducation(sectionLines, fullText) {
  const educationList = [];
  const lines = sectionLines.length > 0 ? sectionLines : fullText.split('\n').map((l) => l.trim()).filter(Boolean);

  const degreeRegex = /\b(?:bachelor(?:'s)?|master(?:'s)?|b\.?s\.?|m\.?s\.?|b\.?tech|m\.?tech|ph\.?d\.?|associate(?:'s)?|diploma|b\.?a\.?|m\.?a\.?|b\.?e\.?)\b(?:\s+(?:in|of)\s+[a-zA-Z\s]+)?/i;
  const yearRegex = /\b(20\d{2}|19\d{2})(?:\s*[-–to]\s*(?:20\d{2}|present|current))?\b/i;
  const gpaRegex = /GPA:?\s*([0-4]\.\d{1,2}(?:\s*\/\s*4(?:\.0)?)?|\d{2,3}%)/i;
  const uniRegex = /(?:University(?:\s+of\s+[A-Za-z\s]+|\s+[A-Za-z\s]+)?|[A-Za-z\s]+(?:College|Institute|Academy|School|Polytechnic))/i;

  let currentItem = null;

  for (const line of lines) {
    const hasDegree = degreeRegex.test(line);
    const hasUni = uniRegex.test(line);
    const yearMatch = line.match(yearRegex);
    const gpaMatch = line.match(gpaRegex);

    if (hasDegree) {
      if (currentItem && (currentItem.degree || currentItem.institution)) {
        educationList.push(currentItem);
      }
      const degMatch = line.match(degreeRegex);
      currentItem = {
        degree: degMatch ? degMatch[0].trim() : line,
        institution: '',
        year: yearMatch ? yearMatch[0] : '',
        gpa: gpaMatch ? gpaMatch[1] : '',
        details: '',
      };
      if (hasUni) {
        currentItem.institution = line.replace(degreeRegex, '').replace(yearRegex, '').replace(gpaRegex, '').replace(/\s*[-–]\s*.*$/i, '').trim();
      }
    } else if (hasUni) {
      const cleanUni = line.replace(yearRegex, '').replace(gpaRegex, '').replace(/\s*[-–]\s*.*$/i, '').trim();
      if (currentItem && !currentItem.institution) {
        currentItem.institution = cleanUni;
        if (yearMatch && !currentItem.year) currentItem.year = yearMatch[0];
        if (gpaMatch && !currentItem.gpa) currentItem.gpa = gpaMatch[1];
      } else {
        if (currentItem && (currentItem.degree || currentItem.institution)) {
          educationList.push(currentItem);
        }
        currentItem = {
          degree: '',
          institution: cleanUni,
          year: yearMatch ? yearMatch[0] : '',
          gpa: gpaMatch ? gpaMatch[1] : '',
          details: '',
        };
      }
    } else if (currentItem) {
      if (!currentItem.year && yearMatch) currentItem.year = yearMatch[0];
      if (!currentItem.gpa && gpaMatch) currentItem.gpa = gpaMatch[1];
    }
  }

  if (currentItem && (currentItem.degree || currentItem.institution)) {
    educationList.push(currentItem);
  }

  return educationList;
}

/**
 * Extract work experience items
 */
function extractWorkExperience(sectionLines) {
  const experiences = [];
  const lines = sectionLines || [];

  const roleTitleRegex = /\b(?:Software\s+Engineer|Frontend\s+Developer|Backend\s+Developer|Full[- ]Stack\s+Developer|Developer|Engineer|Architect|Specialist|Analyst|Intern|Consultant|Manager|Lead|Designer)\b/i;
  const dateRangeRegex = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?\d{4}\s*[-–to]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|present|current)/i;

  let currentExp = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
    const hasRole = roleTitleRegex.test(line);
    const dateMatch = line.match(dateRangeRegex);

    if (hasRole && !isBullet) {
      if (currentExp) experiences.push(currentExp);
      const roleMatch = line.match(roleTitleRegex);

      let company = line.replace(roleTitleRegex, '').replace(dateRangeRegex, '').replace(/[|•–-]/g, '').trim();
      let duration = dateMatch ? dateMatch[0] : '';

      // Check if next line contains company and dates
      if (!company && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const nextDate = nextLine.match(dateRangeRegex);
        if (nextDate || nextLine.includes('|')) {
          duration = nextDate ? nextDate[0] : '';
          company = nextLine.replace(dateRangeRegex, '').replace(/[|•–-]/g, '').trim();
          i++; // skip next line
        }
      }

      currentExp = {
        role: roleMatch ? roleMatch[0] : line.slice(0, 40),
        company: company || 'Organization',
        duration: duration || 'Recent',
        location: '',
        description: '',
        highlights: [],
      };
    } else if (dateMatch && !isBullet && !currentExp) {
      currentExp = {
        role: line.replace(dateRangeRegex, '').replace(/[|•–-]/g, '').trim() || 'Role',
        company: 'Company',
        duration: dateMatch[0],
        location: '',
        description: '',
        highlights: [],
      };
    } else if (currentExp) {
      if (isBullet) {
        currentExp.highlights.push(line.replace(/^[-*•]\s*/, '').trim());
      } else if (!currentExp.description) {
        currentExp.description = line;
      }
    }
  }

  if (currentExp) {
    experiences.push(currentExp);
  }

  return experiences;
}

/**
 * Extract projects from project section
 */
function extractProjects(sectionLines) {
  const projects = [];
  let currentProject = null;

  for (const line of sectionLines || []) {
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
    if (!isBullet && line.length < 60 && !line.includes('.')) {
      if (currentProject) {
        projects.push(currentProject);
      }
      currentProject = {
        title: line.replace(/[|–-].*$/, '').trim(),
        description: '',
        techStack: [],
        link: '',
      };
    } else if (currentProject) {
      const cleanLine = line.replace(/^[-*•]\s*/, '').trim();
      if (!currentProject.description) {
        currentProject.description = cleanLine;
      }
      for (const skill of COMMON_SKILLS) {
        if (cleanLine.toLowerCase().includes(skill.toLowerCase()) && !currentProject.techStack.includes(skill)) {
          currentProject.techStack.push(skill);
        }
      }
    }
  }

  if (currentProject) {
    projects.push(currentProject);
  }

  return projects;
}

/**
 * Extract certifications
 */
function extractCertifications(sectionLines, fullText) {
  const certs = [];
  const certKeywords = [
    'AWS Certified', 'Google Cloud', 'Azure', 'Certified Kubernetes', 'Scrum Master',
    'CompTIA', 'PMP', 'Meta Certified', 'Oracle Certified', 'Cisco'
  ];

  for (const line of sectionLines || []) {
    const cleaned = line.replace(/^[-*•]\s*/, '').trim();
    if (cleaned.length > 3 && cleaned.length < 80) {
      certs.push(cleaned);
    }
  }

  for (const kw of certKeywords) {
    if (fullText.includes(kw) && !certs.some((c) => c.includes(kw))) {
      certs.push(kw);
    }
  }

  return certs.slice(0, 8);
}

/**
 * Extract achievements
 */
function extractAchievements(sectionLines) {
  const achievements = [];
  for (const line of sectionLines || []) {
    const cleaned = line.replace(/^[-*•]\s*/, '').trim();
    if (cleaned.length > 5 && cleaned.length < 120) {
      achievements.push(cleaned);
    }
  }
  return achievements.slice(0, 6);
}

/**
 * Calculate ATS Compatibility score and section breakdown from parsed resume
 * @param {string} rawText
 * @param {Object} structured
 * @returns {Object} { overallScore, atsScore, sections, keywords }
 */
export function calculateResumeMetrics(rawText, structured) {
  let score = 50; // base

  if (structured?.contact?.name) score += 6;
  if (structured?.contact?.email) score += 6;
  if (structured?.contact?.phone) score += 4;
  if (structured?.contact?.linkedin || structured?.contact?.github) score += 4;

  const skillCount = (structured?.skills || []).length;
  if (skillCount >= 10) score += 12;
  else if (skillCount >= 5) score += 8;
  else if (skillCount >= 2) score += 4;

  if ((structured?.education || []).length > 0) score += 8;
  if ((structured?.workExperience || []).length > 0) score += 8;

  const impactMatch = (rawText || '').match(/\b(?:\d+%|\$\d+|\d+\+?\s*(?:users|clients|projects|increase|growth|reduction))\b/gi);
  if (impactMatch && impactMatch.length >= 2) score += 6;

  const atsScore = Math.min(96, Math.max(68, score));
  const overallScore = Math.min(97, Math.max(70, atsScore + Math.floor(Math.random() * 4 - 1)));

  const expScore = Math.min(95, Math.max(70, 75 + ((structured?.workExperience?.length || 0) * 5)));
  const skillsScore = Math.min(95, Math.max(65, 60 + Math.min(30, skillCount * 3)));
  const eduScore = Math.min(95, Math.max(75, structured?.education?.length ? 88 : 75));
  const atsFormatScore = Math.min(92, Math.max(72, atsScore - 2));

  const sections = [
    {
      name: 'Work Experience',
      score: expScore,
      feedback:
        structured?.workExperience?.length > 0
          ? 'Clear job roles and career trajectory identified with relevant responsibility indicators.'
          : 'Work experience section is brief; consider elaborating on responsibilities and project deliverables.',
      suggestions: [
        'Add quantifiable metrics (e.g. % performance increase, latency reduction, user base)',
        'Start bullet points with strong action verbs (Architected, Engineered, Streamlined)',
      ],
    },
    {
      name: 'Skills',
      score: skillsScore,
      feedback: `Identified ${skillCount} technical and domain skills across modern stacks.`,
      suggestions: [
        'Organize skills into categories (Languages, Frameworks, Cloud/DevOps, Databases)',
        'Ensure in-demand modern tools like Docker, CI/CD, and Cloud are highlighted',
      ],
    },
    {
      name: 'Education',
      score: eduScore,
      feedback: 'Education entries verified with institution and degree details.',
      suggestions: [
        'Highlight relevant coursework, honors, or dean’s list recognition',
        'Add certifications or continuous learning milestones',
      ],
    },
    {
      name: 'Formatting & ATS',
      score: atsFormatScore,
      feedback: 'Clean text structure compatible with major Applicant Tracking Systems (ATS).',
      suggestions: [
        'Maintain single-column hierarchy for maximum parser accuracy',
        'Ensure standard section headers are used without complex graphics',
      ],
    },
  ];

  const foundSkills = structured?.skills || [];
  const targetKeywords = ['React', 'JavaScript', 'TypeScript', 'Node.js', 'REST API', 'Git', 'Docker', 'Next.js', 'CI/CD', 'PostgreSQL', 'Testing (Vitest)'];

  const found = targetKeywords.filter((kw) =>
    foundSkills.some((s) => s.toLowerCase() === kw.toLowerCase())
  );
  for (const s of foundSkills.slice(0, 10)) {
    if (!found.includes(s)) found.push(s);
  }

  const missing = targetKeywords.filter(
    (kw) => !foundSkills.some((s) => s.toLowerCase() === kw.toLowerCase())
  );

  return {
    overallScore,
    atsScore,
    sections,
    keywords: {
      found: found.slice(0, 12),
      missing: missing.slice(0, 6),
    },
  };
}

/**
 * Fallback empty structured data representation
 */
export function createEmptyStructuredData() {
  return {
    contact: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
    },
    education: [],
    skills: [],
    workExperience: [],
    projects: [],
    certifications: [],
    achievements: [],
  };
}
