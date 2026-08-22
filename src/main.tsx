import 'leaflet/dist/leaflet.css';
import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { MarketAtmosphereBackdrop, MarketAtmosphereProvider } from './lib/marketAtmosphere';
import { SECUREPAY_EXPLORER_MODE } from './lib/explorerMode';
import { getWorldFromPath } from './lib/worldMode';
import RequireAuth from './routing/RequireAuth';
import FloatingAssistant from './components/FloatingAssistant';
import ExplorerDock from './components/ExplorerDock';
import WorldSwitcher from './components/WorldSwitcher';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import Signup from './pages/Signup';
import KSActivation from './pages/KSActivation';
import KSProfile from './pages/KSProfile';
import StoreOfferDetail from './pages/StoreOfferDetail';
import SecureLinkJoin from './pages/SecureLinkJoin';
import CreateJourney from './pages/CreateJourney';
import AgreementDetailWorkspace from './pages/AgreementDetailWorkspace';
import PublicGroupSecureLink from './pages/PublicGroupSecureLink';
import SecurePayHome from './pages/SecurePayHome';
import MyMarket from './pages/MyMarket';
import MarketFlows from './pages/MarketFlows';
import MarketStatements from './pages/MarketStatements';
import TraderAgreements from './pages/TraderAgreements';
import TraderActionCentre from './pages/TraderActionCentre';
import MoneySpace from './pages/MoneySpace';
import TraderCommunity from './pages/TraderCommunity';
import TraderSettings from './pages/TraderSettings';
import StoreOwnerStudio from './pages/StoreOwnerStudio';
import StoreSharingStudio from './pages/StoreSharingStudio';
import PlugDashboard from './pages/PlugDashboard';
import DeveloperJourney from './pages/DeveloperJourney';
import SituationsPage from './pages/SituationsPage';
import HelpCenter from './pages/HelpCenter';
import HelpArticlesList from './pages/HelpArticlesList';
import HelpArticlePage from './pages/HelpArticlePage';
import AskSecurePayPage from './pages/AskSecurePayPage';
import TrustPage from './pages/TrustPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import LegalPage from './pages/LegalPage';
import SecurityPage from './pages/SecurityPage';
import CompliancePage from './pages/CompliancePage';
import NotABankPage from './pages/NotABankPage';
import NotFoundPage from './pages/NotFoundPage';
import TrainerHome from './pages/TrainerHome';
import TrainerSession from './pages/TrainerSession';
import ExplorerMap from './pages/ExplorerMap';
import ExplorerSettings from './pages/ExplorerSettings';
import PlayMarketHome from './pages/PlayMarketHome';
import PlayMarketBoard from './pages/PlayMarketBoard';
import PlayMarketProject from './pages/PlayMarketProject';
import PlayMarketLeaderboard from './pages/PlayMarketLeaderboard';

// Fixture-backed experience surfaces. Trainer routes reuse these approved
// visual rooms without giving them authentication or live API authority.
import ReviewGallery from './review/ReviewGallery';
import PreviewJourneys from './pages/PreviewJourneys';
import PreviewWorkspacePage from './pages/PreviewWorkspacePage';
import PreviewOperationalPage from './pages/PreviewOperationalPage';
import PreviewMarketPage from './pages/PreviewMarketPage';
import PreviewDeveloperJourney from './pages/PreviewDeveloperJourney';
import PreviewTraderHome from './pages/PreviewTraderHome';
import PreviewJoiningPage from './pages/PreviewJoiningPage';
import PreviewDigitalStore from './pages/PreviewDigitalStore';
import PreviewMoneyRooms from './pages/PreviewMoneyRooms';
import PreviewFlowCommunity from './pages/PreviewFlowCommunity';
import PreviewReviewRecovery from './pages/PreviewReviewRecovery';
import PreviewSystemStates from './pages/PreviewSystemStates';
import PreviewResponsiveCertification from './pages/PreviewResponsiveCertification';
import PreviewMarketThemes from './pages/PreviewMarketThemes';
import PreviewVisualCertification from './pages/PreviewVisualCertification';

import './index.css';
import './securepay-visual-constitution.css';
import './home.css';
import './market-convergence.css';
import './r14-accessibility.css';
import './r15-global.css';
import './living-market.css';
import './living-securepay-mark.css';
import './batch2-identity-journey.css';
import './batch5-invitation-store.css';
import './batch6-money-rooms.css';
import './batch7-flow-community.css';
import './batch8-review-recovery.css';
import './batch9-developer-knowledge.css';
import './batch10-system-responsive.css';
import './batch11-atmosphere-certification.css';
import './yui-v1-explorer.css';
import './play-market.css';
import './world-switcher.css';
import './store-sharing.css';

