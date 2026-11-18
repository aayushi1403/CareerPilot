import { HumanMessage, SystemMessage, ToolMessage, AIMessage } from '@langchain/core/messages';
import { getGeminiModel, isGeminiConfigured } from '../ai/geminiClient.js';
import { initializeAgentTools } from './tools/index.js';

const SYSTEM_PROMPT = `You are CareerPilot's Autonomous AI Career Agent.
Your mission is to understand user career goals, select appropriate specialized tools, execute them safely, and synthesize actionable, highly personalized guidance.

AVAILABLE TOOLS:
1. resume_analyzer: Evaluates the authenticated user's uploaded resume for ATS score, technical skills, strengths, weaknesses, and improvement suggestions.
2. skill_gap_analyzer: Compares candidate skills against target role requirements to identify missing skills, match percentages, and prioritized actions.
3. career_roadmap_generator: Generates chronological, milestone-based learning roadmaps with recommended projects.
4. job_recommendation_tool: Searches and ranks verified job opportunities matching candidate skills and target roles.
5. rag_retriever: Searches the verified ChromaDB knowledge base for engineering competency frameworks, STAR interview strategies, and ATS standards.
6. mock_interview_tool: Generates role-specific technical/behavioral interview questions or evaluates candidate answers.

AGENT BEHAVIOR GUIDELINES:
- Multi-step reasoning: For complex questions (e.g. "Am I ready to become a backend developer?"), run a cohesive workflow:
  1. Inspect the candidate's resume/skills with resume_analyzer.
  2. Retrieve verified role requirements using rag_retriever.
  3. Compare skills using skill_gap_analyzer.
  4. Formulate milestone milestones using career_roadmap_generator.
- Explicit Transparency: Always explain which tools you invoked and why. Cite verified sources using "[Source: Title]".
- Safety & Privacy: Never attempt to access another candidate's private data. Tools are strictly scoped to the authenticated user.
- Clarity: If a request lacks critical specifics (e.g., target role is missing and not in profile), ask clarification questions directly.`;

/**
 * Parses user message to detect high-level intent for deterministic planner fallback
 * @param {string} text
 * @param {Object} user
 * @returns {Object}
 */
export function classifyUserIntent(text, user) {
  const lower = text.toLowerCase();

  // Composite Readiness workflow ("Am I ready to become X?", "I want to become X, what should I do?")
  const isReadiness =
    (lower.includes('ready') || lower.includes('can i become') || lower.includes('transition') || lower.includes('am i qualified')) ||
    (lower.includes('want to become') && (lower.includes('how') || lower.includes('ready') || lower.includes('step')));

  // Target role extraction
  let detectedRole = null;
  if (lower.includes('backend')) detectedRole = 'Backend Developer';
  else if (lower.includes('frontend') || lower.includes('react')) detectedRole = 'Frontend Developer';
  else if (lower.includes('full-stack') || lower.includes('fullstack')) detectedRole = 'Full-Stack Developer';
  else if (lower.includes('devops') || lower.includes('cloud')) detectedRole = 'DevOps Engineer';
  else if (lower.includes('data engineer') || lower.includes('data science')) detectedRole = 'Data Engineer';
  else if (lower.includes('mobile') || lower.includes('ios') || lower.includes('android')) detectedRole = 'Mobile App Developer';
  else if (user?.targetJobRole) detectedRole = user.targetJobRole;

  // Single tool intents
  const isResumeAnalysis =
    lower.includes('resume') || lower.includes('cv') || lower.includes('ats score') || lower.includes('review my resume');
  const isSkillGap =
    lower.includes('skill gap') || lower.includes('missing skill') || lower.includes('compare my skills') || lower.includes('what skills do i need');
  const isRoadmap =
    lower.includes('roadmap') || lower.includes('learning path') || lower.includes('milestone') || lower.includes('study plan');
  const isJobSearch =
    lower.includes('job') || lower.includes('hiring') || lower.includes('vacancy') || lower.includes('open position') || lower.includes('recommend jobs');
  const isInterview =
    lower.includes('interview') || lower.includes('question') || lower.includes('mock') || lower.includes('star method');
  const isKnowledgeQuery =
    lower.includes('what is') || lower.includes('how to format') || lower.includes('guide') || lower.includes('best practice');

  return {
    isReadiness,
    isResumeAnalysis,
    isSkillGap,
    isRoadmap,
    isJobSearch,
    isInterview,
    isKnowledgeQuery,
    detectedRole,
  };
}

