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

  if (!account) return null;

  const handleClaim = async () => {
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
            setMsg('✅ 领取成功！+10,000 USDC');
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
        disabled={loading}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
      >
        {loading ? '领取中...' : '🪙 领取测试 USDC'}
      </button>
      {msg && <span className="text-xs">{msg}</span>}
    </div>
  );
}
