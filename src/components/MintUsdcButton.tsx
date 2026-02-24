import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { FAUCET_PACKAGE_ID, FAUCET_OBJECT_ID, CLOCK_ID } from '../constants';
import { useUsdcBalance } from '../hooks/useUsdcBalance';

export function MintUsdcButton() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const { refetch } = useUsdcBalance(account?.address);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const COOLDOWN_MS = 3_600_000; // 60 minutes
  const COOLDOWN_KEY_PREFIX = 'rps_faucet_last_claim_';

  const getCooldownKey = () => COOLDOWN_KEY_PREFIX + (account?.address || '');

  const getRemaining = () => {
    if (!account) return 0;
    const last = localStorage.getItem(getCooldownKey());
    if (!last) return 0;
    const elapsed = Date.now() - parseInt(last);
    return Math.max(0, COOLDOWN_MS - elapsed);
  };

  const [remaining, setRemaining] = useState(getRemaining());

  // Update countdown every second + reset on account change
  useState(() => {
    const timer = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(timer);
  });

  // Reset remaining when account changes
  const [prevAddr, setPrevAddr] = useState(account?.address);
  if (account?.address !== prevAddr) {
    setPrevAddr(account?.address);
    setRemaining(getRemaining());
    setMsg('');
  }

  if (!account) return null;

  const handleClaim = async () => {
    const rem = getRemaining();
    if (rem > 0) {
      const mins = Math.ceil(rem / 60000);
      setMsg(`⏰ 冷却中，还需等待 ${mins} 分钟`);
      setRemaining(rem);
      return;
    }

    setLoading(true);
    setMsg('');
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${FAUCET_PACKAGE_ID}::faucet::claim`,
        arguments: [
          tx.object(FAUCET_OBJECT_ID),
          tx.object(CLOCK_ID),
        ],
      });

      await signAndExecute(
        { transaction: tx },
        {
          onSuccess: async (result) => {
            await client.waitForTransaction({ digest: result.digest });
            refetch();
            localStorage.setItem(getCooldownKey(), String(Date.now()));
            setRemaining(COOLDOWN_MS);
            setMsg('✅ 领取成功！+50 USDC');
          },
        }
      );
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      if (errMsg.includes('24') || errMsg.includes('cooldown') || errMsg.includes('already')) {
        setMsg('⏰ 24小时内已领取，请稍后再试');
      } else {
        setMsg(`❌ ${errMsg.slice(0, 80)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleClaim}
        disabled={loading || remaining > 0}
        className="rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-2 text-sm font-medium text-white hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 transition-all shadow-md"
      >
        {loading ? '领取中...' : remaining > 0 ? `🪙 冷却中 (${Math.ceil(remaining / 60000)}分钟)` : '🪙 领取测试 USDC'}
      </button>
      {msg && <span className="text-xs">{msg}</span>}
    </div>
  );
}