/**
 * Execute a planned sequence of tools deterministically
 * Used when Gemini API is unconfigured or to provide ultra-fast verified fallback
 */
async function executeDeterministicPlan({ message, user, toolsMap, intent }) {
  const toolsUsed = [];
  const citations = [];
  let answer = '';
  let clarificationNeeded = false;
  let suggestedFollowUps = [];

  const { detectedRole } = intent;
  const effectiveRole = detectedRole || user?.targetJobRole || 'Backend Developer';

  // 1. Composite Readiness Workflow
  if (intent.isReadiness) {
    // Step 1: Analyze Resume
    const resumeTool = toolsMap.get('resume_analyzer');
    const resumeResRaw = await resumeTool.invoke({});
    const resumeRes = JSON.parse(resumeResRaw);
    toolsUsed.push({
      tool: 'resume_analyzer',
      input: {},
      summary: resumeRes.resumeFound
        ? `Analyzed candidate resume (${resumeRes.fileName}) - ATS Score: ${resumeRes.atsScore}/100 with ${resumeRes.technicalSkills.length} identified skills.`
        : 'Checked for uploaded resume (no file uploaded yet; defaulted to profile skills).',
    });

    const candidateSkills = resumeRes.resumeFound
      ? resumeRes.technicalSkills
      : user?.skills || ['JavaScript', 'HTML', 'CSS'];

    // Step 2: Retrieve verified knowledge standards
    const ragTool = toolsMap.get('rag_retriever');
    const ragResRaw = await ragTool.invoke({
      query: `${effectiveRole} core technical requirements architecture`,
      maxResults: 2,
    });
    const ragRes = JSON.parse(ragResRaw);
    toolsUsed.push({
      tool: 'rag_retriever',
      input: { query: `${effectiveRole} core technical requirements architecture` },
      summary: `Retrieved ${ragRes.retrievedCount} verified industry competency benchmark passages from ChromaDB.`,
    });

    if (ragRes.passages) {
      for (const p of ragRes.passages) {
        citations.push({
          title: p.title,
          source: p.source,
          snippet: p.content.slice(0, 160) + '...',
          docType: p.docType,
        });
      }
    }

    // Step 3: Skill Gap Analysis
    const gapTool = toolsMap.get('skill_gap_analyzer');
    const gapResRaw = await gapTool.invoke({
      targetRole: effectiveRole,
      currentSkills: candidateSkills,
    });
    const gapRes = JSON.parse(gapResRaw);
    toolsUsed.push({
      tool: 'skill_gap_analyzer',
      input: { targetRole: effectiveRole, currentSkills: candidateSkills },
      summary: `Compared ${candidateSkills.length} skills against ${effectiveRole} benchmark. Identified ${gapRes.missingSkills.length} gaps (Match: ${gapRes.matchPercentage}%).`,
    });

    // Step 4: Roadmap Generation
    const roadmapTool = toolsMap.get('career_roadmap_generator');
    const roadmapResRaw = await roadmapTool.invoke({
      targetRole: effectiveRole,
      timelineMonths: 6,
      currentSkills: candidateSkills,
    });
    const roadmapRes = JSON.parse(roadmapResRaw);
    toolsUsed.push({
      tool: 'career_roadmap_generator',
      input: { targetRole: effectiveRole, timelineMonths: 6 },
      summary: `Generated 6-month roadmap with ${roadmapRes.totalPhases} phases and ${roadmapRes.recommendedProjects.length} capstone projects.`,
    });

    const criticalGaps = gapRes.missingSkills.slice(0, 4).map((s) => s.skill || s).join(', ');
    const topProject = roadmapRes.recommendedProjects?.[0]?.title || 'Production REST API Service';

    answer = `### Career Readiness Evaluation: **${effectiveRole}**

Based on a comprehensive multi-tool evaluation of your profile, verified industry benchmarks, and skill matrix:

#### 1. Current Readiness Assessment
- **Role Match Rating**: **${gapRes.matchPercentage}%**
- **Resume Status**: ${resumeRes.resumeFound ? `Verified (${resumeRes.fileName}) – ATS Score: **${resumeRes.atsScore}/100**` : 'No resume uploaded; evaluated using profile skills'}
- **Current Core Strengths**: ${candidateSkills.slice(0, 5).join(', ') || 'Core JavaScript Fundamentals'}

#### 2. Key Skill Gaps Identified
To reach production readiness for **${effectiveRole}**, your top priority gaps are:
- **${criticalGaps}** [Source: ${citations[0]?.title || 'Engineering Competency Framework'}]
- Emphasize automated integration testing, database connection pooling, and secure authentication pipelines.

#### 3. Recommended 6-Month Action Roadmap
- **Phase 1 (${roadmapRes.phases?.[0]?.phase || 'Foundations'})**: Focus on ${roadmapRes.phases?.[0]?.skillsToLearn?.slice(0, 3)?.join(', ') || 'Core Architecture'}.
- **Phase 2 (${roadmapRes.phases?.[1]?.phase || 'Advanced'})**: Master ${roadmapRes.phases?.[1]?.skillsToLearn?.slice(0, 3)?.join(', ') || 'System Scalability'}.
- **Featured Capstone**: Build **${topProject}** to showcase verifiable code quality to engineering hiring managers.`;

    suggestedFollowUps = [
      `What are the most common interview questions for ${effectiveRole}?`,
      `Show me open ${effectiveRole} jobs that match my current skills`,
      'How can I improve my resume bullet points using the XYZ formula?',
    ];
  } else if (intent.isResumeAnalysis) {
    const resumeTool = toolsMap.get('resume_analyzer');
    const resRaw = await resumeTool.invoke({});
    const res = JSON.parse(resRaw);
    toolsUsed.push({
      tool: 'resume_analyzer',
      input: {},
      summary: res.resumeFound
        ? `Analyzed resume "${res.fileName}" - ATS Score: ${res.atsScore}/100.`
        : 'Checked for uploaded resume (none found).',
    });

    if (res.resumeFound) {
      answer = `### Resume Analysis Report: **${res.fileName}**

- **ATS Optimization Score**: **${res.atsScore}/100** (Overall Health: ${res.overallScore}/100)
- **Top Identified Skills**: ${res.technicalSkills.slice(0, 6).join(', ')}

#### Key Strengths
${res.strengths.slice(0, 3).map((s) => `• ${s}`).join('\n')}

#### Recommended Improvements
${res.improvementSuggestions.slice(0, 3).map((s) => `• ${s}`).join('\n')}`;
    } else {
      clarificationNeeded = true;
      answer = `I checked your account, but you haven't uploaded a resume yet.

To get an in-depth ATS evaluation, head over to the **Resume Analyzer** page to upload your PDF or DOCX resume, or paste your resume text here!`;
    }

    suggestedFollowUps = [
      'What keywords are missing from my resume for backend roles?',
      'How do I reformat my bullet points with Google’s XYZ impact formula?',
    ];
  } else if (intent.isSkillGap) {
    const gapTool = toolsMap.get('skill_gap_analyzer');
    const resRaw = await gapTool.invoke({ targetRole: effectiveRole });
    const res = JSON.parse(resRaw);
    toolsUsed.push({
      tool: 'skill_gap_analyzer',
      input: { targetRole: effectiveRole },
      summary: `Analyzed skill gaps against ${effectiveRole}. Match percentage: ${res.matchPercentage}%.`,
    });

    answer = `### Skill Gap Breakdown for **${effectiveRole}**

- **Match Score**: **${res.matchPercentage}%**
- **Existing Matched Skills**: ${res.existingSkills.map((s) => s.skill || s).join(', ') || 'None matched'}

#### Priority Missing Skills
${res.missingSkills.slice(0, 5).map((s) => `• **${s.skill || s}** (${s.priority || 'High'} Priority): ${s.recommendedAction || 'Recommended practice'}`).join('\n')}

${res.learningRoadmapSummary ? `\n> **Summary**: ${res.learningRoadmapSummary}` : ''}`;

    suggestedFollowUps = [
      `Generate a career roadmap to learn these missing ${effectiveRole} skills`,
      `Find jobs for ${effectiveRole} matching my current skills`,
    ];
  } else if (intent.isRoadmap) {
    const roadmapTool = toolsMap.get('career_roadmap_generator');
    const resRaw = await roadmapTool.invoke({ targetRole: effectiveRole, timelineMonths: 6 });
    const res = JSON.parse(resRaw);
    toolsUsed.push({
      tool: 'career_roadmap_generator',
      input: { targetRole: effectiveRole, timelineMonths: 6 },
      summary: `Generated structured roadmap for ${effectiveRole} (${res.totalPhases} phases).`,
    });

    answer = `### Personalized Career Roadmap: **${res.title || effectiveRole}**

- **Target Role**: ${effectiveRole}
- **Estimated Commitment**: ~${res.estimatedHoursPerWeek} hrs/week over ${res.timelineMonths} months

${res.phases.map((p, idx) => `#### Phase ${idx + 1}: ${p.phase} (${p.durationWeeks || '4'} weeks)\n• **Milestone Objective**: ${p.milestone}\n• **Skills to Master**: ${(p.skillsToLearn || []).join(', ')}`).join('\n\n')}

#### Recommended Showcase Capstones
${res.recommendedProjects.slice(0, 2).map((proj) => `• **${proj.title}**: ${proj.description} *(Tech: ${(proj.techStack || []).join(', ')})*`).join('\n')}`;

    suggestedFollowUps = [
      `What interview questions test these ${effectiveRole} concepts?`,
      'Show me job opportunities for this career path',
    ];
  } else if (intent.isJobSearch) {
    const jobTool = toolsMap.get('job_recommendation_tool');
    const resRaw = await jobTool.invoke({ role: effectiveRole, limit: 3 });
    const res = JSON.parse(resRaw);
    toolsUsed.push({
      tool: 'job_recommendation_tool',
      input: { role: effectiveRole, limit: 3 },
      summary: `Found and ranked ${res.totalFound} matching job opportunities for "${effectiveRole}".`,
    });

    answer = `### Top Recommended Opportunities: **${effectiveRole}**

Here are the highest matching verified job opportunities for your skill profile:

${res.jobs.map((j) => `• **${j.title}** at **${j.company}**\n  - Match Score: **${j.matchScore}%** | Salary: ${j.salary} | Location: ${j.location}\n  - Required Skills: ${(j.requiredSkills || []).join(', ')}`).join('\n\n')}`;

    suggestedFollowUps = [
      'Am I ready to apply for these positions?',
      'How should I tailor my resume for these job descriptions?',
    ];
  } else if (intent.isInterview) {
    const interviewTool = toolsMap.get('mock_interview_tool');
    const resRaw = await interviewTool.invoke({
      action: 'generate_questions',
      role: effectiveRole,
      count: 3,
    });
    const res = JSON.parse(resRaw);
    toolsUsed.push({
      tool: 'mock_interview_tool',
      input: { action: 'generate_questions', role: effectiveRole, count: 3 },
      summary: `Generated ${res.questions?.length || 3} tailored interview questions for ${effectiveRole}.`,
    });

    answer = `### Technical Interview Questions: **${effectiveRole}**

Practice formulating your answers using the **STAR method** (Situation, Task, Action, Result):

${(res.questions || []).map((q, idx) => `**Q${idx + 1} (${q.category || 'Technical'} - ${q.difficulty})**: ${q.question}\n- *Pro Tip*: ${(q.tips || []).join(' ')}`).join('\n\n')}`;

    suggestedFollowUps = [
      'How do I structure a behavioral answer using the STAR method?',
      'Can you evaluate my answer to question 1?',
    ];
  } else {
    // Default to RAG Knowledge Retrieval
    const ragTool = toolsMap.get('rag_retriever');
    const resRaw = await ragTool.invoke({ query: message, maxResults: 3 });
    const res = JSON.parse(resRaw);
    toolsUsed.push({
      tool: 'rag_retriever',
      input: { query: message },
      summary: `Retrieved ${res.retrievedCount} verified reference passages from ChromaDB.`,
    });

    if (res.passages && res.passages.length > 0) {
      for (const p of res.passages) {
        citations.push({
          title: p.title,
          source: p.source,
          snippet: p.content.slice(0, 160) + '...',
          docType: p.docType,
        });
      }

      answer = `### Verified Career Guidance: ${citations[0]?.title || 'CareerPilot Knowledge Base'}

${res.passages[0].content.slice(0, 450)}

### Key Recommendations
• Ground your preparation in verified engineering benchmarks [Source: ${citations[0]?.title}].
• Build projects that measurably prove proficiency under realistic production constraints.`;
    } else {
      answer = `Based on the verified career knowledge base, I do not have sufficient information about "${message}".

I can help you analyze your resume, discover matching jobs, evaluate skill gaps, or build career roadmaps for roles like Backend, Frontend, Full-Stack, and DevOps.`;
    }

    suggestedFollowUps = [
      'What are the core technical requirements for a Backend Engineer?',
      'How do I format my resume for Applicant Tracking Systems (ATS)?',
      'What is the STAR method for technical interviews?',
    ];
  }

  return {
    answer,
    toolsUsed,
    citations,
    clarificationNeeded,
    suggestedFollowUps,
    isAgentic: true,
    model: 'deterministic-career-planner',
  };
}

/**
 * Execute the autonomous AI career agent
 *
 * @param {Object} params
 * @param {string} params.message - Candidate message
 * @param {Object} params.user - Authenticated user context
 * @param {Array<Object>} [params.conversationHistory=[]] - Optional previous chat messages
 * @param {Object} [params.options]
 * @param {number} [params.options.maxIterations=5]
 * @param {import('../rag/chromaVectorStore.js').ChromaVectorStore} [params.options.customStore]
 * @returns {Promise<Object>}
 */
export async function executeCareerAgent({
  message,
  user,
  conversationHistory = [],
  options = {},
}) {
  const { maxIterations = 5, customStore } = options;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Message is required for the Career Agent.');
  }

  const trimmedMessage = message.trim();

  // Initialize all tools bound to the authenticated user context
  const { toolsList, toolsMap } = initializeAgentTools(user, { customStore });

  // Fallback if Gemini is not configured
  if (!isGeminiConfigured()) {
    const intent = classifyUserIntent(trimmedMessage, user);
    return await executeDeterministicPlan({
      message: trimmedMessage,
      user,
      toolsMap,
      intent,
    });
  }

  // Live LangChain Agent Execution Loop with Gemini
  try {
    const model = getGeminiModel({ temperature: 0.1 });
    const modelWithTools = model.bindTools(toolsList);

    const messages = [
      new SystemMessage(
        `${SYSTEM_PROMPT}\n\nCURRENT USER PROFILE:\nName: ${user.name || 'Candidate'}\nTarget Role: ${user.targetJobRole || 'Software Engineer'}\nSkills: ${(user.skills || []).join(', ') || 'Not specified'}`
      ),
      ...conversationHistory.map((m) =>
        m.sender === 'user' ? new HumanMessage(m.text) : new AIMessage(m.text)
      ),
      new HumanMessage(trimmedMessage),
    ];

    const toolsUsed = [];
    const citations = [];
    let iterations = 0;
    let finalAnswer = '';

    while (iterations < maxIterations) {
      iterations++;
      const response = await modelWithTools.invoke(messages);
      messages.push(response);

      // Check if model called tools
      if (response.tool_calls && response.tool_calls.length > 0) {
        for (const call of response.tool_calls) {
          const toolInstance = toolsMap.get(call.name);

          let toolOutput = '';
          if (toolInstance) {
            try {
              toolOutput = await toolInstance.invoke(call.args);
              toolsUsed.push({
                tool: call.name,
                input: call.args,
                summary: `Executed ${call.name} successfully.`,
              });

              // Extract citations if tool was rag_retriever
              if (call.name === 'rag_retriever') {
                try {
                  const parsed = JSON.parse(toolOutput);
                  if (parsed.passages) {
                    for (const p of parsed.passages) {
                      citations.push({
                        title: p.title,
                        source: p.source,
                        snippet: p.content.slice(0, 160) + '...',
                        docType: p.docType,
                      });
                    }
                  }
                } catch {
                  // Non-JSON output
                }
              }
            } catch (toolExecErr) {
              toolOutput = JSON.stringify({ error: toolExecErr.message });
              toolsUsed.push({
                tool: call.name,
                input: call.args,
                summary: `Tool error: ${toolExecErr.message}`,
              });
            }
          } else {
            toolOutput = JSON.stringify({ error: `Tool ${call.name} not found.` });
          }

          messages.push(
            new ToolMessage({
              tool_call_id: call.id || `call_${Date.now()}`,
              content: typeof toolOutput === 'string' ? toolOutput : JSON.stringify(toolOutput),
            })
          );
        }
      } else {
        // Model generated final response text
        finalAnswer = response.content || '';
        break;
      }
    }

    if (!finalAnswer && messages[messages.length - 1]?.content) {
      finalAnswer = messages[messages.length - 1].content;
    }

    return {
      answer: finalAnswer,
      toolsUsed,
      citations,
      clarificationNeeded: false,
      suggestedFollowUps: [
        'What skills should I prioritize learning first?',
        'Can you show me matching job opportunities?',
        'Help me prepare for technical interviews for this role',
      ],
      isAgentic: true,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    };
  } catch (err) {
    console.warn(`[Agent Execution Exception]: ${err.message}. Falling back to deterministic planner.`);
    const intent = classifyUserIntent(trimmedMessage, user);
    return await executeDeterministicPlan({
      message: trimmedMessage,
      user,
      toolsMap,
      intent,
    });
  }
}
