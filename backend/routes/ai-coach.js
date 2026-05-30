/**
 * AI Coach route — uses Gemini to analyze recent typing sessions
 * and return personalized weakness analysis + custom practice text.
 *
 * POST /api/ai/analyze
 * Body: { sessions: [ { net_wpm, accuracy, errors, error_keys?, duration } ] }
 * Returns: { analysis, practiceText, weakKeys, suggestions }
 */
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many AI requests. Please wait a minute.' },
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// POST /api/ai/analyze
router.post('/analyze', aiLimiter, async (req, res) => {
  try {
    const { sessions = [], userLevel = 'intermediate' } = req.body;

    if (!sessions.length) {
      return res.status(400).json({ error: 'No session data provided.' });
    }

    // Build summary statistics from sessions
    const avgWpm = Math.round(sessions.reduce((s, x) => s + (x.net_wpm || 0), 0) / sessions.length);
    const avgAccuracy = Math.round(sessions.reduce((s, x) => s + (x.accuracy || 0), 0) / sessions.length);
    const totalErrors = sessions.reduce((s, x) => s + (x.errors || 0), 0);
    const recentWpm = sessions.slice(-3).map(s => s.net_wpm || 0);
    const trend = recentWpm.length >= 2
      ? (recentWpm[recentWpm.length - 1] - recentWpm[0] > 0 ? 'improving' : 'declining')
      : 'stable';

    const prompt = `You are an expert typing coach analyzing a student's performance data.

Student Data:
- Average WPM: ${avgWpm}
- Average Accuracy: ${avgAccuracy}%
- Total errors in recent sessions: ${totalErrors}
- WPM trend: ${trend}
- Skill level: ${userLevel}
- Sessions analyzed: ${sessions.length}

Please respond with a JSON object (no markdown, just raw JSON) with exactly these fields:
{
  "analysis": "A personalized 2-3 sentence analysis of their typing performance and main issues",
  "weakAreas": ["2-4 specific weak areas e.g. 'Left-hand keys', 'Punctuation', 'Capital letters'"],
  "suggestions": ["3 specific, actionable tips to improve their speed and accuracy"],
  "practiceText": "A 50-60 word practice passage specifically designed to target their weak areas. Should be a coherent paragraph, not just random words.",
  "encouragement": "One motivational sentence tailored to their current level"
}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Parse JSON — strip possible markdown fences
    const cleaned = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    res.json({
      avgWpm,
      avgAccuracy,
      trend,
      ...parsed,
    });
  } catch (err) {
    console.error('[AI Coach] Error:', err.message);
    // Return a helpful fallback response if AI fails
    res.json({
      avgWpm: 0,
      avgAccuracy: 0,
      trend: 'stable',
      analysis: 'Keep practicing consistently to see your speed improve over time. Focus on accuracy before speed.',
      weakAreas: ['Finger placement', 'Common letter combinations'],
      suggestions: [
        'Practice the home row keys (ASDF JKL;) every day for 10 minutes',
        'Slow down and focus on accuracy — aim for 95%+ before increasing speed',
        'Use all 10 fingers and avoid looking at the keyboard while typing',
      ],
      practiceText: 'the quick brown fox jumps over the lazy dog. pack my box with five dozen liquor jugs. how vexingly quick daft zebras jump.',
      encouragement: 'Every expert was once a beginner — keep going!',
    });
  }
});

export default router;
