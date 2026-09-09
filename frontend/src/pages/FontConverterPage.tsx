import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightLeft, Copy, Check, Trash2, Download, Type, ChevronLeft } from 'lucide-react';
import Seo from '../components/Seo';
import { unicodeToKrutiDevKeys, krutiDevToUnicode } from '../data/krutiDevConverter';

type Direction = 'uni2kd' | 'kd2uni';

// NOTE: the Kruti Dev sample contains apostrophes — ' is a real Kruti Dev key
// (it renders श) — so this string must be double-quoted, not single-quoted.
const SAMPLES: Record<Direction, string> = {
  uni2kd: 'भारत एक विशाल देश है। हिंदी टाइपिंग का अभ्यास करें।',
  kd2uni: "Hkkjr ,d fo'kky ns'k gSA",
};

export default function FontConverterPage() {
  const [direction, setDirection] = useState<Direction>('uni2kd');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => { document.title = 'Kruti Dev to Unicode Converter (Both Ways) | FastTypingLab'; }, []);

  const output = useMemo(() => {
    if (!input.trim()) return '';
    try {
      return direction === 'uni2kd' ? unicodeToKrutiDevKeys(input) : krutiDevToUnicode(input);
    } catch {
      return '';
    }
  }, [input, direction]);

  const swap = useCallback(() => {
    // Carry the converted text across so swapping feels continuous
    setDirection(d => (d === 'uni2kd' ? 'kd2uni' : 'uni2kd'));
    setInput(output || '');
  }, [output]);

  const copyOut = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked */ }
  }, [output]);

  const downloadOut = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = direction === 'uni2kd' ? 'kruti-dev.txt' : 'unicode-hindi.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [output, direction]);

  const inputLabel = direction === 'uni2kd' ? 'Unicode Hindi (Mangal)' : 'Kruti Dev text';
  const outputLabel = direction === 'uni2kd' ? 'Kruti Dev' : 'Unicode Hindi (Mangal)';
  const inputIsDevanagari = direction === 'uni2kd';

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I convert Kruti Dev to Unicode?',
        acceptedAnswer: { '@type': 'Answer', text: 'Paste your Kruti Dev text into the box, choose the Kruti Dev to Unicode direction, and the Unicode (Mangal) version appears instantly. You can copy it or download it as a text file. The tool runs entirely in your browser, so nothing is uploaded.' },
      },
      {
        '@type': 'Question',
        name: 'Why does Kruti Dev text look like random English letters?',
        acceptedAnswer: { '@type': 'Answer', text: 'Kruti Dev is a legacy non-Unicode font. The file stores ordinary Latin characters, and the Kruti Dev font draws Devanagari shapes over them. Without that font installed the text shows as gibberish, which is why converting to Unicode makes it readable everywhere.' },
      },
      {
        '@type': 'Question',
        name: 'Is this Kruti Dev converter free?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no signup and no limit. Conversion happens in your browser, so your text never leaves your device.' },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <Seo
        title="Kruti Dev to Unicode Converter — Both Ways, Free | FastTypingLab"
        description="Free Kruti Dev to Unicode and Unicode to Kruti Dev converter for Hindi. Paste text, convert instantly, copy or download. Runs in your browser — no signup, nothing uploaded."
        jsonLd={faqLd}
      />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-brand-muted mb-6">
          <Link to="/tools/" className="flex items-center gap-1 hover:text-brand-primary transition-colors"><ChevronLeft className="w-3.5 h-3.5" /> Tools</Link>
          <span>/</span>
          <span className="text-brand-text">Font Converter</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black mb-2">Kruti Dev ↔ Unicode Converter</h1>
        <p className="text-brand-text-muted text-sm mb-6 max-w-2xl">
          Convert Hindi text between <strong className="text-brand-text">Kruti Dev</strong> (the legacy font used in most government typing exams and old documents) and{' '}
          <strong className="text-brand-text">Unicode / Mangal</strong> (what works everywhere — web, WhatsApp, MS Word, email). Instant, free, and processed entirely in your browser.
        </p>

        {/* Direction switch */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => setDirection('uni2kd')}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              direction === 'uni2kd'
                ? 'bg-brand-primary text-white border-transparent'
                : 'bg-brand-surface border-brand-border text-brand-muted hover:text-brand-text'
            }`}
          >
            Unicode → Kruti Dev
          </button>
          <button
            onClick={() => setDirection('kd2uni')}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              direction === 'kd2uni'
                ? 'bg-brand-primary text-white border-transparent'
                : 'bg-brand-surface border-brand-border text-brand-muted hover:text-brand-text'
            }`}
          >
            Kruti Dev → Unicode
          </button>
          <button
            onClick={swap}
            title="Swap direction and carry the result over"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-primary/40 transition-all"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Swap
          </button>
        </div>

        {/* Converter panes */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-muted">{inputLabel}</label>
              <div className="flex gap-2">
                <button onClick={() => setInput(SAMPLES[direction])}
                  className="text-[11px] font-bold text-brand-primary hover:underline">Try sample</button>
                {input && (
                  <button onClick={() => setInput('')}
                    className="flex items-center gap-1 text-[11px] font-bold text-brand-muted hover:text-rose-500 transition-colors">
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={direction === 'uni2kd' ? 'यहाँ हिंदी (यूनिकोड) टेक्स्ट पेस्ट करें…' : "Paste Kruti Dev text here (it looks like: Hkkjr ,d fo'kky ns'k gSA)"}
              rows={12}
              spellCheck={false}
              className="w-full bg-brand-surface border border-brand-border rounded-2xl px-4 py-3 text-brand-text outline-none focus:border-brand-primary transition-all resize-y"
              style={inputIsDevanagari ? { fontFamily: "'Noto Sans Devanagari', sans-serif", fontSize: 16 } : { fontFamily: 'monospace', fontSize: 15 }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-widest text-brand-muted">{outputLabel}</label>
              <div className="flex gap-2">
                <button onClick={copyOut} disabled={!output}
                  className="flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline disabled:opacity-40 disabled:no-underline">
                  {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
                <button onClick={downloadOut} disabled={!output}
                  className="flex items-center gap-1 text-[11px] font-bold text-brand-muted hover:text-brand-text disabled:opacity-40 transition-colors">
                  <Download className="w-3 h-3" /> .txt
                </button>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Converted text appears here…"
              rows={12}
              spellCheck={false}
              className="w-full bg-brand-surface-2 border border-brand-border rounded-2xl px-4 py-3 text-brand-text outline-none resize-y"
              style={!inputIsDevanagari ? { fontFamily: "'Noto Sans Devanagari', sans-serif", fontSize: 16 } : { fontFamily: 'monospace', fontSize: 15 }}
            />
          </div>
        </div>

        {direction === 'uni2kd' && output && (
          <p className="text-xs text-brand-muted mt-3">
            Tip: this output is the exact <strong className="text-brand-text">keystroke sequence</strong> you'd type on a Kruti Dev keyboard. Paste it into a document set to the Kruti Dev font to see the Devanagari shapes.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/kruti-dev-typing/" className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
            <Type className="w-4 h-4" /> Practice Kruti Dev typing
          </Link>
          <Link to="/hindi-typing-test/" className="inline-flex items-center gap-2 bg-brand-surface border border-brand-border hover:border-brand-primary/40 text-brand-text px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
            Hindi typing test
          </Link>
        </div>

        {/* SEO content */}
        <div className="mt-10 space-y-4 text-sm text-brand-text-muted">
          <h2 className="text-lg font-black text-brand-text">Kruti Dev vs Unicode — what's the difference?</h2>
          <p>
            <strong className="text-brand-text">Kruti Dev</strong> is a legacy font encoding. A Kruti Dev file actually stores ordinary Latin characters — the Kruti Dev font simply draws Devanagari shapes on top of them. That's why Kruti Dev text looks like <span className="font-mono">Hkkjr ,d fo'kky</span> on any computer that doesn't have the font installed.
          </p>
          <p>
            <strong className="text-brand-text">Unicode (Mangal / INSCRIPT)</strong> stores real Devanagari characters, so the text displays correctly everywhere — websites, WhatsApp, email, MS Word — without needing a special font. Unicode is the modern standard, and most current government exams have moved to it.
          </p>

          <h2 className="text-lg font-black text-brand-text pt-2">When do you need this converter?</h2>
          <ul className="space-y-2">
            <li>• <strong className="text-brand-text">Old documents.</strong> Government offices, courts and schools have decades of files typed in Kruti Dev. Converting them to Unicode makes them searchable and shareable.</li>
            <li>• <strong className="text-brand-text">Exam preparation.</strong> Many practice passages circulate in Kruti Dev while exams like CPCT and SSC increasingly use Unicode Mangal — convert to practise in the right format.</li>
            <li>• <strong className="text-brand-text">Publishing online.</strong> Kruti Dev text pasted onto a website or WhatsApp shows as gibberish. Convert to Unicode first.</li>
            <li>• <strong className="text-brand-text">Printing legacy layouts.</strong> Going the other way, convert Unicode into Kruti Dev when a press or template still requires the old font.</li>
          </ul>

          <h2 className="text-lg font-black text-brand-text pt-2">Is my text private?</h2>
          <p>
            Yes. The conversion runs entirely in your browser using JavaScript — your text is never uploaded to a server, never stored, and never seen by us. You can even use the tool offline once the page has loaded.
          </p>

          <h2 className="text-lg font-black text-brand-text pt-2">How accurate is the conversion?</h2>
          <p>
            Ordinary Hindi prose — including conjuncts (क्ष, त्र, ज्ञ), the i-matra (ि) and reph (र्) — round-trips cleanly. One honest caveat: Kruti Dev is a lossy legacy encoding where a few keys are ambiguous (nukta letters such as क़ share a key with plain क), so those decode to the common form and may occasionally need a manual touch-up. Always proofread converted text before submitting it officially.
          </p>
        </div>
      </div>
    </div>
  );
}
