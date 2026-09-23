import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Languages, Type } from 'lucide-react';
import Seo from '../components/Seo';
import PageHeader from '../components/PageHeader';
import ScrollableRegion from '../components/ScrollableRegion';

// Standard NCERT/CBSE-level Hindi alphabet (Devanagari script), the same set
// used across virtually every Hindi textbook and reference site. Not
// specific to any keyboard layout or exam — this is the alphabet itself.

const VOWELS = [
  { dev: 'अ', translit: 'a', example: 'अनार (anaar — pomegranate)' },
  { dev: 'आ', translit: 'aa', example: 'आम (aam — mango)' },
  { dev: 'इ', translit: 'i', example: 'इमली (imli — tamarind)' },
  { dev: 'ई', translit: 'ee', example: 'ईख (eekh — sugarcane)' },
  { dev: 'उ', translit: 'u', example: 'उल्लू (ullu — owl)' },
  { dev: 'ऊ', translit: 'oo', example: 'ऊन (oon — wool)' },
  { dev: 'ऋ', translit: 'ri', example: 'ऋषि (rishi — sage)' },
  { dev: 'ए', translit: 'e', example: 'एक (ek — one)' },
  { dev: 'ऐ', translit: 'ai', example: 'ऐनक (ainak — spectacles)' },
  { dev: 'ओ', translit: 'o', example: 'ओखली (okhli — mortar)' },
  { dev: 'औ', translit: 'au', example: 'औरत (aurat — woman)' },
  { dev: 'अं', translit: 'an (anusvara)', example: 'अंगूर (angoor — grapes)' },
  { dev: 'अः', translit: 'ah (visarga)', example: 'दुःख (dukh — sorrow)' },
];

const CONSONANT_GROUPS = [
  { varg: 'कवर्ग', letters: [{ dev: 'क', translit: 'ka' }, { dev: 'ख', translit: 'kha' }, { dev: 'ग', translit: 'ga' }, { dev: 'घ', translit: 'gha' }, { dev: 'ङ', translit: 'nga' }] },
  { varg: 'चवर्ग', letters: [{ dev: 'च', translit: 'cha' }, { dev: 'छ', translit: 'chha' }, { dev: 'ज', translit: 'ja' }, { dev: 'झ', translit: 'jha' }, { dev: 'ञ', translit: 'nya' }] },
  { varg: 'टवर्ग', letters: [{ dev: 'ट', translit: 'Ta' }, { dev: 'ठ', translit: 'Tha' }, { dev: 'ड', translit: 'Da' }, { dev: 'ढ', translit: 'Dha' }, { dev: 'ण', translit: 'Na' }] },
  { varg: 'तवर्ग', letters: [{ dev: 'त', translit: 'ta' }, { dev: 'थ', translit: 'tha' }, { dev: 'द', translit: 'da' }, { dev: 'ध', translit: 'dha' }, { dev: 'न', translit: 'na' }] },
  { varg: 'पवर्ग', letters: [{ dev: 'प', translit: 'pa' }, { dev: 'फ', translit: 'pha' }, { dev: 'ब', translit: 'ba' }, { dev: 'भ', translit: 'bha' }, { dev: 'म', translit: 'ma' }] },
  { varg: 'अंतस्थ', letters: [{ dev: 'य', translit: 'ya' }, { dev: 'र', translit: 'ra' }, { dev: 'ल', translit: 'la' }, { dev: 'व', translit: 'va' }] },
  { varg: 'ऊष्म', letters: [{ dev: 'श', translit: 'sha' }, { dev: 'ष', translit: 'Sha' }, { dev: 'स', translit: 'sa' }, { dev: 'ह', translit: 'ha' }] },
  { varg: 'संयुक्त (conjuncts)', letters: [{ dev: 'क्ष', translit: 'ksha' }, { dev: 'त्र', translit: 'tra' }, { dev: 'ज्ञ', translit: 'gya' }] },
];

const MATRAS = [
  { matra: 'ा', from: 'आ', example: 'का (kaa)' },
  { matra: 'ि', from: 'इ', example: 'कि (ki)' },
  { matra: 'ी', from: 'ई', example: 'की (kee)' },
  { matra: 'ु', from: 'उ', example: 'कु (ku)' },
  { matra: 'ू', from: 'ऊ', example: 'कू (koo)' },
  { matra: 'ृ', from: 'ऋ', example: 'कृ (kri)' },
  { matra: 'े', from: 'ए', example: 'के (ke)' },
  { matra: 'ै', from: 'ऐ', example: 'कै (kai)' },
  { matra: 'ो', from: 'ओ', example: 'को (ko)' },
  { matra: 'ौ', from: 'औ', example: 'कौ (kau)' },
  { matra: 'ं', from: 'अं', example: 'कं (kan)' },
  { matra: 'ः', from: 'अः', example: 'कः (kah)' },
];

