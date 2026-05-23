import { Link } from 'react-router-dom';
import { Keyboard, Zap, Activity, ChevronRight, BookOpen } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-start pt-12 lg:pt-20 pb-16 min-h-[calc(100vh-64px)] relative bg-[#f8fafc] dark:bg-[#09090b] text-[#09090b] dark:text-[#fafafa] font-sans selection:bg-indigo-500/30">
      
      {/* Background Soft Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 w-full max-w-6xl py-6 flex flex-col items-center">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTY1LCAxODAsIDI1MiwgMC4xKSIvPjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />

        {/* Modern Minimal Hero Section */}
        <div className="text-center mb-12 lg:mb-16 max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200/50 dark:border-white/10 text-sm font-medium mb-8 text-slate-600 dark:text-slate-300 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Typing Environment Ready
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.15]">
            Typing Teacher — <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-sky-500">Learn Typing and Test Your Speed</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
            Elevate your keyboard skills. Build muscle memory from scratch with interactive lessons, or measure your WPM and accuracy using dynamic, AI-generated editorial content.
          </p>
        </div>

        {/* Two Glassmorphism SaaS Cards */}
        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto w-full relative z-10">
          
          {/* Card 1: Learn Typing */}
          <div className="group relative bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-3xl p-8 hover:border-indigo-500/30 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col min-h-[320px]">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
              <Keyboard className="w-7 h-7" />
            </div>
            
            <h2 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">Learn Typing</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-light leading-relaxed mb-10 flex-grow">
              Master touch typing from the ground up with our structured, interactive curriculum. Start typing faster today.
            </p>

            <Link 
              to="/learn" 
              title="Start typing lessons"
              className="inline-flex items-center justify-between w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-300 group/btn"
            >
              <span>Start Learning</span>
              <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 2: Test Your Speed */}
          <div className="group relative bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-3xl p-8 hover:border-sky-500/30 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-sky-500/5 flex flex-col min-h-[320px]">
            <div className="w-14 h-14 bg-sky-50 dark:bg-sky-500/10 rounded-2xl flex items-center justify-center mb-6 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-7 h-7" />
            </div>
            
            <h2 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">Test Your Speed</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-light leading-relaxed mb-10 flex-grow">
              Measure your WPM and accuracy in real time with dynamic articles pulled from daily editorial news.
            </p>

            <Link 
              to="/tests" 
              title="Take speed test"
              className="inline-flex items-center justify-between w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-700 text-[#09090b] dark:text-white px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-300 group/btn"
            >
              <span>Take Speed Test</span>
              <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>

        {/* Minimalist Stats Strip */}
        <div className="mt-14 lg:mt-20 flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-indigo-500" />
            </div>
            140k+ tests taken
          </div>
          
          <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-sky-500" />
            </div>
            Real-time WPM tracking
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
          
          <div className="hidden md:flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-500" />
            </div>
            Beginner-friendly lessons
          </div>
        </div>

        {/* SEO Internal Links Footer */}
        <div className="mt-12 w-full max-w-4xl mx-auto flex justify-center gap-6 text-sm text-slate-400 relative z-10">
          <Link to="/learn" className="hover:text-indigo-500 transition-colors">Learn Typing</Link>
          <Link to="/tests" className="hover:text-indigo-500 transition-colors">Test Speed</Link>
          <a href="mailto:support@fasttypinglab.com" className="hover:text-indigo-500 transition-colors">Contact</a>
          <a href="#" className="hover:text-indigo-500 transition-colors">About Us</a>
        </div>

      </div>
    </div>
  );
}
