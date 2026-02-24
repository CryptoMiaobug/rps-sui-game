import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useUsdcBalance } from '../hooks/useUsdcBalance';
import { MintUsdcButton } from './MintUsdcButton';
import { FaucetSuiButton } from './FaucetSuiButton';
import { formatUsdc, shortenAddress } from '../utils';

export function Header() {
  const account = useCurrentAccount();
  const { balance } = useUsdcBalance(account?.address);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-primary)]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎮</span>
          <span className="text-lg font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">
            RPS-Sui
          </span>
        </div>
        <div className="flex items-center gap-3">
          {account && (
            <>
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-[var(--bg-card)] px-3 py-1.5 text-sm">
                <span className="text-[var(--text-secondary)]">{shortenAddress(account.address)}</span>
                <span className="text-[var(--green)]">{formatUsdc(balance)} USDC</span>
              </div>
              <MintUsdcButton />
              <FaucetSuiButton />
            </>
          )}
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
