import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, GAME_ID, USDC_TYPE, USDC_UNIT, CLOCK_ID, CHOICE_LABELS } from '../constants';
import { getReferrer } from '../utils';

interface Props {
  minBet: number;
  maxBet: number;
  isBettingOpen: boolean;
}

export function BetPanel({ minBet, maxBet, isBettingOpen }: Props) {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [choice, setChoice] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const minBetUsdc = minBet / USDC_UNIT;
  const maxBetUsdc = maxBet > 0 ? maxBet / USDC_UNIT : 0;

  const handleBet = async () => {
    setError('');
    setSuccess('');
    if (choice === null) { setError('请先选择石头、布或剪刀'); return; }
    if (!amount || amount === '0') { setError('请输入下注金额'); return; }
    if (!account) { setError('请先连接钱包'); return; }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum < minBetUsdc) {
      setError(`最小下注 ${minBetUsdc} USDC`);
      return;
    }
    if (!Number.isInteger(amountNum)) {
      setError('下注金额必须为整数 USDC');
      return;
    }
    if (maxBetUsdc > 0 && amountNum > maxBetUsdc) {
      setError(`最大下注 ${maxBetUsdc} USDC`);
      return;
    }

    const amountRaw = BigInt(amountNum) * BigInt(USDC_UNIT);
    const referrer = getReferrer();

    try {
      // Get USDC coins
      const coins = await client.getCoins({ owner: account.address, coinType: USDC_TYPE });
      if (!coins.data.length) { setError('没有 USDC 代币'); return; }

      const tx = new Transaction();

      // Merge coins if needed and split exact amount
      const coinIds = coins.data.map(c => c.coinObjectId);
      let payCoin;
      if (coinIds.length === 1) {
        payCoin = tx.splitCoins(tx.object(coinIds[0]), [tx.pure.u64(amountRaw)]);
      } else {
        const primary = tx.object(coinIds[0]);
        if (coinIds.length > 1) {
          tx.mergeCoins(primary, coinIds.slice(1).map(id => tx.object(id)));
        }
        payCoin = tx.splitCoins(primary, [tx.pure.u64(amountRaw)]);
      }

      if (referrer) {
        tx.moveCall({
          target: `${PACKAGE_ID}::game::place_bet_with_referral`,
          typeArguments: [USDC_TYPE],
          arguments: [
            tx.object(GAME_ID),
            tx.object(CLOCK_ID),
            tx.pure.u8(choice),
            payCoin,
            tx.pure.address(referrer),
          ],
        });
      } else {
        tx.moveCall({
          target: `${PACKAGE_ID}::game::place_bet`,
          typeArguments: [USDC_TYPE],
          arguments: [
            tx.object(GAME_ID),
            tx.object(CLOCK_ID),
            tx.pure.u8(choice),
            payCoin,
          ],
        });
      }

      await signAndExecute({ transaction: tx });
      setSuccess(`下注成功！${CHOICE_LABELS[choice]} ${amountNum} USDC`);
      setAmount('');
      setChoice(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`下注失败: ${msg.slice(0, 100)}`);
    }
  };

  const choices = [
    { value: 0, label: '🪨', name: '石头' },
    { value: 1, label: '📄', name: '布' },
    { value: 2, label: '✂️', name: '剪刀' },
  ];

  const quickAmounts = [10, 50, 100];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 animate-slide-up">
      <h3 className="mb-3 text-base font-semibold">选择出拳</h3>
      <div className="mb-4 grid grid-cols-3 gap-3">
        {choices.map(c => (
          <button
            key={c.value}
            onClick={() => setChoice(c.value)}
            disabled={!isBettingOpen}
            className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-all
              ${choice === c.value
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 animate-pulse-glow'
                : 'border-[var(--border)] hover:border-[var(--accent)]/50'}
              ${!isBettingOpen ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="text-3xl">{c.label}</span>
            <span className="text-sm">{c.name}</span>
          </button>
        ))}
      </div>

      <h3 className="mb-2 text-base font-semibold">下注金额 (USDC)</h3>
      <div className="mb-3 flex gap-2">
        {quickAmounts.map(a => (
          <button
            key={a}
            onClick={() => setAmount(String(a))}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)] transition-colors"
          >
            {a}
          </button>
        ))}
      </div>
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder={`最小 ${minBetUsdc} USDC`}
        min={minBetUsdc}
        step={1}
        className="mb-4 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
      />

      {!account ? (
        <div className="text-center text-sm text-[var(--text-secondary)]">请先连接钱包</div>
      ) : (
        <button
          onClick={handleBet}
          disabled={!isBettingOpen || isPending}
          className={`w-full rounded-xl py-3 font-semibold text-white transition-all
            ${isBettingOpen && !isPending
              ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-[0.98]'
              : 'bg-gray-600 cursor-not-allowed'}`}
        >
          {isPending ? '提交中...' : !isBettingOpen ? '封盘中，等待开奖' : '确认下注'}
        </button>
      )}

      {error && <div className="mt-2 text-sm text-[var(--red)]">{error}</div>}
      {success && <div className="mt-2 text-sm text-[var(--green)]">{success}</div>}
    </div>
  );
}
