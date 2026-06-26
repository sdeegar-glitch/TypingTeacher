import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, ChevronRight, Rss } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { BLOG_POSTS } from '../data/blogPosts';

const CATEGORIES = ['All', 'Tips & Tricks', 'Government Exams', 'Learning', 'Productivity'];

export default function BlogPage() {
  useEffect(() => {
    document.title = 'Typing Blog — Tips, Guides & Exam Prep | FastTypingLab';
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-10 px-4 sm:px-6">
      <div className="max-w-[1600px] mx-auto">

        {/* Header */}
        <PageHeader
          icon={Rss}
          eyebrow="Blog"
          title="Typing Tips & Guides"
          subtitle="Expert articles on typing speed improvement, government exam preparation, keyboard shortcuts, and Hindi typing practice."
        />

        {/* Featured post */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
          <Link to={`/blog/${BLOG_POSTS[0].slug}`}
            className="group block bg-brand-surface border border-brand-border rounded-3xl overflow-hidden hover:border-brand-primary/30 hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-br from-brand-primary/20 to-brand-secondary/10 p-8 sm:p-10">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="text-5xl">{BLOG_POSTS[0].emoji}</div>
                <span className="text-xs bg-brand-primary/20 text-brand-primary px-3 py-1 rounded-full font-bold">{BLOG_POSTS[0].category}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-text mb-3 group-hover:text-brand-primary transition-colors">
                {BLOG_POSTS[0].title}
              </h2>
              <p className="text-brand-text-muted leading-relaxed mb-4">{BLOG_POSTS[0].metaDesc}</p>
              <div className="flex items-center gap-4 text-sm text-brand-muted">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {BLOG_POSTS[0].readTime} read</span>
                <span>{new Date(BLOG_POSTS[0].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="ml-auto flex items-center gap-1 text-brand-primary font-semibold">
                  Read Article <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Rest of posts grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {BLOG_POSTS.slice(1).map((post, i) => (
            <motion.div key={post.slug}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}>
              <Link to={`/blog/${post.slug}`}
                className="group flex flex-col h-full bg-brand-surface border border-brand-border rounded-2xl p-5 hover:border-brand-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="text-3xl">{post.emoji}</div>
                  <span className="text-[10px] bg-brand-surface-2 border border-brand-border text-brand-muted px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{post.category}</span>
                </div>
                <h2 className="text-base font-black text-brand-text mb-2 group-hover:text-brand-primary transition-colors line-clamp-2">{post.title}</h2>
                <p className="text-brand-text-muted text-sm leading-relaxed mb-4 flex-1 line-clamp-3">{post.metaDesc}</p>
                <div className="flex items-center justify-between text-xs text-brand-muted pt-3 border-t border-brand-border">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                  <span className="flex items-center gap-1 text-brand-primary font-semibold group-hover:gap-2 transition-all">
                    Read <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* SEO bottom text */}
        <div className="mt-12 text-sm text-brand-text-muted space-y-2">
          <h2 className="text-base font-bold text-brand-text">About FastTypingLab Blog</h2>
          <p>The FastTypingLab blog covers everything related to typing speed improvement, government exam typing preparation (SSC, CPCT, Court, Railway), Hindi typing practice, touch typing tutorials, and productivity tips. All articles are written by typing experts for Indian students and professionals.</p>
        </div>
      </div>
    </div>
  );
}
