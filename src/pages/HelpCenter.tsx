import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, ChevronRight, FileText, HelpCircle, Landmark,
  Lock, MessageCircle, Search, Settings2, Shield, Store, Users, Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import {
  HELP_ARTICLES, HELP_CATEGORIES, getArticlesByCategory, searchArticles,
  type HelpArticle,
} from '../lib/helpArticles';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'getting-started': Zap,
  'ks-numbers': Shield,
  securelinks: Lock,
  'collection-links': Users,
  'evidence-reviews': FileText,
  'money-accounts': Landmark,
  organizations: Settings2,
  'safety-trust': BookOpen,
};

const KNOWLEDGE_MAP = [
  { title: 'Trust & boundaries', detail: 'What SecurePay does, and what it deliberately does not do.', to: '/trust', icon: Shield },
  { title: 'Security', detail: 'How account, records and platform security are explained.', to: '/security', icon: Lock },
  { title: 'Compliance', detail: 'How lawful participation and regulatory obligations are handled.', to: '/compliance', icon: Settings2 },
  { title: 'SecurePay is not a bank', detail: 'A plain-language boundary between SecurePay and banking.', to: '/not-a-bank', icon: Landmark },
  { title: 'Terms & Privacy', detail: 'The formal rules and privacy notice when you need the full reference.', to: '/legal', icon: FileText },
];

const SITUATIONS = ['I want to buy something', 'I want to get paid', 'I am hiring someone', 'We are contributing together', 'I am supporting family'];

function ArticleCard({ article }: { article: HelpArticle }) {
  return (
    <Link to={`/help/article/${article.slug}`} className="b9-help-article">
      <span><HelpCircle size={14} /></span>
      <div><strong>{article.title}</strong><p>{article.shortAnswer}</p></div>
      <ChevronRight size={14} />
    </Link>
  );
}

