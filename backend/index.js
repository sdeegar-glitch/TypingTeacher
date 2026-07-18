import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Trust the first proxy (Render)
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors());
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  initCronJobs();
});
