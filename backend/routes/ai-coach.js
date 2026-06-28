/**
 * AI Coach route — uses Gemini to analyze recent typing sessions
 * and return personalized weakness analysis + custom practice text.
 *
 * POST /api/ai/analyze
 * Body: { sessions: [ { net_wpm, accuracy, errors, error_keys?, duration } ] }
 * Returns: { analysis, practiceText, weakKeys, suggestions }
 */
import express from 'express';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many AI requests. Please wait a minute.' },
});

// Groq (OpenAI-compatible) powers both the one-shot coach analysis and the tutor.
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

async function groqChat(systemPrompt, userPrompt, maxTokens = 800) {
  const r = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.6,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Groq ${r.status}: ${t.slice(0, 200)}`);
  }
  const data = await r.json();
  return (data?.choices?.[0]?.message?.content || '').trim();
}

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

    const text = await groqChat(
      'You are an expert typing coach. You always respond with valid JSON only.',
      prompt,
      700,
    );

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

// ─────────────────────────────────────────────────────────────────────────
// AI Tutor — one-shot personalized improvement plan, powered by Groq.
// POST /api/ai/tutor
// Body: { stats: { avgWpm, bestWpm, avgAccuracy, totalSessions, trend, hindiShare, goal? } }
// Returns: { level, analysis, strengths, weakAreas, targetWpm, plan[], dailyRoutine[], practiceText, encouragement }
// ─────────────────────────────────────────────────────────────────────────
function tutorFallback(avgWpm, bestWpm, avgAccuracy) {
  return {
    avgWpm, bestWpm, avgAccuracy, trend: 'stable',
    level: avgWpm >= 60 ? 'Advanced' : avgWpm >= 35 ? 'Intermediate' : 'Beginner',
    analysis: 'Keep practicing consistently to build speed. Prioritise accuracy first — clean, deliberate typing makes lasting speed gains far better than rushing.',
    strengths: ['Showing up to practice', 'Willingness to improve'],
    weakAreas: ['Finger placement / home row', 'Common letter combinations', 'Accuracy under speed'],
    targetWpm: Math.max(30, Math.round((avgWpm || 25) + 10)),
    plan: [
      { title: 'Lock in the home row', detail: 'Master ASDF JKL; without looking. This is the foundation every fast typist relies on.' },
      { title: 'Accuracy before speed', detail: 'Aim for 95%+ accuracy at a comfortable pace. Speed follows accuracy, never the other way around.' },
      { title: 'Daily timed tests', detail: 'Take one 1-minute test daily and note your 3 slowest keys, then drill them.' },
      { title: 'Push your ceiling', detail: 'Once accurate, do short bursts slightly faster than comfortable to raise your top speed.' },
    ],
    dailyRoutine: ['5 min home-row warm-up', '10 min common-words practice', '1 min timed test + review slow keys'],
    practiceText: 'the quick brown fox jumps over the lazy dog while five wizards quietly mixed a jar of toxic liquid for the big experiment.',
    encouragement: 'Every expert typist started exactly where you are — consistency is your superpower.',
    model: GROQ_MODEL,
  };
}

router.post('/tutor', aiLimiter, async (req, res) => {
  const s = (req.body && req.body.stats) || {};
  const avgWpm = Math.round(Number(s.avgWpm) || 0);
  const bestWpm = Math.round(Number(s.bestWpm) || 0);
  const avgAccuracy = Math.round(Number(s.avgAccuracy) || 0);
  const totalSessions = Math.round(Number(s.totalSessions) || 0);
  const trend = ['improving', 'declining', 'stable'].includes(s.trend) ? s.trend : 'stable';
  const hindiShare = Math.max(0, Math.min(100, Math.round(Number(s.hindiShare) || 0)));
  const goal = typeof s.goal === 'string' ? s.goal.slice(0, 120) : '';

  try {
    if (!process.env.GROQ_API_KEY) return res.json(tutorFallback(avgWpm, bestWpm, avgAccuracy));

    const prompt = `Create a personalized typing-improvement plan for this student.

Student data:
- Average speed: ${avgWpm} WPM
- Best speed: ${bestWpm} WPM
- Average accuracy: ${avgAccuracy}%
- Practice sessions completed: ${totalSessions}
- Recent trend: ${trend}
- Share of practice that is Hindi typing: ${hindiShare}%
${goal ? `- Student's stated goal: ${goal}` : '- No specific goal stated (assume general speed + accuracy improvement, and mention govt-exam readiness if relevant).'}

Context: FastTypingLab users often prepare for Indian government typing exams (SSC CHSL/CGL need ~35 WPM English, CPCT/UP Police Hindi need ~25-30 WPM). Hindi layouts are Mangal/INSCRIPT (Unicode) and Kruti Dev.

Respond with ONLY raw JSON (no markdown fences) with exactly these fields:
{
  "level": "Beginner | Intermediate | Advanced",
  "analysis": "2-3 sentence personalized assessment of where they are and the single biggest thing to fix",
  "strengths": ["2-3 genuine strengths based on the data"],
  "weakAreas": ["2-4 specific weaknesses to work on"],
  "targetWpm": <realistic next WPM goal as a plain number>,
  "plan": [{"title": "short step title", "detail": "1-2 sentences: exactly what to do and why"}],
  "dailyRoutine": ["3-4 concrete daily steps, each with a time in minutes"],
  "practiceText": "a single coherent 40-60 word English practice passage targeting their weak areas (no random word lists)",
  "encouragement": "one short motivating sentence tailored to their level"
}
Make "plan" exactly 4 progressive steps.`;

    const text = await groqChat(
      'You are an expert, encouraging typing tutor. You always respond with valid JSON only.',
      prompt,
      900,
    );
    const cleaned = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    res.json({ avgWpm, bestWpm, avgAccuracy, trend, model: GROQ_MODEL, ...parsed });
  } catch (err) {
    console.error('[AI Tutor] Error:', err.message);
    res.json(tutorFallback(avgWpm, bestWpm, avgAccuracy));
  }
});

export default router;