export default function HelpCenter() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HelpArticle[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = (value = query) => {
    if (!value.trim()) { setResults(null); return; }
    setResults(searchArticles(value));
  };

  const handleSearch = (event: React.FormEvent) => { event.preventDefault(); search(); };
  const useSituation = (value: string) => { setQuery(value); setResults(searchArticles(value)); inputRef.current?.focus(); };

  const featured = [
    'what-is-securepay', 'what-is-ks-number', 'what-is-payment-ready',
    'where-does-money-sit', 'is-securepay-a-bank', 'what-is-agreement-review',
  ].map(slug => HELP_ARTICLES.find(article => article.slug === slug)).filter(Boolean) as HelpArticle[];

  return (
    <main className="b9-help-page">
      <nav className="b9-help-nav">
        <Link to="/" className="b9-help-brand"><LivingSecurePayMark state="resting" size="sm" presence="polite" /><span>Help & Knowledge</span></Link>
        <div className="b9-help-links">
          <Link to="/ask-securepay"><MessageCircle size={14} /><span>Ask SecurePay</span></Link>
          <Link to="/trust"><Shield size={14} /><span>Trust</span></Link>
          <Link to="/dashboard"><Store size={14} /><span>My Market</span></Link>
        </div>
      </nav>

      <section className="b9-help-hero">
        <div>
          <p className="b9-kicker">Help should reduce confusion</p>
          <h1>What do you want to understand?</h1>
          <p className="b9-help-hero-copy">Start with your question or your situation. SecurePay should give you the short answer first, an example when useful, and the full reference only when you want it.</p>
        </div>
        <div className="b9-help-guide"><LivingSecurePayMark state="guiding" size="lg" presence="present" /></div>
      </section>

      <div className="b9-help-search-wrap">
        <form className="b9-help-search" onSubmit={handleSearch}>
          <Search size={18} />
          <input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="Ask about an agreement, KSNumber, Payment Ready, money, reviews, fees..." aria-label="Search SecurePay help" />
          <button type="submit">Find the clearest answer</button>
        </form>
      </div>

      <div className="b9-help-content">
        {results !== null ? (
          <section className="b9-help-results">
            <p className="b9-label">Search results</p>
            <h2>{results.length ? `${results.length} useful answer${results.length === 1 ? '' : 's'}` : 'No exact answer yet'}</h2>
            {results.length ? <div className="b9-help-results-list">{results.map(article => <ArticleCard key={article.slug} article={article} />)}</div> : (
              <div className="b9-help-empty"><p>Try everyday words instead of product terminology, or ask SecurePay directly.</p><Link to="/ask-securepay" className="b9-primary" style={{ marginTop: 12 }}>Ask SecurePay <ArrowRight size={14} /></Link></div>
            )}
            <button type="button" className="b9-secondary" style={{ marginTop: 14 }} onClick={() => { setResults(null); setQuery(''); }}>Back to Help</button>
          </section>
        ) : (
          <>
            <section className="b9-help-start">
              <article className="b9-help-principle">
                <p className="b9-label">How this room works</p>
                <h2>Learn only as deeply as you need.</h2>
                <p>Most traders need a clear answer, not a manual. More detail should always remain available without blocking the task in front of them.</p>
                <div className="b9-help-depth"><div><strong>1 · Short answer</strong><span>What it means now</span></div><div><strong>2 · Example</strong><span>See it in real life</span></div><div><strong>3 · Full reference</strong><span>Policy, terms or detail</span></div></div>
              </article>

              <article className="b9-help-situations">
                <p className="b9-label">Start with real life</p>
                <h2>You do not need the product name.</h2>
                <p>Tell SecurePay the situation and let the knowledge system take you to the right explanation.</p>
                <div className="b9-situation-chips">
                  {SITUATIONS.map(item => <button key={item} type="button" onClick={() => useSituation(item)}>{item}</button>)}
                  <Link to="/situations">See more situations <ArrowRight size={12} /></Link>
                </div>
              </article>
            </section>

            <section className="b9-help-grid">
              <article className="b9-help-map">
                <p className="b9-label">Browse by topic</p>
                <h2>Find the part of the Market you are in.</h2>
                <p>Topics are grouped around what the trader is trying to understand, not around internal services.</p>
                <div className="b9-help-topic-grid">
                  {HELP_CATEGORIES.map(category => {
                    const Icon = CATEGORY_ICONS[category.id] ?? HelpCircle;
                    return <Link key={category.id} to={`/help/articles?category=${category.id}`} className="b9-help-topic"><span><Icon size={15} /></span><strong>{category.label}</strong><small>{category.description} · {getArticlesByCategory(category.id).length} answers</small></Link>;
                  })}
                </div>
              </article>

              <article className="b9-help-featured">
                <p className="b9-label">Good places to begin</p>
                <h2>The questions that explain SecurePay.</h2>
                <p>These answers establish the basic language before someone needs the deeper legal or technical reference.</p>
                <div className="b9-help-featured-list">{featured.map(article => <ArticleCard key={article.slug} article={article} />)}</div>
              </article>
            </section>

            <section className="b9-help-grid">
              <article className="b9-help-map">
                <p className="b9-label">Trust & formal knowledge</p>
                <h2>When you need to go deeper.</h2>
                <p>Trust, security, compliance and legal pages remain available as reference rooms. They should not be the front door to ordinary use.</p>
                <div className="b9-knowledge-map">
                  {KNOWLEDGE_MAP.map(item => <Link key={item.to} to={item.to}><span><item.icon size={15} /></span><div><strong>{item.title}</strong><small>{item.detail}</small></div><ArrowRight size={13} /></Link>)}
                </div>
              </article>

              <article className="b9-help-featured">
                <p className="b9-label">Ask instead of searching</p>
                <h2>Use normal words.</h2>
                <p>If the trader cannot find the right article name, the interface should not punish them for that. Ask SecurePay can help route the question into the existing knowledge.</p>
                <div className="b9-understood-card" style={{ marginTop: 16 }}><LivingSecurePayMark state="listening" size="sm" presence="present" /><div><span>Example question</span><strong style={{ fontSize: 17 }}>“I paid for materials but the supplier says they are still waiting. What does that mean?”</strong><p>SecurePay should explain the current state and point to the next safe action — not drown the trader in policy.</p></div></div>
                <Link to="/ask-securepay" className="b9-primary" style={{ marginTop: 16 }}>Ask SecurePay <MessageCircle size={14} /></Link>
              </article>
            </section>
          </>
        )}

        <div className="b9-help-trust-strip">
          <LivingSecurePayMark state="resting" size="xs" presence="polite" />
          <p><strong>Knowledge boundary:</strong> Help can explain SecurePay and point to records. It does not replace professional legal, financial or technical advice, and it does not invent financial truth.</p>
          <Link to="/trust">Understand the boundaries</Link>
        </div>
      </div>
    </main>
  );
}
