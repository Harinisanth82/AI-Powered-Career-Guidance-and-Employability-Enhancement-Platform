import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || '';

let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error('[LLM Service] Failed to initialize GoogleGenAI client:', err);
  }
}

export function isLLMAvailable(): boolean {
  return !!aiClient;
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: string;
  topic: string;
}

export async function generateOnlineTestQuestions(params: {
  career: string;
  topic: string;
  difficulty: string;
  count: number;
}): Promise<GeneratedQuestion[]> {
  const { career, topic, difficulty, count } = params;

  if (aiClient) {
    try {
      const prompt = `You are a senior technical interviewer and assessment designer for ${career}.
Generate exactly ${count} multiple-choice test questions on the topic "${topic}" at "${difficulty}" difficulty level.
Return ONLY valid JSON matching this schema:
{
  "questions": [
    {
      "id": "q-1",
      "question": "Clear technical question text",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correct_answer": "A",
      "explanation": "Detailed technical explanation of why this answer is correct and others are flawed.",
      "difficulty": "${difficulty}",
      "topic": "${topic}"
    }
  ]
}
Do NOT include markdown backticks or commentary outside the JSON.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text || '';
      const cleanJson = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.questions && Array.isArray(parsed.questions)) {
        return parsed.questions.map((q: any, idx: number) => ({
          ...q,
          id: `gen-q-${idx + 1}`
        }));
      }
    } catch (err) {
      console.warn('[LLM Service] Gemini generation failed or key error, utilizing structured fallback:', err);
    }
  }

  // High-fidelity fallback question bank if key is not set or network error
  return getFallbackTestQuestions(career, topic, difficulty, count);
}

export async function generateInterviewQuestions(params: {
  career: string;
  interviewType: string;
  difficulty: string;
  skills?: string[];
  skillGaps?: string[];
  count: number;
}): Promise<any[]> {
  const { career, interviewType, difficulty, skills = [], skillGaps = [], count } = params;

  if (aiClient) {
    try {
      const prompt = `You are an executive engineering hiring lead for ${career}.
Generate ${count} realistic, challenging interview questions tailored to:
- Career Track: ${career}
- Interview Category: ${interviewType} (Technical, Behavioral, HR, Scenario)
- Difficulty: ${difficulty}
- Candidate Focus Skills: ${skills.join(', ') || 'Core competencies'}
- Candidate Gap Areas to Probe: ${skillGaps.join(', ') || 'Architecture & Design'}

Return ONLY valid JSON with this format:
{
  "questions": [
    {
      "id": "iq-1",
      "career": "${career}",
      "category": "${interviewType}",
      "difficulty": "${difficulty}",
      "question": "Question text",
      "expected_concepts": ["concept1", "concept2", "concept3"],
      "sample_reference_answer": "Strong reference answer outlining technical trade-offs or STAR methodology.",
      "evaluation_criteria": {
        "technical": "Criteria for technical knowledge",
        "structure": "Criteria for answer structure"
      }
    }
  ]
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text || '';
      const cleanJson = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.questions && Array.isArray(parsed.questions)) {
        return parsed.questions;
      }
    } catch (err) {
      console.warn('[LLM Service] Gemini interview question generation failed, using curated bank:', err);
    }
  }

  return getFallbackInterviewQuestions(career, interviewType, difficulty, count);
}