function Protected({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}

function AppShell() {
  const location = useLocation();
  const world = getWorldFromPath(location.pathname);
  const reviewEnabled = import.meta.env.DEV || SECUREPAY_EXPLORER_MODE;
  const isReviewSurface = location.pathname === '/review' || location.pathname.startsWith('/preview/');

  return <div className={`sp-app-frame world-${world}`} data-securepay-world={world}>
    <MarketAtmosphereBackdrop />
    <Routes>
      {/* REAL MARKET. These canonical URLs always render Market components.
          Real authentication and all authoritative state remain SecurePayAPI-owned. */}
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/activate" element={<KSActivation />} />
      <Route path="/activation" element={<KSActivation />} />
      <Route path="/verify" element={<KSActivation />} />
      <Route path="/ks/:ksId" element={<KSProfile />} />
      <Route path="/ks/:ksId/offers/:offerId" element={<StoreOfferDetail />} />
      <Route path="/create" element={<CreateJourney />} />
      <Route path="/create/journey" element={<CreateJourney />} />
      <Route path="/securelink/join" element={<SecureLinkJoin />} />
      <Route path="/securelink/join/:token" element={<SecureLinkJoin />} />
      <Route path="/group/:slug" element={<PublicGroupSecureLink />} />
      <Route path="/dashboard" element={<Protected><SecurePayHome /></Protected>} />
      <Route path="/profile" element={<Protected><SecurePayHome /></Protected>} />
      <Route path="/market" element={<Protected><MyMarket /></Protected>} />
      <Route path="/market/flows" element={<Protected><MarketFlows /></Protected>} />
      <Route path="/market/statements" element={<Protected><MarketStatements /></Protected>} />
      <Route path="/store" element={<Protected><StoreOwnerStudio /></Protected>} />
      <Route path="/store/share" element={<Protected><StoreSharingStudio /></Protected>} />
      <Route path="/plug" element={<Protected><PlugDashboard /></Protected>} />
      <Route path="/builders" element={<Protected><PlugDashboard /></Protected>} />
      <Route path="/agreements" element={<Protected><TraderAgreements /></Protected>} />
      <Route path="/agreements/:agreementId" element={<Protected><AgreementDetailWorkspace /></Protected>} />
      <Route path="/actions" element={<Protected><TraderActionCentre /></Protected>} />
      <Route path="/money" element={<Protected><MoneySpace /></Protected>} />
      <Route path="/community" element={<Protected><TraderCommunity /></Protected>} />
      <Route path="/referrals" element={<Protected><TraderCommunity /></Protected>} />
      <Route path="/settings" element={<Protected><TraderSettings /></Protected>} />
      <Route path="/developers" element={<Protected><DeveloperJourney /></Protected>} />

      {/* PUBLIC GUIDANCE / TRUST. These are informational Market surfaces. */}
      <Route path="/situations" element={<SituationsPage />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/help/articles" element={<HelpArticlesList />} />
      <Route path="/help/article/:slug" element={<HelpArticlePage />} />
      <Route path="/ask-securepay" element={<AskSecurePayPage />} />
      <Route path="/ask" element={<AskSecurePayPage />} />
      <Route path="/trust" element={<TrustPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/legal" element={<LegalPage />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="/compliance" element={<CompliancePage />} />
      <Route path="/not-a-bank" element={<NotABankPage />} />

      {/* TRAINER. Intentional guided learning product. Every demo remains
          simulation-only and securePayFetch hard-blocks live API calls. */}
      <Route path="/trainer" element={<TrainerHome />} />
      <Route path="/trainer/session" element={<TrainerSession />} />
      <Route path="/trainer/map" element={<ExplorerMap />} />
      <Route path="/trainer/home" element={<Home reviewMode />} />
      <Route path="/trainer/signin" element={<SignIn previewMode />} />
      <Route path="/trainer/signup" element={<Signup previewMode />} />
      <Route path="/trainer/activate" element={<KSActivation previewMode />} />
      <Route path="/trainer/journeys" element={<PreviewJourneys />} />
      <Route path="/trainer/create" element={<CreateJourney previewMode />} />
      <Route path="/trainer/join" element={<PreviewJoiningPage />} />
      <Route path="/trainer/dashboard" element={<PreviewTraderHome />} />
      <Route path="/trainer/market" element={<PreviewMarketPage />} />
      <Route path="/trainer/agreement" element={<PreviewWorkspacePage />} />
      <Route path="/trainer/actions" element={<PreviewOperationalPage />} />
      <Route path="/trainer/store" element={<PreviewDigitalStore />} />
      <Route path="/trainer/money" element={<PreviewMoneyRooms />} />
      <Route path="/trainer/flows" element={<PreviewFlowCommunity />} />
      <Route path="/trainer/community" element={<PreviewFlowCommunity />} />
      <Route path="/trainer/recovery" element={<PreviewReviewRecovery />} />
      <Route path="/trainer/developers" element={<PreviewDeveloperJourney />} />
      <Route path="/trainer/help" element={<HelpCenter />} />
      <Route path="/trainer/settings" element={<ExplorerSettings />} />
      <Route path="/trainer/system" element={<PreviewSystemStates />} />
      <Route path="/trainer/responsive" element={<PreviewResponsiveCertification />} />
      <Route path="/trainer/themes" element={<PreviewMarketThemes />} />
      <Route path="/trainer/certification" element={<PreviewVisualCertification />} />

      {/* Legacy Explorer aliases remain safe and redirect into Trainer. */}
      <Route path="/explore" element={<Navigate to="/trainer" replace />} />
      <Route path="/explore/journeys" element={<Navigate to="/trainer" replace />} />
      <Route path="/explore/review" element={<Navigate to="/trainer/recovery" replace />} />
      <Route path="/explore/system" element={<Navigate to="/trainer/system" replace />} />
      <Route path="/explore/responsive" element={<Navigate to="/trainer/responsive" replace />} />
      <Route path="/explore/themes" element={<Navigate to="/trainer/themes" replace />} />
      <Route path="/explore/certification" element={<Navigate to="/trainer/certification" replace />} />

      {/* GAME. This is still the accepted Play-the-Market prototype. MW-13+
          will replace its local authority with the formal Game domain. */}
      <Route path="/game" element={<PlayMarketHome />} />
      <Route path="/game/market" element={<PlayMarketBoard />} />
      <Route path="/game/project/:projectId" element={<PlayMarketProject />} />
      <Route path="/game/leaderboard" element={<PlayMarketLeaderboard />} />

      {/* Legacy /play routes remain simulated and never gain Market API access. */}
      <Route path="/play" element={<PlayMarketHome />} />
      <Route path="/play/market" element={<PlayMarketBoard />} />
      <Route path="/play/project/:projectId" element={<PlayMarketProject />} />
      <Route path="/play/leaderboard" element={<PlayMarketLeaderboard />} />

      {/* REVIEW ROOM. Development/review surfaces remain separate from the
          real Market and are also classified as simulated by worldMode. */}
      {reviewEnabled && <>
        <Route path="/review" element={<ReviewGallery />} />
        <Route path="/preview/home" element={<Home reviewMode />} />
        <Route path="/preview/signin" element={<SignIn previewMode />} />
        <Route path="/preview/signup" element={<Signup previewMode />} />
        <Route path="/preview/activate" element={<KSActivation previewMode />} />
        <Route path="/preview/journeys" element={<PreviewJourneys />} />
        <Route path="/preview/create" element={<CreateJourney previewMode />} />
        <Route path="/preview/workspace" element={<PreviewWorkspacePage />} />
        <Route path="/preview/operational" element={<PreviewOperationalPage />} />
        <Route path="/preview/trader-home" element={<PreviewTraderHome />} />
        <Route path="/preview/market" element={<PreviewMarketPage />} />
        <Route path="/preview/joining" element={<PreviewJoiningPage />} />
        <Route path="/preview/store" element={<PreviewDigitalStore />} />
        <Route path="/preview/money" element={<PreviewMoneyRooms />} />
        <Route path="/preview/flows-community" element={<PreviewFlowCommunity />} />
        <Route path="/preview/review-recovery" element={<PreviewReviewRecovery />} />
        <Route path="/preview/developers" element={<PreviewDeveloperJourney />} />
        <Route path="/preview/help" element={<HelpCenter />} />
        <Route path="/preview/trust" element={<TrustPage />} />
        <Route path="/preview/system-states" element={<PreviewSystemStates />} />
        <Route path="/preview/responsive" element={<PreviewResponsiveCertification />} />
        <Route path="/preview/themes" element={<PreviewMarketThemes />} />
        <Route path="/preview/certification" element={<PreviewVisualCertification />} />
      </>}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>

    {world === 'market' && !isReviewSurface && <FloatingAssistant />}
    {world === 'trainer' && !isReviewSurface && <ExplorerDock />}
    {!isReviewSurface && <WorldSwitcher />}
  </div>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MarketAtmosphereProvider><AuthProvider><AppShell /></AuthProvider></MarketAtmosphereProvider>
    </BrowserRouter>
  </StrictMode>,
);
