import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

const COOLDOWN_MS = 120_000; // 2 min local cooldown (server has its own)
const COOLDOWN_KEY = 'rps_sui_faucet_last_';

export function FaucetSuiButton() {
  const account = useCurrentAccount();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const getCooldownKey = () => COOLDOWN_KEY + (account?.address || '');

  const getRemaining = () => {
    if (!account) return 0;
    const last = localStorage.getItem(getCooldownKey());
    if (!last) return 0;
    return Math.max(0, COOLDOWN_MS - (Date.now() - parseInt(last)));
  };

  const [remaining, setRemaining] = useState(getRemaining());

  useState(() => {
    const timer = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(timer);
  });

  const [prevAddr, setPrevAddr] = useState(account?.address);
  if (account?.address !== prevAddr) {
    setPrevAddr(account?.address);
    setRemaining(getRemaining());
    setMsg('');
  }

  if (!account) return null;

  const handleClaim = async () => {
    if (getRemaining() > 0) {
      setMsg('⏰ 请稍后再试');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('https://faucet.testnet.sui.io/v2/gas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ FixedAmountRequest: { recipient: account.address } }),
      });
      if (res.ok) {
        localStorage.setItem(getCooldownKey(), String(Date.now()));
        setRemaining(COOLDOWN_MS);
        setMsg('✅ SUI 已到账');
      } else {
        const text = await res.text();
        if (text.includes('rate') || text.includes('limit')) {
          setMsg('⏰ 请求太频繁，稍后再试');
        } else {
          setMsg(`❌ ${text.slice(0, 60)}`);
        }
      }
    } catch (e: unknown) {
      setMsg(`❌ ${e instanceof Error ? e.message : '网络错误'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleClaim}
        disabled={loading || remaining > 0}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
      >
        {loading ? '领取中...' : remaining > 0 ? `💧 冷却中` : '💧 领取 SUI'}
      </button>
      {msg && <span className="text-xs">{msg}</span>}
    </div>
  );
}
