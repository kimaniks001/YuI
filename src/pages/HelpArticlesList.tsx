import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import {
  Search, Shield, ChevronRight, HelpCircle, ArrowLeft, ArrowRight,
} from 'lucide-react';
import {
  HELP_CATEGORIES, HELP_ARTICLES, searchArticles,
  getArticlesByCategory, type HelpArticle,
} from '../lib/helpArticles';

const G = '#3a7a1f';
const C = '#0891b2';

const CATEGORY_COLORS: Record<string, string> = {
  'getting-started': G, 'ks-numbers': '#e87c1e', 'securelinks': G,
  'collection-links': C, 'evidence-reviews': '#d97706',
  'money-accounts': '#7c3aed', 'organizations': C, 'safety-trust': G,
};

function ArticleCard({ article }: { article: HelpArticle }) {
  return (
    <Link to={`/help/article/${article.slug}`}
      className="flex items-start gap-3 bg-white border border-[#1a1a1a]/6 rounded-2xl px-4 py-3.5 hover:border-[#3a7a1f]/20 hover:shadow-sm transition-all group">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: (CATEGORY_COLORS[article.category] ?? G) + '12' }}>
        <HelpCircle size={12} style={{ color: CATEGORY_COLORS[article.category] ?? G }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1a1a1a]/80 group-hover:text-[#1a1a1a] leading-snug">{article.title}</p>
        <p className="text-[10px] text-[#1a1a1a]/40 mt-0.5 line-clamp-2 leading-relaxed">{article.shortAnswer}</p>
      </div>
      <ChevronRight size={12} className="text-[#1a1a1a]/20 group-hover:text-[#3a7a1f] flex-shrink-0 mt-1 transition-colors" />
    </Link>
  );
}

export default function HelpArticlesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HelpArticle[] | null>(null);
  const activeCategory = searchParams.get('category') ?? '';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) { setSearchResults(null); return; }
    setSearchResults(searchArticles(query));
  };

  const setCategory = (cat: string) => {
    setSearchResults(null);
    setQuery('');
    if (cat) setSearchParams({ category: cat });
    else setSearchParams({});
  };

  const displayed = searchResults
    ? searchResults
    : activeCategory
    ? getArticlesByCategory(activeCategory)
    : HELP_ARTICLES;

  const currentCat = HELP_CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#1a1a1a]/6 px-4 md:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="sp-living-mark-link" aria-label="SecurePay home"><LivingSecurePayMark state="resting" size="sm" presence="polite" /></Link>
          <Link to="/help" className="text-xs text-[#1a1a1a]/40 hover:text-[#3a7a1f] flex items-center gap-1.5 transition-colors">
            <ArrowLeft size={12} /> Help Center
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[10px] text-[#1a1a1a]/35 flex-wrap">
          <Link to="/help" className="hover:text-[#3a7a1f] transition-colors">Help Center</Link>
          <ChevronRight size={10} />
          <span className="text-[#1a1a1a]/55">{currentCat?.label ?? 'All Articles'}</span>
        </nav>

        <h1 className="text-2xl font-black text-[#1a1a1a]">
          {currentCat?.label ?? 'All Help Articles'}
        </h1>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <label htmlFor="articles-search" className="sr-only">Search articles</label>
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1a1a1a]/30 pointer-events-none" />
            <input
              id="articles-search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#1a1a1a]/10 text-sm bg-white text-[#1a1a1a] placeholder-[#1a1a1a]/35 focus:outline-none focus:ring-2 focus:ring-[#3a7a1f]/20"
            />
          </div>
          <button type="submit"
            className="px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-colors"
            style={{ background: G }}>
            Search
          </button>
          {searchResults && (
            <button type="button" onClick={() => { setSearchResults(null); setQuery(''); }}
              className="px-3 py-2.5 rounded-xl border border-[#1a1a1a]/10 text-xs text-[#1a1a1a]/50 hover:border-[#1a1a1a]/20 transition-colors">
              Clear
            </button>
          )}
        </form>

        {/* Category filter pills */}
        {!searchResults && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            <button onClick={() => setCategory('')}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                !activeCategory ? 'text-white shadow-sm' : 'bg-white border border-[#1a1a1a]/10 text-[#1a1a1a]/55 hover:border-[#3a7a1f]/25'
              }`}
              style={!activeCategory ? { background: G } : {}}>
              All ({HELP_ARTICLES.length})
            </button>
            {HELP_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  activeCategory === cat.id ? 'text-white shadow-sm' : 'bg-white border border-[#1a1a1a]/10 text-[#1a1a1a]/55 hover:border-[#3a7a1f]/25'
                }`}
                style={activeCategory === cat.id ? { background: CATEGORY_COLORS[cat.id] ?? G } : {}}>
                {cat.label} ({getArticlesByCategory(cat.id).length})
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        <div>
          <p className="text-xs text-[#1a1a1a]/35 mb-3">
            {displayed.length} article{displayed.length !== 1 ? 's' : ''}
            {searchResults ? ` matching "${query}"` : activeCategory ? ` in ${currentCat?.label}` : ' total'}
          </p>
          {displayed.length === 0 ? (
            <div className="bg-white border border-[#1a1a1a]/6 rounded-2xl p-6 text-center space-y-3">
              <p className="text-sm text-[#1a1a1a]/55">No articles match your search. Try different keywords.</p>
              <Link to="/ask-securepay" className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline" style={{ color: G }}>
                Ask SecurePay instead <ArrowRight size={11} />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {displayed.map(a => <ArticleCard key={a.slug} article={a} />)}
            </div>
          )}
        </div>

        {/* Trust note */}
        <div className="flex items-start gap-2.5 bg-[#fafaf8] border border-[#1a1a1a]/5 rounded-2xl px-4 py-3.5">
          <Shield size={12} style={{ color: G }} className="flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#1a1a1a]/35 leading-relaxed">
            Help articles explain how SecurePay works in plain language. They do not replace legal, financial or professional advice.
          </p>
        </div>
      </div>
    </div>
  );
}
