import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, GAME_ID, USDC_TYPE, USDC_UNIT, CLOCK_ID } from '../constants';
import { getReferrer } from '../utils';
import { useLang } from '../i18n';
import type { UserBets } from '../hooks/useUserBets';

interface Props {
  minBet: number;
  maxBet: number;
  isBettingOpen: boolean;
  userBets?: UserBets | null;
  remainingCap: bigint;
}

export function BetPanel({ minBet, maxBet, isBettingOpen, userBets, remainingCap }: Props) {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const { t } = useLang();
  const [choice, setChoice] = useState<number | null>(null);

  const choiceLabels: Record<number, string> = {
    0: t('choice.rock'),
    1: t('choice.paper'),
    2: t('choice.scissors'),
  };
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const minBetUsdc = minBet / USDC_UNIT;
  const maxBetUsdc = maxBet > 0 ? maxBet / USDC_UNIT : 0;

  // Determine if user already bet on a choice this round
  const existingChoice = userBets ? userBets.choice : null;

  const handleBet = async () => {
    setError('');
    setSuccess('');
    if (choice === null) { setError(t('bet.selectFirst')); return; }
    if (!amount || amount === '0') { setError(t('bet.enterAmount')); return; }
    if (!account) { setError(t('bet.connectWallet')); return; }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum < minBetUsdc) {
      setError(t('bet.minBet', minBetUsdc));
      return;
    }
    if (!Number.isInteger(amountNum)) {
      setError(t('bet.integerOnly'));
      return;
    }
    if (maxBetUsdc > 0 && amountNum > maxBetUsdc) {
      setError(t('bet.maxBet', maxBetUsdc));
      return;
    }
    const remainingUsdc = Number(remainingCap) / USDC_UNIT;
    if (amountNum > remainingUsdc) {
      setError(t('bet.exceedCap', remainingUsdc));
      return;
    }

    const amountRaw = BigInt(amountNum) * BigInt(USDC_UNIT);
    let referrer = getReferrer();

    try {
      // Validate referrer: must exist in player_stats, otherwise fallback to no referral
      if (referrer) {
        try {
          const game = await client.getObject({ id: GAME_ID, options: { showContent: true } });
          const fields = (game.data?.content as any)?.fields;
          const statsTableId = fields?.player_stats?.fields?.id?.id;
          if (statsTableId) {
            await client.getDynamicFieldObject({
              parentId: statsTableId,
              name: { type: 'address', value: referrer },
            });
          } else {
            referrer = null;
          }
        } catch {
          // Referrer not in player_stats, fallback to normal bet
          referrer = null;
        }
      }

      // Get USDC coins and check balance
      const coins = await client.getCoins({ owner: account.address, coinType: USDC_TYPE });
      if (!coins.data.length) { setError(t('bet.noUsdc')); return; }
      const totalBalance = coins.data.reduce((sum, c) => sum + BigInt(c.balance), 0n);
      if (totalBalance < amountRaw) {
        setError(t('bet.insufficientBalance', Number(totalBalance) / USDC_UNIT));
        return;
      }

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
      setSuccess(t('bet.success', choiceLabels[choice], amountNum));
      setAmount('');
      setChoice(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(t('bet.fail', msg.slice(0, 100)));
    }
  };

  const choices = [
    { value: 0, label: '🪨', name: t('bet.rock') },
    { value: 1, label: '📄', name: t('bet.paper') },
    { value: 2, label: '✂️', name: t('bet.scissors') },
  ];

  const quickAmounts = [10, 50, 100];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 animate-slide-up">
      <h3 className="mb-3 text-base font-semibold">{t('bet.selectMove')}</h3>
      <div className="mb-4 grid grid-cols-3 gap-3">
        {choices.map(c => {
          const locked = existingChoice !== null && existingChoice !== c.value;
          return (
            <button
              key={c.value}
              onClick={() => !locked && setChoice(c.value)}
              disabled={!isBettingOpen || locked}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-all
                ${choice === c.value || existingChoice === c.value
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 animate-pulse-glow'
                  : locked
                    ? 'border-[var(--border)] opacity-30 cursor-not-allowed'
                    : 'border-[var(--border)] hover:border-[var(--accent)]/50'}
                ${!isBettingOpen ? 'opacity-50 cursor-not-allowed' : locked ? '' : 'cursor-pointer'}`}
            >
              <span className="text-3xl">{c.label}</span>
              <span className="text-sm">{c.name}</span>
            </button>
          );
        })}
      </div>
      {existingChoice !== null && (
        <div className="mb-3 text-xs text-[var(--yellow)]">
          ⚠️ {t('bet.alreadyBet', choiceLabels[existingChoice])}
        </div>
      )}

      <h3 className="mb-2 text-base font-semibold">{t('bet.amountLabel')}</h3>
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
        placeholder={t('bet.placeholder', minBetUsdc)}
        min={minBetUsdc}
        step={1}
        className="mb-4 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
      />

      {!account ? (
        <div className="text-center text-sm text-[var(--text-secondary)]">{t('bet.connectFirst')}</div>
      ) : (
        <button
          onClick={handleBet}
          disabled={!isBettingOpen || isPending}
          className={`w-full rounded-xl py-3 font-semibold text-white transition-all shadow-md
            ${isBettingOpen && !isPending
              ? 'bg-blue-500 hover:bg-blue-600 active:scale-[0.98]'
              : 'bg-gray-400 cursor-not-allowed'}`}
        >
          {isPending ? t('bet.submitting') : !isBettingOpen ? t('bet.closed') : t('bet.confirm')}
        </button>
      )}

      {error && <div className="mt-2 text-sm text-[var(--red)]">{error}</div>}
      {success && <div className="mt-2 text-sm text-[var(--green)]">{success}</div>}
    </div>
  );
}
