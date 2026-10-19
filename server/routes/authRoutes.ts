import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.ts';
import { Profile } from '../models/Profile.ts';
import { Roadmap } from '../models/Roadmap.ts';
import { TimelineEvent } from '../models/TimelineEvent.ts';
import { isMongoDBConnected, getMongoDBError } from '../db.ts';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();
const getJwtSecret = () => process.env.JWT_SECRET || 'career_guidance_jwt_secret_default_2026';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory fallback for local demo mode if MongoDB Atlas has not been configured yet
const localDemoUsers: Map<string, { id: string; name: string; email: string; passwordHash: string; role: 'candidate' | 'admin' }> = new Map([
  [
    'candidate@example.com',
    {
      id: 'usr-demo-1',
      name: 'Alex Mercer',
      email: 'candidate@example.com',
      passwordHash: bcrypt.hashSync('demo1234', 10),
      role: 'candidate',
    },
  ],
]);

function generateToken(user: { id: string; email: string; name: string; role: string }) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

// 1. REGISTER: POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, target_career = 'Full Stack Developer' } = req.body;

    // Validate inputs
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'MissingName',
        message: 'Full name is required.',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'MissingEmail',
        message: 'Email address is required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'InvalidEmail',
        message: 'Please provide a valid email address.',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'MissingPassword',
        message: 'Password is required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'PasswordTooShort',
        message: 'Password must be at least 6 characters long.',
      });
    }

    const trimmedName = name.trim();

    // Check MongoDB connection status
    if (!isMongoDBConnected()) {
      // Check if MongoDB is disconnected / unavailable
      const dbErr = getMongoDBError();
      console.warn(`[Register] MongoDB not connected: ${dbErr}`);

      // If database is not connected, check if demo fallback is used or inform user
      // Provide clean error message as required by Section 9
      if (process.env.NODE_ENV === 'production' && !dbErr?.includes('placeholder')) {
        return res.status(503).json({
          success: false,
          error: 'DatabaseUnavailable',
          message: 'Database connection is unavailable. Please check MongoDB Atlas connection.',
        });
      }

      // In development fallback:
      if (localDemoUsers.has(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          error: 'UserExists',
          message: 'An account with this email address already exists. Please sign in.',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const fallbackId = `usr-${Date.now()}`;

      localDemoUsers.set(normalizedEmail, {
        id: fallbackId,
        name: trimmedName,
        email: normalizedEmail,
        passwordHash,
        role: 'candidate',
      });

      const token = generateToken({
        id: fallbackId,
        email: normalizedEmail,
        name: trimmedName,
        role: 'candidate',
      });

      return res.status(201).json({
        success: true,
        message: 'Account created successfully (local fallback).',
        token,
        user: {
          id: fallbackId,
          name: trimmedName,
          email: normalizedEmail,
          role: 'candidate',
        },
      });
    }

    // --- MONGODB PERSISTENT REGISTRATION ---
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'UserExists',
        message: 'An account with this email address already exists. Please sign in.',
      });
    }

    // Secure password hashing with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 1. Create User in MongoDB
    const newUser = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
      role: 'candidate',
    });

    const userId = newUser._id.toString();

    // 2. Create Candidate Profile in MongoDB
    await Profile.create({
      userId,
      name: trimmedName,
      email: normalizedEmail,
      target_career,
      education_level: 'Undergraduate Computer Science',
      institution: 'University Institute of Technology',
      cgpa: 8.0,
      certifications_count: 0,
      skills: {
        javascript: 7,
        react: 6,
        nodejs: 6,
        sql: 6,
        mongodb: 6,
        python: 5,
        git: 6,
      },
    });

    // 3. Create Initial Roadmap in MongoDB
    await Roadmap.create({
      userId,
      target_career,
      milestones: [
        {
          id: 'milestone-1',
          phase: 'PHASE 1',
          title: `Foundations of ${target_career}`,
          objective: 'Establish core programming, architecture, and toolchain fundamentals.',
          skills: ['Core Architecture', 'Version Control'],
          skill_ids: ['architecture', 'git'],
          prerequisites: [],
          estimated_hours: 30,
          learning_resources: [],
          task: {
            title: 'Initial Milestone Project',
            description: 'Set up development workspace and build foundational module.',
            deliverables: ['GitHub Repository', 'Initial Codebase'],
          },
          status: 'In Progress',
        },
      ],
    });

    // 4. Create Initial Timeline Event in MongoDB
    await TimelineEvent.create({
      userId,
      type: 'profile_created',
      title: 'Account Registered in MongoDB',
      description: `User ${trimmedName} registered with target career: ${target_career}.`,
      date: new Date().toISOString().slice(0, 10),
    });

    const token = generateToken({
      id: userId,
      email: normalizedEmail,
      name: trimmedName,
      role: 'candidate',
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully in MongoDB.',
      token,
      user: {
        id: userId,
        name: trimmedName,
        email: normalizedEmail,
        role: 'candidate',
      },
    });
  } catch (err: any) {
    console.error('[Register Error]', err);
    return res.status(500).json({
      success: false,
      error: 'RegistrationFailed',
      message: 'Unable to connect to the server. Please try again.',
    });
  }
});

// 2. LOGIN: POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Distinct Error Handling according to requirement #9
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'MissingEmail',
        message: 'Please enter your email address.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'InvalidEmail',
        message: 'Please provide a valid email address.',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'MissingPassword',
        message: 'Please enter your password.',
      });
    }

    // --- CASE A: MONGODB IS CONNECTED ---
    if (isMongoDBConnected()) {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'UserNotFound',
          message: 'Invalid email or password.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'IncorrectPassword',
          message: 'Invalid email or password.',
        });
      }

      const token = generateToken({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return res.json({
        success: true,
        message: 'Authentication successful.',
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // --- CASE B: MONGODB IS UNAVAILABLE ---
    // Check fallback user store (e.g. for demo credentials)
    const fallback = localDemoUsers.get(normalizedEmail);
    if (fallback) {
      const isMatch = await bcrypt.compare(password, fallback.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'IncorrectPassword',
          message: 'Invalid email or password.',
        });
      }

      const token = generateToken({
        id: fallback.id,
        email: fallback.email,
        name: fallback.name,
        role: fallback.role,
      });

      return res.json({
        success: true,
        message: 'Authentication successful.',
        token,
        user: {
          id: fallback.id,
          name: fallback.name,
          email: fallback.email,
          role: fallback.role,
        },
      });
    }

    // If MongoDB is not connected and user is not in fallback:
    const dbErr = getMongoDBError();
    console.warn(`[Login] MongoDB unavailable during login for ${normalizedEmail}: ${dbErr}`);

    return res.status(503).json({
      success: false,
      error: 'DatabaseUnavailable',
      message: 'Database connection is unavailable. Please verify MongoDB Atlas connection.',
    });
  } catch (err: any) {
    console.error('[Login Server Error]', err);
    return res.status(500).json({
      success: false,
      error: 'AuthenticationServerError',
      message: 'Unable to connect to the server. Please try again.',
    });
  }
});

// 3. GET CURRENT USER: GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (isMongoDBConnected() && req.user?.id) {
      const user = await User.findById(req.user.id).select('-passwordHash');
      if (user) {
        return res.json({
          success: true,
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }
    }

    return res.json({
      success: true,
      user: req.user,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'ServerError',
      message: 'Unable to fetch user profile.',
    });
  }
});

// 4. LOGOUT: POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

export default router;
