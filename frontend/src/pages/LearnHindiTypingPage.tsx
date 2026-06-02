import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, BookOpen, Languages, Trophy, Target, Clock, Zap } from 'lucide-react';

export default function LearnHindiTypingPage() {
  useEffect(() => {
    document.title = 'Learn Hindi Typing — Free Online Course | FastTypingLab';
  }, []);

  const MODULES = [
    { step: '01', title: 'Introduction to Hindi Keyboard Layouts', desc: 'Understand the difference between INSCRIPT, Remington Gail, and Kruti Dev. Choose the right one for your exam.', time: '15 min', icon: '🗺️', link: '/kruti-dev-typing' },
    { step: '02', title: 'Home Row — The Foundation', desc: 'Learn the home row keys for Hindi typing. Position your fingers correctly and build muscle memory.', time: '20 min', icon: '🏠', link: '/hindi-typing-test' },
    { step: '03', title: 'Vowels and Matra Practice', desc: 'Master Hindi vowels (स्वर) and their matra forms. These appear in almost every Hindi word.', time: '30 min', icon: 'अ', link: '/hindi-typing-test' },
    { step: '04', title: 'Common Hindi Words', desc: 'Practice the 200 most common Hindi words that appear in government exam passages.', time: '45 min', icon: '📝', link: '/hindi-typing-test' },
    { step: '05', title: 'Half Letters and Conjuncts', desc: 'Learn half letters (आधा अक्षर) and conjunct consonants like क्ष, त्र, ज्ञ.', time: '30 min', icon: '🔗', link: '/hindi-typing-test' },
    { step: '06', title: 'Full Passage Typing', desc: 'Practice complete Hindi paragraphs from government exam patterns. Build speed and accuracy together.', time: '60 min', icon: '📄', link: '/hindi-typing-test' },
    { step: '07', title: 'Timed Practice Tests', desc: 'Take 1-minute, 2-minute, and 5-minute timed tests. Track your WPM and accuracy progress.', time: '30 min', icon: '⏱️', link: '/hindi-typing-test' },
    { step: '08', title: 'Exam Simulation', desc: 'Simulate the actual exam environment with real exam-pattern passages and strict time limits.', time: '15 min', icon: '🏛️', link: '/exam/hindi-typing' },
  ];

  const TIPS = [
    { tip: 'Practice daily for at least 30 minutes', icon: '📅' },
    { tip: 'Focus on accuracy before speed — errors are costly in exams', icon: '🎯' },
    { tip: 'Learn matras first — they appear in every word', icon: 'ि' },
    { tip: 'Never look at the keyboard while typing', icon: '👁️' },
    { tip: 'Use the correct finger for each key — follow the layout chart', icon: '🖐️' },
    { tip: 'Track your WPM daily — progress motivates practice', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center gap-2 text-xs text-brand-muted mb-6">
          <Link to="/" className="hover:text-brand-primary">Home</Link><span>/</span>
          <span className="text-brand-text">Learn Hindi Typing</span>
        </div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
              <Languages className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-brand-text">Learn Hindi Typing</h1>
              <p className="text-brand-text-muted text-sm mt-0.5">Step-by-step free course for beginners to advanced</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Lessons', value: '8', icon: BookOpen, color: 'text-brand-primary' },
              { label: 'Duration', value: '4hrs', icon: Clock, color: 'text-brand-accent' },
              { label: 'Target WPM', value: '30+', icon: Zap, color: 'text-amber-500' },
              { label: 'Exams', value: 'SSC/CPCT', icon: Trophy, color: 'text-emerald-500' },
            ].map(s => (
              <div key={s.label} className="bg-brand-surface border border-brand-border rounded-xl p-3 text-center">
                <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
                <div className={`font-black text-lg ${s.color}`}>{s.value}</div>
                <div className="text-xs text-brand-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Module list */}
        <div className="space-y-3 mb-10">
          <h2 className="text-xl font-black text-brand-text mb-4">Course Modules</h2>
          {MODULES.map((mod, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={mod.link}
                className="group flex items-center gap-4 bg-brand-surface border border-brand-border hover:border-brand-primary/30 rounded-2xl p-4 transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-lg shrink-0">
                  {mod.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-brand-primary">Step {mod.step}</span>
                    <span className="text-xs text-brand-muted flex items-center gap-1"><Clock className="w-3 h-3" /> {mod.time}</span>
                  </div>
                  <h3 className="font-bold text-brand-text group-hover:text-brand-primary transition-colors">{mod.title}</h3>
                  <p className="text-brand-text-muted text-sm truncate">{mod.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-brand-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-8">
          <h2 className="font-black text-brand-text text-xl mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-brand-primary" /> Expert Tips</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {TIPS.map((t, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-brand-surface-2 rounded-xl">
                <span className="text-xl shrink-0">{t.icon}</span>
                <p className="text-brand-text-muted text-sm">{t.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 border border-brand-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-black text-brand-text text-lg mb-1">Start Practicing Now</h2>
            <p className="text-brand-text-muted text-sm">Jump directly into the Hindi typing test and start tracking your WPM.</p>
          </div>
          <Link to="/hindi-typing-test"
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20 shrink-0">
            <Languages className="w-4 h-4" /> Start Typing
          </Link>
        </div>

        {/* SEO text */}
        <div className="mt-8 text-sm text-brand-text-muted space-y-2">
          <h2 className="text-base font-bold text-brand-text">Learn Hindi Typing Online — Free</h2>
          <p>FastTypingLab provides a free, step-by-step Hindi typing course designed for SSC, CPCT, UP Police, court exam, and railway typing test preparation. Learn the INSCRIPT layout (built into Windows) or Kruti Dev layout for older exams. Our Hindi typing test uses Unicode Devanagari script and tracks your WPM, accuracy, and errors in real time.</p>
          <p>हिंदी टाइपिंग सीखें — SSC, CPCT, UP Police, न्यायालय और रेलवे टाइपिंग परीक्षाओं की तैयारी के लिए फ्री हिंदी टाइपिंग कोर्स।</p>
        </div>
      </div>
    </div>
  );
}
