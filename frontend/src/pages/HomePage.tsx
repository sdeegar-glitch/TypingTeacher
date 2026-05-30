import { Link } from 'react-router-dom';
import { Keyboard, Zap, Activity, ChevronRight, BookOpen } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100dvh-64px)] overflow-hidden relative bg-brand-bg text-brand-text font-sans selection:bg-brand-primary/30">
      
      {/* Background Soft Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 w-full max-w-6xl py-6 flex flex-col items-center">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTY1LCAxODAsIDI1MiwgMC4xKSIvPjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />

        {/* Modern Minimal Hero Section */}
        <div className="text-center mb-6 lg:mb-8 max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-surface/60 backdrop-blur-md border border-brand-muted/20 text-sm font-medium mb-8 text-brand-muted shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
            </span>
            Typing Environment Ready
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 leading-[1.15] text-brand-text">
            Typing Teacher — <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Learn Typing and Test Your Speed</span>
          </h1>
          
          <p className="text-base sm:text-lg text-brand-muted font-light max-w-2xl mx-auto mb-6 leading-relaxed">
            Elevate your keyboard skills. Build muscle memory from scratch with interactive lessons, or measure your WPM and accuracy using dynamic, AI-generated editorial content.
          </p>
        </div>

        {/* Two Glassmorphism SaaS Cards */}
        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto w-full relative z-10">
          
          {/* Card 1: Learn Typing */}
          <div className="group relative bg-brand-surface/70 backdrop-blur-xl border border-brand-muted/10 rounded-3xl p-6 lg:p-8 hover:border-brand-primary/30 hover:bg-brand-surface transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-brand-primary/5 flex flex-col">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-4 text-brand-primary border border-brand-primary/20 group-hover:scale-110 transition-transform duration-300">
              <Keyboard className="w-6 h-6" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2 text-brand-text">Learn Typing</h2>
            <p className="text-brand-muted text-base font-light leading-relaxed mb-6 flex-grow">
              Master touch typing from the ground up with our structured, interactive curriculum. Start typing faster today.
            </p>

            <Link 
              to="/learn" 
              title="Start typing lessons"
              className="inline-flex items-center justify-between w-full bg-brand-primary hover:bg-brand-secondary text-white px-6 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-brand-primary/25 transition-all duration-300 group/btn"
            >
              <span>Start Learning</span>
              <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Card 2: Test Your Speed */}
          <div className="group relative bg-brand-surface/70 backdrop-blur-xl border border-brand-muted/10 rounded-3xl p-6 lg:p-8 hover:border-brand-secondary/30 hover:bg-brand-surface transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-brand-secondary/5 flex flex-col">
            <div className="w-12 h-12 bg-brand-secondary/10 rounded-2xl flex items-center justify-center mb-4 text-brand-secondary border border-brand-secondary/20 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-6 h-6" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2 text-brand-text">Test Your Speed</h2>
            <p className="text-brand-muted text-base font-light leading-relaxed mb-6 flex-grow">
              Measure your WPM and accuracy in real time with dynamic articles pulled from daily editorial news.
            </p>

            <Link 
              to="/tests" 
              title="Take speed test"
              className="inline-flex items-center justify-between w-full bg-brand-secondary hover:bg-brand-primary text-white px-6 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-brand-secondary/25 transition-all duration-300 group/btn"
            >
              <span>Take Speed Test</span>
              <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>

        {/* Minimalist Stats Strip */}
        <div className="mt-8 lg:mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-brand-muted font-medium relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-brand-primary" />
            </div>
            140k+ tests taken
          </div>
          
          <div className="hidden sm:block w-px h-8 bg-brand-muted/20"></div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-secondary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-brand-secondary" />
            </div>
            Real-time WPM tracking
          </div>

          <div className="hidden md:block w-px h-8 bg-brand-muted/20"></div>
          
          <div className="hidden md:flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-brand-accent" />
            </div>
            Beginner-friendly lessons
          </div>
        </div>

        {/* SEO Internal Links Footer */}
        <div className="mt-8 w-full max-w-4xl mx-auto flex justify-center gap-6 text-xs text-brand-muted relative z-10">
          <Link to="/learn" className="hover:text-brand-primary transition-colors">Learn Typing</Link>
          <Link to="/tests" className="hover:text-brand-primary transition-colors">Test Speed</Link>
          <a href="mailto:support@fasttypinglab.com" className="hover:text-brand-primary transition-colors">Contact</a>
          <a href="#" className="hover:text-brand-primary transition-colors">About Us</a>
        </div>

      </div>
    </div>
  );
}
