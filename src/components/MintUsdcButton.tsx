import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { USDC_PACKAGE_ID, USDC_TREASURY_CAP, USDC_UNIT } from '../constants';
import { useUsdcBalance } from '../hooks/useUsdcBalance';

export function MintUsdcButton() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const { refetch } = useUsdcBalance(account?.address);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  if (!account) return null;

  const handleMint = async () => {
    setLoading(true);
    setMsg('');
    try {
      const amount = 1000 * USDC_UNIT; // 1000 USDC
      const tx = new Transaction();
      tx.moveCall({
        target: `${USDC_PACKAGE_ID}::usdc::mint`,
        arguments: [
          tx.object(USDC_TREASURY_CAP),
          tx.pure.u64(amount),
          tx.pure.address(account.address),
        ],
      });

      await signAndExecute(
        { transaction: tx },
        {
          onSuccess: async (result) => {
            await client.waitForTransaction({ digest: result.digest });
            refetch();
            setMsg('✅ 领取成功！+1000 USDC');
          },
        }
      );
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      if (errMsg.includes('ObjectNotFound') || errMsg.includes('not owned')) {
        setMsg('❌ 仅限管理员钱包铸造');
      } else {
        setMsg(`❌ 失败: ${errMsg.slice(0, 60)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleMint}
        disabled={loading}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
      >
        {loading ? '铸造中...' : '🪙 领取测试 USDC'}
      </button>
      {msg && <span className="text-xs">{msg}</span>}
    </div>
  );
}
