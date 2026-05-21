import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors());
app.use(express.json());

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

app.use('/tests', testsRoutes);
app.use('/test_sessions', testSessionsRoutes);
app.use('/auth', authRoutes);
app.use('/leaderboard', leaderboardRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
