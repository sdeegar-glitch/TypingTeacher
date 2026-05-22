import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Keyboard, Zap, Activity, ShieldCheck, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [textToType] = useState("The quick brown fox jumps over the lazy dog");
  const [typedText, setTypedText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Auto-typing animation for the hero section
  useEffect(() => {
    let i = 0;
    let isDeleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    const type = () => {
      if (!isDeleting) {
        if (i <= textToType.length) {
          setTypedText(textToType.substring(0, i));
          i++;
          timeout = setTimeout(type, Math.random() * 50 + 50); // Human-like typing speed
        } else {
          isDeleting = true;
          timeout = setTimeout(type, 3000); // Wait before deleting
        }
      } else {
        if (i >= 0) {
          setTypedText(textToType.substring(0, i));
          i--;
          timeout = setTimeout(type, 30); // Fast delete
        } else {
          isDeleting = false;
          timeout = setTimeout(type, 500); // Pause before re-typing
        }
      }
    };

    timeout = setTimeout(type, 1000);
    return () => clearTimeout(timeout);
  }, [textToType]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0f0f11] text-[#111827] dark:text-[#f9fafb] font-sans selection:bg-indigo-500/30">
      
      {/* SECTION 1: Learn Typing (Hero) */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8 border border-indigo-100 dark:border-indigo-500/20">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              New: AI-Powered Lessons
            </div>
            
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
              Learn <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]">
                Typing.
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-light">
              Master touch typing from scratch with structured, interactive lessons designed to build muscle memory effortlessly.
            </p>
            
            <Link 
              to="/learn" 
              className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300"
            >
              Start Learning
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <div className="mt-12 flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> No ads
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" /> Real-time feedback
              </div>
            </div>
          </div>

          {/* Animated Keyboard/Typing Visual */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 rounded-[2rem] border border-white/20 dark:border-white/5 backdrop-blur-3xl transform rotate-3 scale-105 transition-transform duration-700 hover:rotate-0 hover:scale-100"></div>
            <div className="bg-white dark:bg-[#1a1b1e] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-2xl relative z-10">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                </div>
                <Keyboard className="text-slate-400 w-5 h-5" />
              </div>
              
              <div className="font-mono text-xl md:text-2xl leading-relaxed text-slate-400 min-h-[120px]">
                <span className="text-[#111827] dark:text-[#f9fafb] font-medium">{typedText}</span>
                <span className={`inline-block w-3 h-6 ml-1 -mb-1 bg-[#6366f1] ${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}></span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: Test Your Typing Speed */}
      <section className="py-24 bg-white dark:bg-[#151619] border-t border-slate-100 dark:border-white/5">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            
            <div className="w-16 h-16 mx-auto bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 rotate-3">
              <Zap className="w-8 h-8 text-[#10b981]" />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Test Your Typing Speed
            </h2>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto font-light">
              Measure your Words Per Minute (WPM) and accuracy in real-time with AI-curated editorial content. Track your progress daily.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/tests" 
                className="group inline-flex items-center justify-center gap-3 bg-transparent border-2 border-[#111827] dark:border-[#f9fafb] text-[#111827] dark:text-[#f9fafb] hover:bg-[#111827] hover:text-white dark:hover:bg-[#f9fafb] dark:hover:text-[#111827] px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300"
              >
                Take Test
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Minimalist Live Stats Preview */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { label: 'Avg Speed', value: '65 WPM' },
                { label: 'Accuracy', value: '98.5%' },
                { label: 'Tests Taken', value: '142k+' },
                { label: 'Users', value: '25k+' }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-white/5">
                  <div className="text-3xl font-black mb-1">{stat.value}</div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
