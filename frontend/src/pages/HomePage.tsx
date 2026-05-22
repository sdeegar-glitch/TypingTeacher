import { Link } from 'react-router-dom';
import { Keyboard, Zap, Activity, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-80px)] lg:h-[calc(100dvh-80px)] overflow-hidden relative bg-[#f8fafc] dark:bg-[#09090b] text-[#09090b] dark:text-[#fafafa] font-sans selection:bg-indigo-500/30">
      
      {/* Background Soft Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 w-full max-w-6xl py-6 flex flex-col items-center">
        
        {/* Modern Minimal Hero Section */}
        <div className="text-center mb-10 lg:mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200/50 dark:border-white/10 text-sm font-medium mb-8 text-slate-600 dark:text-slate-300 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Typing Environment Ready
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.1]">
            Master typing with lessons and speed tests designed for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-sky-500">real progress.</span>
          </h1>
        </div>

        {/* Two Glassmorphism SaaS Cards */}
        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto w-full">
          
          {/* Card 1: Learn Typing */}
          <div className="group relative bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-3xl p-8 hover:border-indigo-500/30 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
              <Keyboard className="w-6 h-6" />
            </div>
            
            <h2 className="text-2xl font-bold mb-3">Learn Typing</h2>
            <p className="text-slate-600 dark:text-slate-400 font-light leading-relaxed mb-10 flex-grow">
              Master touch typing from scratch with structured lessons.
            </p>

            <Link 
              to="/learn" 
              className="inline-flex items-center justify-between w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl text-base font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-300 group/btn"
            >
              <span>Start Learning</span>
              <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 2: Test Your Speed */}
          <div className="group relative bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-3xl p-8 hover:border-sky-500/30 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-sky-500/5 flex flex-col">
            <div className="w-12 h-12 bg-sky-50 dark:bg-sky-500/10 rounded-2xl flex items-center justify-center mb-6 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-6 h-6" />
            </div>
            
            <h2 className="text-2xl font-bold mb-3">Test Your Typing Speed</h2>
            <p className="text-slate-600 dark:text-slate-400 font-light leading-relaxed mb-10 flex-grow">
              Measure your WPM and accuracy in real time.
            </p>

            <Link 
              to="/tests" 
              className="inline-flex items-center justify-between w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-700 text-[#09090b] dark:text-white px-6 py-4 rounded-xl text-base font-semibold transition-all duration-300 group/btn"
            >
              <span>Take Test</span>
              <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>

        {/* Minimalist Stats Strip */}
        <div className="mt-12 lg:mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-indigo-500" />
            </div>
            140k+ tests taken
          </div>
          
          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-800"></div>
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-sky-500" />
            </div>
            Real-time WPM tracking
          </div>

          <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-800"></div>
          
          <div className="hidden md:flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-emerald-500" />
            </div>
            Beginner-friendly lessons
          </div>
        </div>

      </div>
    </div>
  );
}