export async function generateInterviewFeedback(params: {
  question: string;
  userAnswer: string;
  category: string;
  career: string;
}): Promise<{
  what_you_did_well: string[];
  what_was_missing: string[];
  what_to_improve: string[];
  suggested_better_approach: string;
}> {
  const { question, userAnswer, category, career } = params;

  if (aiClient) {
    try {
      const prompt = `You are evaluating a candidate interview response.
Question: "${question}"
Category: ${category}
Role: ${career}
Candidate Answer: "${userAnswer}"

Provide objective, constructive qualitative evaluation.
Return ONLY valid JSON:
{
  "what_you_did_well": ["Strong specific point 1", "Strong point 2"],
  "what_was_missing": ["Missing element 1", "Missing element 2"],
  "what_to_improve": ["Actionable improvement 1", "Actionable improvement 2"],
  "suggested_better_approach": "A concise model structure the candidate should adopt."
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text || '';
      const cleanJson = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('[LLM Service] Qualitative feedback generation failed, using rubric heuristics:', err);
    }
  }

  // Heuristic feedback fallback
  const wordCount = userAnswer.trim().split(/\s+/).length;
  return {
    what_you_did_well: [
      wordCount >= 30 ? "Addressed the core question with sufficient detail" : "Direct response to the prompt",
      "Recognized essential domain terminology and context"
    ],
    what_was_missing: [
      category === 'Behavioral' 
        ? "Explicit articulation of quantifiable Results (the 'R' in the STAR framework)"
        : "Concrete architectural trade-offs and edge-case handling"
    ],
    what_to_improve: [
      "Include explicit real-world system examples and measurable metrics",
      "Structure the explanation with clear logical transitions"
    ],
    suggested_better_approach: category === 'Behavioral'
      ? "Frame your answer as: Situation (context) -> Task (your goal) -> Action (exact technical decisions) -> Result (measurable impact, e.g. 40% latency reduction)."
      : "Start with high-level definition, explain low-level mechanism, and conclude with performance/scaling trade-offs."
  };
}

// Deterministic fallback question banks
function getFallbackTestQuestions(career: string, topic: string, difficulty: string, count: number): GeneratedQuestion[] {
  const bank: Record<string, GeneratedQuestion[]> = {
    'Web Development': [
      {
        id: 'q-fb-1',
        question: 'What happens when a JavaScript asynchronous Promise resolves inside a microtask queue?',
        options: {
          A: 'It executes immediately after the current call stack clears, before macrotasks',
          B: 'It executes in a new web worker thread synchronously',
          C: 'It waits until all setTimeout callbacks in the macrotask queue finish',
          D: 'It blocks the DOM rendering thread indefinitely'
        },
        correct_answer: 'A',
        explanation: 'Microtasks (Promises, queueMicrotask) take strict priority over macrotasks (setTimeout, setInterval). The event loop exhausts all queued microtasks as soon as the synchronous call stack empties.',
        difficulty: 'Intermediate',
        topic: 'JavaScript Runtime'
      },
      {
        id: 'q-fb-2',
        question: 'In React, why must array list elements have a stable and unique key prop?',
        options: {
          A: 'To automatically apply CSS styles to each list item',
          B: 'To help React\'s reconciliation diffing algorithm identify which items changed, moved, or were removed',
          C: 'To bind onClick event handlers to the window object',
          D: 'To convert JSX elements into native HTML canvas elements'
        },
        correct_answer: 'B',
        explanation: 'Keys allow React to preserve identity across re-renders. Without stable keys, React falls back to index-based reordering which causes visual bugs and unneeded DOM recreations.',
        difficulty: 'Intermediate',
        topic: 'React Internals'
      },
      {
        id: 'q-fb-3',
        question: 'What is the primary architectural purpose of idempotency in REST API HTTP methods like PUT and DELETE?',
        options: {
          A: 'To ensure requests execute faster by skipping SSL handshakes',
          B: 'Making multiple identical requests produces the exact same server resource state as a single request',
          C: 'To allow clients to execute arbitrary database migrations remotely',
          D: 'To compress JSON payloads with gzip compression'
        },
        correct_answer: 'B',
        explanation: 'An HTTP method is idempotent if the side-effects of making N identical requests are the same as making 1 request. PUT and DELETE are idempotent; POST is not.',
        difficulty: 'Intermediate',
        topic: 'REST API Design'
      },
      {
        id: 'q-fb-4',
        question: 'What is the difference between SQL B-Tree indexes and Hash indexes in relational databases?',
        options: {
          A: 'B-Tree indexes only support boolean values; Hash indexes support strings',
          B: 'B-Tree indexes efficiently support range queries (<, >, BETWEEN), while Hash indexes only support exact equality (=)',
          C: 'Hash indexes require zero disk space; B-Tree indexes duplicate the entire table',
          D: 'B-Tree indexes cannot be used on primary keys'
        },
        correct_answer: 'B',
        explanation: 'B-Tree indexes maintain sorted order, allowing range scans and inequalities with O(log N) lookup. Hash indexes offer O(1) lookups for equality but cannot perform range searches.',
        difficulty: 'Advanced',
        topic: 'Database Optimization'
      },
      {
        id: 'q-fb-5',
        question: 'Which of the following describes Cross-Site Scripting (XSS) and its prevention?',
        options: {
          A: 'An attacker submits malicious SQL in query parameters; prevented with prepared statements',
          B: 'An attacker injects malicious client-side script into web pages viewed by other users; prevented by contextual output encoding and Content Security Policy (CSP)',
          C: 'An attacker floods server network ports with SYN packets; prevented by load balancers',
          D: 'An attacker listens to unencrypted WiFi traffic; prevented by HTTPS'
        },
        correct_answer: 'B',
        explanation: 'XSS exploits trust a browser has for content received from a server. Sanitizing input, contextual HTML/attribute escaping, and enforcing a strict CSP mitigates XSS.',
        difficulty: 'Intermediate',
        topic: 'Web Security'
      }
    ]
  };

  const selected = bank['Web Development'] || [];
  return selected.slice(0, count).map((q, idx) => ({
    ...q,
    id: `fb-q-${idx + 1}`,
    topic: topic || q.topic,
    difficulty: difficulty || q.difficulty
  }));
}

function getFallbackInterviewQuestions(career: string, interviewType: string, difficulty: string, count: number): any[] {
  const list = [
    {
      id: `iq-fb-1`,
      career,
      category: interviewType,
      difficulty,
      question: `Describe the end-to-end architecture of a high-throughput API endpoint in ${career}. How do you handle database connection pooling, caching, and graceful failure degradation?`,
      expected_concepts: ["connection pooling", "caching", "rate limiting", "circuit breaker", "idempotency"],
      sample_reference_answer: "I structure services with layered architecture: an ingress controller with rate limiting, in-memory Redis caching for hot reads, connection pools sized appropriately to database CPU cores, and circuit-breaker patterns to gracefully degrade to read-only replicas during high write contention.",
      evaluation_criteria: {
        technical: "Demonstrates practical knowledge of distributed caching and connection limits",
        structure: "Sequenced logical flow from ingress to database"
      }
    },
    {
      id: `iq-fb-2`,
      career,
      category: interviewType,
      difficulty,
      question: `Tell me about a time when you discovered a critical performance bottleneck or security flaw in production. Walk through your triage, root cause analysis, and resolution.`,
      expected_concepts: ["situation", "task", "action", "result", "observability", "profiling"],
      sample_reference_answer: "In our payment service, response latency spiked to 4 seconds during load. I used distributed tracing to pinpoint an N+1 query loop on an unindexed foreign key. I refactored the ORM query to use join prefetching and added a composite B-Tree index, reducing P99 latency to 85ms.",
      evaluation_criteria: {
        technical: "Evidence of profiling tools and systematic root-cause methodology",
        structure: "Clear STAR format"
      }
    }
  ];

  return list.slice(0, count);
}
