import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight, Target, Clock, CheckCircle2, Lightbulb, Keyboard } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Seo from '../components/Seo';
import { EXAM_LANDINGS } from '../data/examLandingData';

export default function ExamLandingPage({ slug }: { slug: string }) {
  const exam = EXAM_LANDINGS[slug];
  if (!exam) return <Navigate to="/competitive-exam-typing" replace />;

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: exam.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <Seo title={exam.seoTitle} description={exam.metaDesc} canonical={`/${exam.slug}-typing-test`} jsonLd={faqLd} />
      <div className="max-w-[1000px] mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-brand-muted mb-6 flex-wrap">
          <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/competitive-exam-typing" className="hover:text-brand-primary transition-colors">Exam Typing</Link>
          <span>/</span>
          <span className="text-brand-text">{exam.examName}</span>
        </div>

        <PageHeader
          icon={Trophy}
          eyebrow={exam.eyebrow}
          title={exam.h1}
          subtitle={exam.intro}
        />

        {/* Primary CTA */}
        <div className="flex justify-center mb-10">
          <Link to={exam.practiceHref}
            className="inline-flex items-center gap-2 text-white px-7 py-3.5 rounded-2xl font-bold transition-all active:scale-95 shadow-lg"
            style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
            <Keyboard className="w-5 h-5" /> {exam.practiceLabel}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Requirements table */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-brand-text mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-brand-primary" /> Speed Requirements</h2>
          <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-brand-surface-2">
                  <tr>
                    <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">Language</th>
                    <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">Layout</th>
                    <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">Required Speed</th>
                    <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {exam.requirements.map((r, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-brand-surface' : 'bg-brand-surface-2'}>
                      <td className="px-4 py-3 font-semibold text-brand-text">{r.language}</td>
                      <td className="px-4 py-3 text-brand-text-muted">{r.layout}</td>
                      <td className="px-4 py-3 font-mono font-bold text-brand-primary">{r.speed}</td>
                      <td className="px-4 py-3 text-brand-text-muted flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{r.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Format + Tips */}
        <div className="grid md:grid-cols-2 gap-5 mb-10">
          <section className="bg-brand-surface border border-brand-border rounded-2xl p-5">
            <h2 className="font-black text-brand-text mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-accent" /> Exam Format</h2>
            <ul className="space-y-2">
              {exam.format.map((f, i) => (
                <li key={i} className="text-sm text-brand-text-muted flex gap-2"><span className="text-brand-accent mt-0.5">•</span>{f}</li>
              ))}
            </ul>
          </section>
          <section className="bg-brand-surface border border-brand-border rounded-2xl p-5">
            <h2 className="font-black text-brand-text mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500" /> Preparation Tips</h2>
            <ul className="space-y-2">
              {exam.tips.map((t, i) => (
                <li key={i} className="text-sm text-brand-text-muted flex gap-2"><span className="text-amber-500 mt-0.5">•</span>{t}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* CTA card */}
        <div className="bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 border border-brand-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="font-black text-brand-text text-lg mb-1">Practice the {exam.examName} typing test now</h2>
            <p className="text-brand-text-muted text-sm">Free, in the real exam format, with live WPM and accuracy.</p>
          </div>
          <Link to={exam.practiceHref}
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shrink-0">
            <Keyboard className="w-4 h-4" /> {exam.practiceLabel}
          </Link>
        </div>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-brand-text mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {exam.faqs.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="bg-brand-surface border border-brand-border rounded-2xl p-5">
                <h3 className="font-bold text-brand-text mb-2">{f.q}</h3>
                <p className="text-brand-text-muted text-sm leading-relaxed">{f.a}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Related */}
        <section className="mb-8">
          <h2 className="text-base font-black text-brand-text mb-3">Related practice</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {exam.related.map(r => (
              <Link key={r.href} to={r.href}
                className="group flex items-center justify-between gap-2 bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm font-semibold text-brand-text hover:border-brand-primary/40 transition-all">
                {r.label}
                <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </section>

        {/* More exams — every exam page links to all the others, so authority
            flows across the whole government-exam cluster. */}
        <section className="mb-4">
          <h2 className="text-base font-black text-brand-text mb-3">More Government Exam Typing Tests</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.values(EXAM_LANDINGS)
              .filter(e => e.slug !== exam.slug)
              .map(e => (
                <Link key={e.slug} to={`/${e.slug}-typing-test`}
                  className="group flex items-center justify-between gap-2 bg-brand-surface border border-brand-border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-brand-text hover:border-brand-primary/40 transition-all">
                  <span className="truncate">{e.examName} Typing Test</span>
                  <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
          </div>
          <div className="mt-3">
            <Link to="/competitive-exam-typing" className="text-sm font-semibold text-brand-primary hover:underline">
              View all competitive exam typing tests →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
