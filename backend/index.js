import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Trust the first proxy (Nginx)
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
// Nginx does not add CORS headers for routes it proxies to this app (see the
// comment in the api.fasttypinglab.com Nginx config) -- this is the one and
// only place CORS is decided for everything under /api, /auth, /tests, etc.
//
// Allowed origins: the production site, the Vite dev server, and the Tauri
// desktop app's webview (whose origin varies by OS/Tauri version -- tauri://
// on Windows, https://tauri.localhost on some setups). Requests with no
// Origin header at all (curl, server-to-server, some non-browser HTTP
// clients) are also allowed -- CORS only governs browser-mediated requests,
// so there's nothing to enforce against a client that isn't a browser.
const ALLOWED_ORIGINS = [
  'https://fasttypinglab.com',
  'http://localhost:5173',
  'https://tauri.localhost',
];
app.use(cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.startsWith('tauri://')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
}));
// 2 MB ceiling so base64 avatar uploads (POST /api/me/avatar) fit; other
// endpoints send tiny JSON bodies well under this.
app.use(express.json({ limit: '2mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

import testsRoutes from './routes/tests.js';
import testSessionsRoutes from './routes/test_sessions.js';
import authRoutes from './routes/auth.js';
import leaderboardRoutes from './routes/leaderboard.js';
import aiCoachRoutes from './routes/ai-coach.js';
import certificatesRoutes from './routes/certificates.js';
import meRoutes from './routes/me.js';
import adminRoutes from './routes/admin.js';
import publicSettingsRoutes from './routes/publicSettings.js';
import visitorsRoutes from './routes/visitors.js';
import gameScoresRoutes from './routes/gameScores.js';
import progressRoutes from './routes/progress.js';
import { initCronJobs } from './cronService.js';

app.use('/tests', testsRoutes);
app.use('/api/tests', testsRoutes);
app.use('/test_sessions', testSessionsRoutes);
app.use('/auth', authRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/api/ai', aiCoachRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/me', meRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', publicSettingsRoutes);
app.use('/api/visitors', visitorsRoutes);
app.use('/api/game-scores', gameScoresRoutes);
app.use('/api/progress', progressRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  initCronJobs();
});
