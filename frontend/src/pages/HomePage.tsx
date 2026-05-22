import { Link } from 'react-router-dom';
import { Keyboard, Zap, ChevronRight, Activity } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-80px)] lg:h-[calc(100dvh-80px)] overflow-hidden relative bg-[#fafafa] dark:bg-[#0f0f11] text-[#111827] dark:text-[#f9fafb] font-sans selection:bg-indigo-500/30">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 w-full max-w-6xl py-8">
        
        {/* Centered Header */}
        <div className="text-center mb-10 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6 border border-indigo-100 dark:border-indigo-500/20">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Typing Environment Ready
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter mb-4 leading-tight">
            Master Typing. <br className="sm:hidden"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]">
              Elevate Your Speed.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-light max-w-2xl mx-auto">
            Choose your path. Build muscle memory from scratch or test your current speed with AI-curated editorial content.
          </p>
        </div>

        {/* Two Massive Decision Cards */}
        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          
          {/* Card 1: Learn */}
          <div className="group relative bg-white dark:bg-[#1a1b1e] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 lg:p-10 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
                <Keyboard className="w-7 h-7" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-3">Learn Typing</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 font-light leading-relaxed">
                Master touch typing from scratch with structured lessons designed to build muscle memory effortlessly.
              </p>
            </div>

            <Link 
              to="/learn" 
              className="relative z-10 inline-flex items-center justify-between w-full bg-[#111827] dark:bg-white text-white dark:text-[#111827] px-6 py-4 rounded-xl text-lg font-bold hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-colors duration-300"
            >
              <span>Start Learning</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 2: Test */}
          <div className="group relative bg-white dark:bg-[#1a1b1e] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 lg:p-10 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                <Zap className="w-7 h-7" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-3">Test Your Speed</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 font-light leading-relaxed">
                Measure your WPM and accuracy in real-time. Practice with dynamic, high-quality editorial texts.
              </p>
            </div>

            <Link 
              to="/tests" 
              className="relative z-10 inline-flex items-center justify-between w-full bg-transparent border-2 border-[#111827] dark:border-white text-[#111827] dark:text-white px-6 py-4 rounded-xl text-lg font-bold hover:bg-[#111827] dark:hover:bg-white hover:text-white dark:hover:text-[#111827] transition-colors duration-300"
            >
              <span>Take Test</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>

        {/* Minimalist Stats Footer */}
        <div className="mt-12 lg:mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            142k+ Tests Taken
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Real-time WPM Tracking
          </div>
        </div>

      </div>
    </div>
  );
}
