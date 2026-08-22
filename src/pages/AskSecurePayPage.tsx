import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import {
  Search, Shield, ArrowRight, ChevronRight, HelpCircle,
  MessageCircle, AlertCircle, ArrowLeft,
} from 'lucide-react';
import {
  searchArticles, type HelpArticle,
} from '../lib/helpArticles';

const G = '#3a7a1f';

const SUGGESTED_CHIPS: { label: string; group: string }[] = [
  { label: 'What is SecurePay?',              group: 'Getting started' },
  { label: 'Is SecurePay a bank?',            group: 'Getting started' },
  { label: 'Why not just send money?',         group: 'Getting started' },
  { label: 'What is a KS Number?',            group: 'Getting started' },
  { label: 'When should I use a SecureLink?', group: 'SecureLinks' },
  { label: 'What is Payment Ready?',          group: 'SecureLinks' },
  { label: 'What evidence should I ask for?', group: 'SecureLinks' },
  { label: 'What happens after I create a SecureLink?', group: 'SecureLinks' },
  { label: 'When should I use a Group SecureLink?', group: 'Group SecureLinks' },
  { label: 'Can I collect rent with SecurePay?', group: 'Group SecureLinks' },
  { label: 'Can churches use Group SecureLinks?', group: 'Group SecureLinks' },
  { label: 'Can contributors see who has paid?', group: 'Group SecureLinks' },
  { label: 'What happens if someone disagrees?', group: 'Reviews' },
  { label: 'What is an Agreement Review?',    group: 'Reviews' },
  { label: 'What if evidence is missing?',   group: 'Reviews' },
  { label: 'Where does the money sit?',       group: 'Money' },
  { label: 'Who owns the money?',             group: 'Money' },
  { label: 'Does SecurePay pay interest?',    group: 'Money' },
  { label: 'When can money be released?',     group: 'Money' },
  { label: 'Who are approvers?',              group: 'Organizations' },
  { label: 'Why do approvers need KS Numbers?', group: 'Organizations' },
  { label: 'How do estate approvals work?',   group: 'Organizations' },
  { label: 'How do school approvals work?',   group: 'Organizations' },
];

const CHIP_GROUPS = Array.from(new Set(SUGGESTED_CHIPS.map(c => c.group)));

function ArticleCard({ article }: { article: HelpArticle }) {
  return (
    <Link to={`/help/article/${article.slug}`}
      className="flex items-start gap-3 bg-white border border-[#1a1a1a]/6 rounded-2xl px-4 py-3.5 hover:border-[#3a7a1f]/20 hover:shadow-sm transition-all group">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: G + '12' }}>
        <HelpCircle size={12} style={{ color: G }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1a1a1a]/80 group-hover:text-[#1a1a1a] leading-snug">{article.title}</p>
        <p className="text-[10px] text-[#1a1a1a]/40 mt-0.5 line-clamp-2 leading-relaxed">{article.shortAnswer}</p>
      </div>
      <ChevronRight size={12} className="text-[#1a1a1a]/20 group-hover:text-[#3a7a1f] flex-shrink-0 mt-1 transition-colors" />
    </Link>
  );
}