export default function HindiAlphabetPage() {
  useEffect(() => {
    document.title = 'Hindi Alphabet — Vowels, Consonants & Matras | FastTypingLab';
  }, []);

  return (
    <div className="bg-brand-bg text-brand-text py-4 sm:py-6 px-4 sm:px-6">
      <Seo
        title="Hindi Alphabet (Hindi Letters) — Vowels, Consonants & Matras with English Transliteration | FastTypingLab"
        description="The complete Hindi alphabet — 13 vowels (स्वर), 33 consonants (व्यंजन) and matras (मात्रा), each with English transliteration and pronunciation. Learn the Hindi letters before you start Hindi typing practice."
      />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-brand-muted mb-6">
          <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/learn-hindi-typing/" className="hover:text-brand-primary transition-colors">Hindi Typing</Link>
          <span>/</span>
          <span className="text-brand-text">Hindi Alphabet</span>
        </div>

        <PageHeader
          icon={Type}
          eyebrow="हिंदी वर्णमाला"
          title="Hindi Alphabet — Hindi Letters Explained"
          subtitle="The complete set of Hindi vowels (स्वर), consonants (व्यंजन) and matras (मात्रा), with English transliteration and pronunciation — the foundation before you start Hindi typing."
        />

        <p className="text-sm text-brand-text-muted leading-relaxed bg-brand-surface border border-brand-border rounded-2xl p-4 mb-5">
          The Hindi alphabet (हिंदी वर्णमाला) is written in the Devanagari script and has three parts: <strong className="text-brand-text">स्वर (vowels)</strong> — sounds that can stand alone, <strong className="text-brand-text">व्यंजन (consonants)</strong> — sounds that need a vowel to be pronounced, and <strong className="text-brand-text">मात्रा (matras)</strong> — the shortened vowel signs attached to a consonant (e.g. क + ि = कि). Knowing these before you start Hindi typing practice makes learning the Mangal/INSCRIPT or Kruti Dev keyboard layout far easier, since every key you press maps to one of these letters or signs.
        </p>

        {/* Vowels */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl mb-5 overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-primary" />
            <h2 className="font-bold text-brand-text">स्वर — Vowels (13)</h2>
          </div>
          <ScrollableRegion label="Hindi vowels table">
            <table className="w-full text-sm">
              <thead className="bg-brand-surface-2">
                <tr>
                  <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">Letter</th>
                  <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">Transliteration</th>
                  <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">Example Word</th>
                </tr>
              </thead>
              <tbody>
                {VOWELS.map((v, i) => (
                  <tr key={v.dev} className={i % 2 === 0 ? 'bg-brand-surface' : 'bg-brand-surface-2'}>
                    <td className="px-4 py-2.5 font-bold text-brand-text text-xl" style={{ fontFamily: "'Noto Sans Devanagari', serif" }}>{v.dev}</td>
                    <td className="px-4 py-2.5 font-mono text-brand-primary">{v.translit}</td>
                    <td className="px-4 py-2.5 text-brand-text-muted" style={{ fontFamily: "'Noto Sans Devanagari', serif" }}>{v.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollableRegion>
        </div>

        {/* Consonants */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl mb-5 overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border flex items-center gap-2">
            <Languages className="w-5 h-5 text-brand-secondary" />
            <h2 className="font-bold text-brand-text">व्यंजन — Consonants (33)</h2>
          </div>
          <div className="p-4 grid sm:grid-cols-2 gap-3">
            {CONSONANT_GROUPS.map((group) => (
              <motion.div key={group.varg} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-brand-surface-2 border border-brand-border rounded-xl p-3">
                <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wide mb-2" style={{ fontFamily: "'Noto Sans Devanagari', serif" }}>{group.varg}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.letters.map((l) => (
                    <div key={l.dev} className="flex items-center gap-1.5 bg-brand-surface border border-brand-border rounded-lg px-2.5 py-1.5">
                      <span className="text-lg font-bold text-brand-text" style={{ fontFamily: "'Noto Sans Devanagari', serif" }}>{l.dev}</span>
                      <span className="text-xs font-mono text-brand-primary">{l.translit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Matras */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl mb-5 overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border flex items-center gap-2">
            <Type className="w-5 h-5 text-brand-accent" />
            <h2 className="font-bold text-brand-text">मात्रा — Matras (Vowel Signs)</h2>
          </div>
          <p className="px-5 pt-4 text-sm text-brand-text-muted">A matra is the short form of a vowel, attached to a consonant. For example, आ becomes ा when joined to क to make का (kaa).</p>
          <ScrollableRegion label="Hindi matras table">
            <table className="w-full text-sm mt-2">
              <thead className="bg-brand-surface-2">
                <tr>
                  <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">Matra</th>
                  <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">From Vowel</th>
                  <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">Example (with क)</th>
                </tr>
              </thead>
              <tbody>
                {MATRAS.map((m, i) => (
                  <tr key={m.matra} className={i % 2 === 0 ? 'bg-brand-surface' : 'bg-brand-surface-2'}>
                    <td className="px-4 py-2.5 font-bold text-brand-text text-xl" style={{ fontFamily: "'Noto Sans Devanagari', serif" }}>{m.matra || '(none)'}</td>
                    <td className="px-4 py-2.5 font-bold text-brand-text" style={{ fontFamily: "'Noto Sans Devanagari', serif" }}>{m.from}</td>
                    <td className="px-4 py-2.5 font-mono text-brand-primary" style={{ fontFamily: "'Noto Sans Devanagari', serif" }}>{m.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollableRegion>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-black text-brand-text text-lg mb-1">Ready to Type It?</h2>
            <p className="text-brand-text-muted text-sm">Now that you know the letters, learn the keyboard layout and start practicing.</p>
          </div>
          <div className="flex gap-3 shrink-0 flex-wrap">
            <Link to="/learn-hindi-typing/"
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-primary/20">
              <BookOpen className="w-4 h-4" /> Learn Hindi Typing
            </Link>
            <Link to="/hindi-typing-test/"
              className="flex items-center gap-2 bg-brand-surface border border-brand-border text-brand-text px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:border-brand-primary/40">
              <Languages className="w-4 h-4" /> Take the Typing Test
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
