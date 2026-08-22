import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import {
  Shield, ArrowLeft, ArrowRight, ChevronRight, HelpCircle,
  ThumbsUp, MessageCircle, CheckCircle,
} from 'lucide-react';
import {
  getArticle, getRelatedArticles, HELP_ARTICLES,
} from '../lib/helpArticles';

const G = '#3a7a1f';

const CATEGORY_LABELS: Record<string, string> = {
  'getting-started': 'Getting Started',
  'ks-numbers': 'KS Numbers & Activation',
  'securelinks': 'SecureLinks',
  'collection-links': 'Group SecureLinks',
  'evidence-reviews': 'Evidence & Reviews',
  'money-accounts': 'Money, Accounts & Releases',
  'organizations': 'Organizations & Governance',
  'safety-trust': 'Safety & Trust',
};

const ACTION_COLORS: Record<string, string> = {
  '#3a7a1f': 'bg-[#3a7a1f] text-white hover:bg-[#2d6018]',
  '#0891b2': 'bg-[#0891b2] text-white hover:bg-[#0782a0]',
  '#e87c1e': 'bg-[#e87c1e] text-white hover:bg-[#d06918]',
  '#6b7280': 'bg-white border border-[#1a1a1a]/10 text-[#1a1a1a]/60 hover:border-[#3a7a1f]/25 hover:text-[#3a7a1f]',
};

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#fafaf8' }}>
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: G + '12' }}>
          <HelpCircle size={24} style={{ color: G }} />
        </div>
        <h2 className="font-display text-xl font-bold text-[#1a1a1a]">This help article is being prepared.</h2>
        <p className="text-sm text-[#1a1a1a]/50">Check back soon or browse all articles.</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link to="/help" className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-white text-sm font-medium" style={{ background: G }}>
            <ArrowLeft size={12} /> Back to Help Center
          </Link>
          <Link to="/ask-securepay" className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium bg-white border border-[#1a1a1a]/10 text-[#1a1a1a]/60">
            Ask SecurePay
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeedbackWidget() {
  const [choice, setChoice] = useState<'yes' | 'notyet' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // Feedback collection will be connected to backend in future
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 py-3">
        <CheckCircle size={14} style={{ color: G }} />
        <p className="text-sm text-[#1a1a1a]/55">Thank you. Feedback collection will be connected soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[#1a1a1a]/60">Was this helpful?</p>
      {choice === null && (
        <div className="flex gap-2">
          <button onClick={() => setChoice('yes')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#3a7a1f]/20 text-[#3a7a1f] text-xs font-semibold hover:bg-[#3a7a1f]/5 transition-all">
            <ThumbsUp size={12} /> Yes
          </button>
          <button onClick={() => setChoice('notyet')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#1a1a1a]/10 text-[#1a1a1a]/50 text-xs font-semibold hover:border-[#1a1a1a]/20 transition-all">
            Not yet
          </button>
        </div>
      )}
      {choice === 'yes' && (
        <div className="flex items-center gap-2">
          <CheckCircle size={14} style={{ color: G }} />
          <p className="text-sm text-[#1a1a1a]/55">Great — glad it helped.</p>
        </div>
      )}
      {choice === 'notyet' && (
        <div className="space-y-2">
          <label htmlFor="feedback-text" className="text-xs text-[#1a1a1a]/50">What was unclear?</label>
          <textarea
            id="feedback-text"
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            rows={2}
            className="w-full text-xs px-3 py-2 rounded-xl border border-[#1a1a1a]/10 bg-white text-[#1a1a1a] placeholder-[#1a1a1a]/30 resize-none focus:outline-none focus:ring-2 focus:ring-[#3a7a1f]/20"
            placeholder="Tell us what could be clearer..."
          />
          <button onClick={handleSubmit}
            className="text-xs font-bold px-4 py-2 rounded-full text-white transition-colors"
            style={{ background: G }}>
            Send feedback
          </button>
        </div>
      )}
    </div>
  );
}

export default function HelpArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticle(slug) : undefined;

  const categoryArticles = article
    ? HELP_ARTICLES.filter(a => a.category === article.category && a.slug !== article.slug).slice(0, 4)
    : [];

  if (!article) return <NotFound />;

  const related = getRelatedArticles(article.relatedSlugs);

  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#1a1a1a]/6 px-4 md:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="sp-living-mark-link" aria-label="SecurePay home"><LivingSecurePayMark state="resting" size="sm" presence="polite" /></Link>
          <div className="flex items-center gap-3">
            <Link to="/help" className="text-xs text-[#1a1a1a]/40 hover:text-[#3a7a1f] flex items-center gap-1.5 transition-colors">
              <ArrowLeft size={12} /> Help Center
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div className="grid md:grid-cols-[1fr_280px] gap-8">

          {/* Main article */}
          <article>
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[10px] text-[#1a1a1a]/35 mb-5 flex-wrap">
              <Link to="/help" className="hover:text-[#3a7a1f] transition-colors">Help Center</Link>
              <ChevronRight size={10} />
              <Link to={`/help/articles?category=${article.category}`} className="hover:text-[#3a7a1f] transition-colors">
                {CATEGORY_LABELS[article.category] ?? article.category}
              </Link>
              <ChevronRight size={10} />
              <span className="text-[#1a1a1a]/55">{article.title}</span>
            </nav>

            {/* Header */}
            <header className="mb-6">
              <h1 className="text-2xl md:text-3xl font-black text-[#1a1a1a] leading-snug mb-3">{article.title}</h1>
              <div className="bg-[#f0fdf4] border border-[#3a7a1f]/12 rounded-2xl px-4 py-3.5">
                <div className="flex items-start gap-2.5">
                  <CheckCircle size={14} style={{ color: G }} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-[#1a1a1a]/75 leading-relaxed">{article.shortAnswer}</p>
                </div>
              </div>
            </header>

            {/* Sections */}
            <div className="space-y-5 text-[#1a1a1a]/70">
              {article.sections.map((section, i) => (
                <div key={i}>
                  {section.heading && (
                    <h2 className="text-base font-bold text-[#1a1a1a] mb-2">{section.heading}</h2>
                  )}
                  <p className="text-sm leading-relaxed">{section.body}</p>
                </div>
              ))}
            </div>

            {/* Example */}
            {article.example && (
              <div className="mt-6 bg-white border border-[#1a1a1a]/6 rounded-2xl p-5">
                <p className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider mb-2">Real-life example</p>
                <p className="text-sm text-[#1a1a1a]/65 leading-relaxed">{article.example}</p>
              </div>
            )}

            {/* Summary */}
            <div className="mt-6 flex items-start gap-3 bg-[#fafaf8] border border-[#1a1a1a]/5 rounded-2xl px-4 py-4">
              <Shield size={13} style={{ color: G }} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-[#1a1a1a]/65 leading-relaxed">{article.summary}</p>
            </div>

            {/* Actions */}
            {article.actions.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-xs font-bold text-[#1a1a1a]/35 uppercase tracking-wider">Next steps</p>
                <div className="flex flex-wrap gap-2">
                  {article.actions.map((action, i) => {
                    const cls = ACTION_COLORS[action.color ?? '#6b7280'] ?? ACTION_COLORS['#6b7280'];
                    return (
                      <Link key={i} to={action.to}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${cls}`}>
                        {action.label} <ArrowRight size={10} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trust note */}
            <div className="mt-8 bg-[#fafaf8] border border-[#1a1a1a]/5 rounded-2xl px-4 py-4">
              <p className="text-[10px] text-[#1a1a1a]/35 leading-relaxed">
                This is general SecurePay guidance, not legal, financial or professional advice. SecurePay is not a bank, insurer, guarantor, court or investment platform. Participants remain responsible for their decisions.
              </p>
            </div>

            {/* Feedback */}
            <div className="mt-6 pt-5 border-t border-[#1a1a1a]/6">
              <FeedbackWidget />
            </div>

          </article>

          {/* Sidebar */}
          <aside className="space-y-5">

            {/* Related articles */}
            {related.length > 0 && (
              <div className="bg-white border border-[#1a1a1a]/6 rounded-2xl p-4">
                <p className="text-xs font-bold text-[#1a1a1a]/35 uppercase tracking-wider mb-3">Related articles</p>
                <div className="space-y-1">
                  {related.map(a => (
                    <Link key={a.slug} to={`/help/article/${a.slug}`}
                      className="flex items-start gap-2.5 py-2 px-1 rounded-xl hover:bg-[#fafaf8] transition-colors group">
                      <HelpCircle size={11} style={{ color: G }} className="flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-[#1a1a1a]/65 group-hover:text-[#1a1a1a] leading-snug">{a.title}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* More in this category */}
            {categoryArticles.length > 0 && (
              <div className="bg-white border border-[#1a1a1a]/6 rounded-2xl p-4">
                <p className="text-xs font-bold text-[#1a1a1a]/35 uppercase tracking-wider mb-3">
                  More in {CATEGORY_LABELS[article.category] ?? article.category}
                </p>
                <div className="space-y-1">
                  {categoryArticles.map(a => (
                    <Link key={a.slug} to={`/help/article/${a.slug}`}
                      className="block py-2 px-1 rounded-xl hover:bg-[#fafaf8] transition-colors">
                      <p className="text-xs font-medium text-[#1a1a1a]/60 hover:text-[#1a1a1a] leading-snug">{a.title}</p>
                    </Link>
                  ))}
                </div>
                <Link to={`/help/articles?category=${article.category}`}
                  className="flex items-center gap-1 text-[10px] font-bold mt-3 pt-2 border-t border-[#1a1a1a]/5 hover:underline"
                  style={{ color: G }}>
                  All articles <ArrowRight size={9} />
                </Link>
              </div>
            )}

            {/* Ask SecurePay */}
            <div className="bg-white border border-[#3a7a1f]/12 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <MessageCircle size={13} style={{ color: G }} />
                <p className="text-xs font-bold text-[#1a1a1a]/60">Still have a question?</p>
              </div>
              <p className="text-[10px] text-[#1a1a1a]/40 leading-relaxed">Ask SecurePay and we will find the closest help articles for you.</p>
              <Link to="/ask-securepay"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-white text-xs font-bold transition-colors"
                style={{ background: G }}>
                Ask SecurePay <ArrowRight size={10} />
              </Link>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