export default function AskSecurePayPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HelpArticle[] | null>(null);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setResults(searchArticles(trimmed));
    setSearched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  const handleChip = (q: string) => {
    doSearch(q);
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const clearSearch = () => { setQuery(''); setResults(null); setSearched(false); };

  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#1a1a1a]/6 px-4 md:px-8 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="sp-living-mark-link" aria-label="SecurePay home"><LivingSecurePayMark state="resting" size="sm" presence="polite" /></Link>
          <Link to="/help" className="text-xs text-[#1a1a1a]/40 hover:text-[#3a7a1f] flex items-center gap-1.5 transition-colors">
            <ArrowLeft size={12} /> Help Center
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: '#1e4d10' }} className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <div className="flex items-center justify-center gap-2">
            <MessageCircle size={14} className="text-white/30" />
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Ask SecurePay</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-snug">Ask SecurePay</h1>
          <p className="text-white/55 text-sm leading-relaxed max-w-md mx-auto">
            Ask a question about SecureLinks, Group SecureLinks, KS Numbers, Payment Ready, reviews, evidence, activation, governance or how SecurePay works.
          </p>

          <form onSubmit={handleSubmit} className="relative">
            <label htmlFor="ask-input" className="sr-only">Ask a question about SecurePay</label>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1a1a]/30 pointer-events-none" />
              <input
                id="ask-input"
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Example: Should I use a SecureLink or Group SecureLink for rent?"
                className="w-full pl-11 pr-24 py-4 rounded-2xl text-sm bg-white border border-white/20 text-[#1a1a1a] placeholder-[#1a1a1a]/40 focus:outline-none focus:ring-2 focus:ring-[#3a7a1f]/30 shadow-lg shadow-[#1a1a1a]/10"
              />
              <button type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#3a7a1f] hover:bg-[#2d6018] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                Ask
              </button>
            </div>
          </form>

          {!searched && (
            <p className="text-[10px] text-white/20 leading-relaxed">
              Ask SecurePay searches help articles. It is not an AI assistant. Answers are matched from the SecurePay Help Center.
            </p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Search results */}
        {searched && results !== null && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-[#1a1a1a]/35 mb-0.5">You asked:</p>
                <h2 className="font-bold text-[#1a1a1a] text-lg leading-snug">"{query}"</h2>
              </div>
              <button onClick={clearSearch} className="text-xs text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70 transition-colors flex-shrink-0">
                Clear
              </button>
            </div>

            {/* Honest non-AI response */}
            <div className="bg-white border border-[#3a7a1f]/12 rounded-2xl px-5 py-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G + '12' }}>
                  <Shield size={12} style={{ color: G }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1a1a1a]/50 mb-1">Ask SecurePay</p>
                  <p className="text-sm text-[#1a1a1a]/65 leading-relaxed">
                    {results.length > 0
                      ? `Here are the closest help articles for your question. Each article is written in plain language.`
                      : `Ask SecurePay search couldn't find an exact match. Try different keywords or browse the Help Center.`}
                  </p>
                  <p className="text-[10px] text-[#1a1a1a]/35 mt-2 italic">
                    This is general SecurePay guidance, not legal, financial or professional advice.
                  </p>
                </div>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="bg-white border border-[#1a1a1a]/6 rounded-2xl p-6 text-center space-y-3">
                <AlertCircle size={20} className="mx-auto text-amber-500" />
                <p className="text-sm text-[#1a1a1a]/60">
                  No exact match. Try searching SecureLink, Group SecureLink, KS Number, Payment Ready, evidence, rent, school fees or welfare.
                </p>
                <Link to="/help"
                  className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                  style={{ color: G }}>
                  Browse all Help topics <ArrowRight size={11} />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {results.slice(0, 6).map(a => <ArticleCard key={a.slug} article={a} />)}
                {results.length > 6 && (
                  <p className="text-[10px] text-[#1a1a1a]/35 text-center pt-1">
                    {results.length - 6} more article{results.length - 6 !== 1 ? 's' : ''} match. <Link to="/help/articles" className="text-[#3a7a1f] hover:underline">Browse all articles.</Link>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Suggested questions */}
        {!searched && (
          <div className="space-y-6">
            {CHIP_GROUPS.map(group => (
              <div key={group}>
                <p className="text-xs font-bold text-[#1a1a1a]/35 uppercase tracking-wider mb-3">{group}</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_CHIPS.filter(c => c.group === group).map(chip => (
                    <button key={chip.label} onClick={() => handleChip(chip.label)}
                      className="text-xs px-3.5 py-2 rounded-full bg-white border border-[#1a1a1a]/8 text-[#1a1a1a]/60 hover:border-[#3a7a1f]/25 hover:text-[#3a7a1f] transition-all text-left">
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* After search — suggest more chips */}
        {searched && (
          <div>
            <p className="text-xs font-bold text-[#1a1a1a]/35 uppercase tracking-wider mb-3">Try another question</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_CHIPS.filter(c => c.label !== query).slice(0, 8).map(chip => (
                <button key={chip.label} onClick={() => handleChip(chip.label)}
                  className="text-xs px-3.5 py-2 rounded-full bg-white border border-[#1a1a1a]/8 text-[#1a1a1a]/60 hover:border-[#3a7a1f]/25 hover:text-[#3a7a1f] transition-all">
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trust + disclaimer */}
        <div className="bg-[#fafaf8] border border-[#1a1a1a]/5 rounded-2xl px-5 py-4">
          <div className="flex items-start gap-3">
            <Shield size={13} style={{ color: G }} className="flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="text-[10px] text-[#1a1a1a]/45 leading-relaxed">
                SecurePay is an agreement-driven payment platform. It is not a bank, insurer, guarantor, court or investment platform. Banking and payment services may be provided through licensed financial infrastructure partners.
              </p>
              <p className="text-[10px] text-[#1a1a1a]/45 leading-relaxed">
                SecurePay helps structure agreements, collections, evidence, reviews, approvals and payment readiness. Participants remain responsible for their decisions.
              </p>
              <p className="text-[10px] text-[#1a1a1a]/35 italic">
                This is general guidance. For legal decisions, please consult a qualified professional.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 flex-wrap py-2 text-[10px] text-[#1a1a1a]/30">
          <Link to="/help" className="hover:text-[#3a7a1f] transition-colors">Help Center</Link>
          <Link to="/help/articles" className="hover:text-[#3a7a1f] transition-colors">All Articles</Link>
          <Link to="/terms" className="hover:text-[#1a1a1a]/55 transition-colors">Terms</Link>
          <Shield size={9} className="text-[#3a7a1f]/25" />
          <span>SecurePay.ke · Money should follow the agreement</span>
        </div>

      </div>
    </div>
  );
}
