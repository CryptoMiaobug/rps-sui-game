import { SuiClientProvider, WalletProvider, createNetworkConfig } from '@mysten/dapp-kit';
import { getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { UserHistoryPage } from './pages/UserHistoryPage';
import { ProjectHistoryPage } from './pages/ProjectHistoryPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { setReferrer, resolveReferralCode } from './utils';
import '@mysten/dapp-kit/dist/index.css';

const queryClient = new QueryClient();

const { networkConfig } = createNetworkConfig({
  testnet: { 
    url: getJsonRpcFullnodeUrl('testnet'),
    network: 'testnet' as const,
  },
});

import { useSuiClient } from '@mysten/dapp-kit';

function ReferralHandler() {
  const client = useSuiClient();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (!ref) return;
    if (ref.startsWith('0x')) {
      setReferrer(ref);
    } else {
      // Short code — resolve from chain
      resolveReferralCode(client, ref).then(addr => {
        if (addr) setReferrer(addr);
      });
    }
  }, []);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <HashRouter>
            <ReferralHandler />
            <div className="min-h-screen bg-[var(--bg-primary)]">
              <Header />
              <main className="pb-8">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/history/user" element={<UserHistoryPage />} />
                  <Route path="/history/project" element={<ProjectHistoryPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                </Routes>
              </main>
            </div>
          </HashRouter>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
