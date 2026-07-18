import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Clock, Calendar, Share2, ExternalLink } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import Seo from '../components/Seo';

// Inline formatting: links, bold, italics (links first so bold doesn't eat them)
function inline(s: string): string {
  return s
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-brand-primary font-semibold hover:underline">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-brand-text font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

// Simple markdown-to-jsx renderer (no external deps)
function renderMarkdown(md: string): React.ReactNode[] {
  const lines = md.trim().split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // H2
    if (line.startsWith('## ')) {
      nodes.push(<h2 key={i} className="text-xl font-black text-brand-text mt-8 mb-3">{line.slice(3)}</h2>);
      i++; continue;
    }
    // H3
    if (line.startsWith('### ')) {
      nodes.push(<h3 key={i} className="text-base font-bold text-brand-text mt-5 mb-2">{line.slice(4)}</h3>);
      i++; continue;
    }
    // Table
    if (line.startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) { tableLines.push(lines[i]); i++; }
      const rows = tableLines.filter(r => !r.match(/^\|[-| ]+\|$/));
      nodes.push(
        <div key={`t${i}`} className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {rows.map((r, ri) => {
                const cells = r.split('|').filter((_, ci) => ci > 0 && ci < r.split('|').length - 1);
                const Tag = ri === 0 ? 'th' : 'td';
                return (
                  <tr key={ri} className={ri === 0 ? 'bg-brand-surface-2' : ri % 2 === 0 ? 'bg-brand-surface' : ''}>
                    {cells.map((c, ci) => (
                      <Tag key={ci} className={`border border-brand-border px-3 py-2 text-left ${ri === 0 ? 'font-bold text-brand-text' : 'text-brand-text-muted'}`}>
                        {c.trim()}
                      </Tag>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      continue;
    }
    // List item
    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) { items.push(lines[i].slice(2)); i++; }
      nodes.push(
        <ul key={`ul${i}`} className="my-3 space-y-1.5 ml-4">
          {items.map((item, ii) => <li key={ii} className="text-brand-text-muted text-sm flex gap-2"><span className="text-brand-primary shrink-0 mt-0.5">•</span><span dangerouslySetInnerHTML={{ __html: inline(item) }} /></li>)}
        </ul>
      );
      continue;
    }
    // Regular paragraph
    nodes.push(<p key={i} className="text-brand-text-muted leading-relaxed my-2 text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: inline(line) }} />);
    i++;
  }
  return nodes;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  const relatedPosts = BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Seo
          title={post.seoTitle}
          description={post.metaDesc}
          canonical={`/blog/${post.slug}`}
          type="article"
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.metaDesc,
            datePublished: post.date,
            image: 'https://fasttypinglab.com/og-image.png',
            author: { '@type': 'Organization', name: 'FastTypingLab' },
            publisher: {
              '@type': 'Organization',
              name: 'FastTypingLab',
              url: 'https://fasttypinglab.com',
              logo: { '@type': 'ImageObject', url: 'https://fasttypinglab.com/favicon-512x512.png' },
            },
            mainEntityOfPage: `https://fasttypinglab.com/blog/${post.slug}`,
          }}
        />
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-brand-muted mb-6">
          <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-brand-primary transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-brand-text">{post.title.slice(0, 40)}…</span>
        </div>

        <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Post header */}
          <div className="mb-8">
            <div className="text-5xl mb-4">{post.emoji}</div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-3 py-1 rounded-full font-bold">{post.category}</span>
              <span className="flex items-center gap-1 text-xs text-brand-muted"><Clock className="w-3 h-3" /> {post.readTime} read</span>
              <span className="flex items-center gap-1 text-xs text-brand-muted"><Calendar className="w-3 h-3" /> {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-text mb-3 leading-tight">{post.title}</h1>
            <p className="text-brand-text-muted leading-relaxed">{post.metaDesc}</p>
          </div>

          {/* Content */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 sm:p-8 mb-8">
            {renderMarkdown(post.content)}
          </div>

          {/* Share + CTA */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="flex items-center gap-2 bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text px-4 py-2 rounded-xl text-sm font-semibold transition-all">
              <Share2 className="w-4 h-4" /> Copy Link
            </button>
            <Link to="/tests"
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-brand-primary/20">
              <ExternalLink className="w-4 h-4" /> Practice Now
            </Link>
          </div>

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <div>
              <h2 className="text-lg font-black text-brand-text mb-4">Related Articles</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedPosts.map(rp => (
                  <Link key={rp.slug} to={`/blog/${rp.slug}`}
                    className="group bg-brand-surface border border-brand-border rounded-2xl p-4 hover:border-brand-primary/30 transition-all">
                    <div className="text-2xl mb-2">{rp.emoji}</div>
                    <h3 className="font-bold text-brand-text text-sm group-hover:text-brand-primary transition-colors line-clamp-2">{rp.title}</h3>
                    <p className="text-brand-muted text-xs mt-1">{rp.readTime} read</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.article>
      </div>
    </div>
  );
}
