import 'leaflet/dist/leaflet.css';
import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { MarketAtmosphereBackdrop, MarketAtmosphereProvider } from './lib/marketAtmosphere';
import { SECUREPAY_EXPLORER_MODE } from './lib/explorerMode';
import RequireAuth from './routing/RequireAuth';
import FloatingAssistant from './components/FloatingAssistant';
import ExplorerDock from './components/ExplorerDock';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import Signup from './pages/Signup';
import KSActivation from './pages/KSActivation';
import KSProfile from './pages/KSProfile';
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
import ExplorerMap from './pages/ExplorerMap';
import ExplorerSettings from './pages/ExplorerSettings';
import PlayMarketHome from './pages/PlayMarketHome';
import PlayMarketBoard from './pages/PlayMarketBoard';
import PlayMarketProject from './pages/PlayMarketProject';
import PlayMarketLeaderboard from './pages/PlayMarketLeaderboard';

// Fixture-backed experience surfaces. In YUI v1 Explorer mode these are the
// canonical training rooms. When Explorer mode is disabled they remain local
// visual-review surfaces only.
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

function Protected({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}

function AppShell() {
  const location = useLocation();
  const reviewEnabled = import.meta.env.DEV || SECUREPAY_EXPLORER_MODE;
  const isReviewSurface = location.pathname === '/review' || location.pathname.startsWith('/preview/');

  return <div className={`sp-app-frame ${SECUREPAY_EXPLORER_MODE ? 'is-yui-v1-explorer' : ''}`}>
    <MarketAtmosphereBackdrop />
    <Routes>
      {/* PUBLIC MARKET ENTRANCE. The approved signed-out Home remains real in
          Explorer mode; all paths beyond it are safe training experiences. */}
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={SECUREPAY_EXPLORER_MODE ? <SignIn previewMode /> : <SignIn />} />
      <Route path="/signup" element={SECUREPAY_EXPLORER_MODE ? <Signup previewMode /> : <Signup />} />
      <Route path="/activate" element={SECUREPAY_EXPLORER_MODE ? <KSActivation previewMode /> : <KSActivation />} />
      <Route path="/activation" element={SECUREPAY_EXPLORER_MODE ? <KSActivation previewMode /> : <KSActivation />} />
      <Route path="/verify" element={SECUREPAY_EXPLORER_MODE ? <KSActivation previewMode /> : <KSActivation />} />
      <Route path="/ks/:ksId" element={SECUREPAY_EXPLORER_MODE ? <PreviewDigitalStore /> : <KSProfile />} />

      {/* CREATION AND JOINING. In Explorer mode these never create backend
          identity, agreement or financial truth. */}
      <Route path="/create" element={SECUREPAY_EXPLORER_MODE ? <CreateJourney previewMode /> : <CreateJourney />} />
      <Route path="/create/journey" element={SECUREPAY_EXPLORER_MODE ? <CreateJourney previewMode /> : <CreateJourney />} />
      <Route path="/securelink/join" element={SECUREPAY_EXPLORER_MODE ? <PreviewJoiningPage /> : <SecureLinkJoin />} />
      <Route path="/securelink/join/:token" element={SECUREPAY_EXPLORER_MODE ? <PreviewJoiningPage /> : <SecureLinkJoin />} />
      <Route path="/group/:slug" element={SECUREPAY_EXPLORER_MODE ? <PreviewJoiningPage /> : <PublicGroupSecureLink />} />

      {/* SIGNED-IN MARKET. YUI v1 intentionally opens these canonical URLs to
          fixture-backed experience rooms with no authentication or live API.
          Set VITE_SECUREPAY_EXPLORER_MODE=false to restore real auth gates. */}
      <Route path="/dashboard" element={SECUREPAY_EXPLORER_MODE ? <PreviewTraderHome /> : <Protected><SecurePayHome /></Protected>} />
      <Route path="/profile" element={SECUREPAY_EXPLORER_MODE ? <PreviewDigitalStore /> : <Protected><SecurePayHome /></Protected>} />
      <Route path="/market" element={SECUREPAY_EXPLORER_MODE ? <PreviewMarketPage /> : <Protected><MyMarket /></Protected>} />
      <Route path="/market/flows" element={SECUREPAY_EXPLORER_MODE ? <PreviewFlowCommunity /> : <Protected><MarketFlows /></Protected>} />
      <Route path="/market/statements" element={SECUREPAY_EXPLORER_MODE ? <PreviewMoneyRooms /> : <Protected><MarketStatements /></Protected>} />
      <Route path="/agreements" element={SECUREPAY_EXPLORER_MODE ? <PreviewMarketPage /> : <Protected><TraderAgreements /></Protected>} />
      <Route path="/agreements/:agreementId" element={SECUREPAY_EXPLORER_MODE ? <PreviewWorkspacePage /> : <Protected><AgreementDetailWorkspace /></Protected>} />
      <Route path="/actions" element={SECUREPAY_EXPLORER_MODE ? <PreviewOperationalPage /> : <Protected><TraderActionCentre /></Protected>} />
      <Route path="/money" element={SECUREPAY_EXPLORER_MODE ? <PreviewMoneyRooms /> : <Protected><MoneySpace /></Protected>} />
      <Route path="/community" element={SECUREPAY_EXPLORER_MODE ? <PreviewFlowCommunity /> : <Protected><TraderCommunity /></Protected>} />
      <Route path="/referrals" element={SECUREPAY_EXPLORER_MODE ? <PreviewFlowCommunity /> : <Protected><TraderCommunity /></Protected>} />
      <Route path="/settings" element={SECUREPAY_EXPLORER_MODE ? <ExplorerSettings /> : <Protected><TraderSettings /></Protected>} />
      <Route path="/developers" element={SECUREPAY_EXPLORER_MODE ? <PreviewDeveloperJourney /> : <Protected><DeveloperJourney /></Protected>} />

      {/* PUBLIC GUIDANCE / TRUST. */}
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

      {/* YUI v1 EXPLORER MAP. These routes are safe to keep in a dedicated
          training deployment even after the production money tap is enabled. */}
      {SECUREPAY_EXPLORER_MODE && <>
        <Route path="/explore" element={<ExplorerMap />} />
        <Route path="/explore/journeys" element={<PreviewJourneys />} />
        <Route path="/explore/review" element={<PreviewReviewRecovery />} />
        <Route path="/explore/system" element={<PreviewSystemStates />} />
        <Route path="/explore/responsive" element={<PreviewResponsiveCertification />} />
        <Route path="/explore/themes" element={<PreviewMarketThemes />} />
        <Route path="/explore/certification" element={<PreviewVisualCertification />} />
        <Route path="/play" element={<PlayMarketHome />} />
        <Route path="/play/market" element={<PlayMarketBoard />} />
        <Route path="/play/project/:projectId" element={<PlayMarketProject />} />
        <Route path="/play/leaderboard" element={<PlayMarketLeaderboard />} />
      </>}

      {/* REVIEW ROOM. Explorer builds retain this even outside Vite DEV so the
          same package can be deployed as a training/education environment. */}
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

    {!isReviewSurface && <FloatingAssistant />}
    {SECUREPAY_EXPLORER_MODE && <ExplorerDock />}
  </div>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MarketAtmosphereProvider><AuthProvider><AppShell /></AuthProvider></MarketAtmosphereProvider>
    </BrowserRouter>
  </StrictMode>,
);
