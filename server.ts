import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { connectMongoDB, isMongoDBConnected } from './server/db.ts';
import authRoutes from './server/routes/authRoutes.ts';
import userRoutes from './server/routes/userRoutes.ts';
import {
  isLLMAvailable,
  generateOnlineTestQuestions,
  generateInterviewQuestions,
  generateInterviewFeedback,
} from './server/llmService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const PYTHON_PORT = 5000;
const PYTHON_AI_URL = `http://127.0.0.1:${PYTHON_PORT}`;

let pythonProcess: ChildProcess | null = null;

function startPythonBackend() {
  const aiEngineDir = path.join(__dirname, 'ai-engine');
  console.log('[Server] Spawning Python FastAPI AI Engine on port', PYTHON_PORT);

  try {
    pythonProcess = spawn('python3', ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', `${PYTHON_PORT}`], {
      cwd: aiEngineDir,
      stdio: 'inherit',
    });

    pythonProcess.on('error', (err) => {
      console.error('[Server] Failed to start Python AI Engine:', err);
    });

    pythonProcess.on('exit', (code, signal) => {
      console.log(`[Server] Python AI Engine exited with code ${code}, signal ${signal}`);
    });
  } catch (e) {
    console.error('[Server] Exception spawning python:', e);
  }
}

// Start Python AI Engine
startPythonBackend();

// Connect to MongoDB Atlas (Async initialization)
connectMongoDB().catch((err) => {
  console.error('[Server] MongoDB startup error:', err);
});

process.on('exit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});
process.on('SIGINT', () => process.exit());
process.on('SIGTERM', () => process.exit());

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 1. Authentication Routes (Node + Express + MongoDB)
  // Completely isolated from Python & LLM
  app.use('/api/auth', authRoutes);

  // 2. User Persistent State Routes (MongoDB)
  app.use('/api', userRoutes);

  // 3. LLM Endpoints (Node + Express + Google GenAI SDK)
  app.get('/api/llm/status', (_req, res) => {
    res.json({
      available: isLLMAvailable(),
      model: 'gemini-3.8-flash',
      provider: 'Google Gen AI SDK (@google/genai)',
      fallback_active: !isLLMAvailable(),
    });
  });

  app.post('/api/llm/generate-test', async (req, res) => {
    try {
      const { career = 'Full Stack Developer', topic = 'Web Architecture', difficulty = 'Intermediate', count = 5 } = req.body;
      const questions = await generateOnlineTestQuestions({
        career,
        topic,
        difficulty,
        count: Math.min(15, Math.max(2, parseInt(count) || 5)),
      });
      res.json({
        career,
        topic,
        difficulty,
        count: questions.length,
        questions,
        source: isLLMAvailable() ? 'Dynamic LLM (gemini-3.8-flash)' : 'Structured Domain Benchmark Bank',
      });
    } catch (err: any) {
      console.error('[LLM Error] generate-test:', err);
      res.status(500).json({ error: 'Failed to generate test questions', detail: err.message });
    }
  });

  app.post('/api/llm/generate-interview-questions', async (req, res) => {
    try {
      const { career = 'Full Stack Developer', interviewType = 'Technical', difficulty = 'Intermediate', skills = [], skillGaps = [], count = 3 } = req.body;
      const questions = await generateInterviewQuestions({
        career,
        interviewType,
        difficulty,
        skills,
        skillGaps,
        count: Math.min(10, Math.max(1, parseInt(count) || 3)),
      });
      res.json({
        career,
        interviewType,
        questions,
        source: isLLMAvailable() ? 'Dynamic LLM (gemini-3.8-flash)' : 'Curated Interview Question Repository',
      });
    } catch (err: any) {
      console.error('[LLM Error] generate-interview-questions:', err);
      res.status(500).json({ error: 'Failed to generate interview questions', detail: err.message });
    }
  });

  app.post('/api/llm/evaluate-answer', async (req, res) => {
    try {
      const { question, userAnswer, category = 'Technical', career = 'Full Stack Developer' } = req.body;
      if (!question || !userAnswer) {
        return res.status(400).json({ error: 'Question and candidate answer are required' });
      }
      const feedback = await generateInterviewFeedback({
        question,
        userAnswer,
        category,
        career,
      });
      res.json(feedback);
    } catch (err: any) {
      console.error('[LLM Error] evaluate-answer:', err);
      res.status(500).json({ error: 'Failed to evaluate interview answer', detail: err.message });
    }
  });

  // Health check
  app.get('/health', async (_req, res) => {
    let pythonHealthy = false;
    try {
      const pyHealth = await fetch(`${PYTHON_AI_URL}/health`, { signal: AbortSignal.timeout(2000) });
      if (pyHealth.ok) {
        const body = await pyHealth.json();
        pythonHealthy = body.status === 'ok';
      }
    } catch {
      pythonHealthy = false;
    }

    res.json({
      status: 'ok',
      port: PORT,
      mongodb: isMongoDBConnected(),
      python_service: {
        available: pythonHealthy,
        url: PYTHON_AI_URL,
      },
      llm: isLLMAvailable(),
    });
  });

  // 4. Forward remaining AI/ML routes to Python FastAPI AI Engine
  app.all('/api/*', async (req, res) => {
    const targetUrl = `${PYTHON_AI_URL}${req.originalUrl}`;

    try {
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value && key.toLowerCase() !== 'host' && key.toLowerCase() !== 'content-length') {
          if (Array.isArray(value)) {
            value.forEach((v) => headers.append(key, v));
          } else {
            headers.set(key, value);
          }
        }
      }

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
      };

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          headers.set('content-type', 'application/json');
          fetchOptions.body = JSON.stringify(req.body);
        } else {
          // Stream raw body for multipart uploads (PDF/CSV)
          fetchOptions.body = req as any;
          (fetchOptions as any).duplex = 'half';
        }
      }

      const response = await fetch(targetUrl, fetchOptions);

      res.status(response.status);
      response.headers.forEach((val, key) => {
        if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, val);
        }
      });

      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (err: any) {
      console.error('[AI Engine Proxy Error]', err?.message || err);
      res.status(502).json({
        error: 'AIEngineUnavailable',
        detail: 'The custom Python AI/ML backend is initializing or processing. Please try again.',
      });
    }
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Full-Stack App listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Startup error:', err);
});
