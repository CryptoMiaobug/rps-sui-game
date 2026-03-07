import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useEvents } from '../hooks/useEvents';
import { useGameState } from '../hooks/useGameState';
import { PACKAGE_ID, GAME_ID, USDC_TYPE, CLOCK_ID, CHOICE_EMOJI } from '../constants';
import { formatUsdc, formatTimestamp, formatCountdown } from '../utils';
import { useLang } from '../i18n';
import type { SuiEvent, EventId } from '@mysten/sui/jsonRpc';

interface BetRow {
  roundTargetMs: string;
  choice: number;
  amount: string;
  timestamp: string;
}

interface PayoutRow {
  roundTargetMs: string;
  payoutAmount: string;
  type: string;
}

interface RevealRow {
  roundTargetMs: string;
  systemChoice: number;
}

function getRoundResult(userChoice: number, systemChoice: number): 'win' | 'lose' | 'draw' {
  if (userChoice === systemChoice) return 'draw';
  if (
    (userChoice === 0 && systemChoice === 2) ||
    (userChoice === 1 && systemChoice === 0) ||
    (userChoice === 2 && systemChoice === 1)
  ) return 'win';
  return 'lose';
}

const RESULT_LABELS: Record<string, Record<string, string>> = {
  zh: { win: '🎉 赢了', lose: '😢 输了', draw: '🤝 平局' },
  en: { win: '🎉 Win', lose: '😢 Lose', draw: '🤝 Draw' },
};

export function UserHistoryPage() {
  const account = useCurrentAccount();
  const { queryBetEvents, queryPayoutEvents, queryRoundRevealedEvents, loading } = useEvents();
  const { gameState } = useGameState();
  const { mutateAsync: signAndExecute, isPending: claiming } = useSignAndExecuteTransaction();
  const { t, lang } = useLang();
  const [bets, setBets] = useState<BetRow[]>([]);
  const [now, setNow] = useState(Date.now());

  const choiceLabels: Record<number, string> = {
    0: t('choice.rock'),
    1: t('choice.paper'),
    2: t('choice.scissors'),
  };
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [reveals, setReveals] = useState<RevealRow[]>([]);
  const [cursor, setCursor] = useState<EventId | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [claimStatus, setClaimStatus] = useState<Record<string, string>>({});

  // Tick every second for countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = useCallback(async () => {
    if (!account) return;
    const betResult = await queryBetEvents({ sender: account.address, cursor, limit: 50 });
    const newBets = betResult.events.map((e: SuiEvent) => {
      const p = e.parsedJson as Record<string, unknown>;
      return {
        roundTargetMs: String(p.round_target_ms),
        choice: Number(p.choice),
        amount: String(p.amount),
        timestamp: e.timestampMs || '',
      };
    });
    setBets(prev => cursor ? [...prev, ...newBets] : newBets);
    setCursor(betResult.nextCursor ?? null);
    setHasMore(betResult.hasNextPage);

    const payoutResult = await queryPayoutEvents({ sender: account.address });
    const newPayouts = payoutResult.events.map((e: SuiEvent) => {
      const p = e.parsedJson as Record<string, unknown>;
      return {
        roundTargetMs: String(p.round_target_ms),
        payoutAmount: String(p.payout_amount),
        type: e.type?.includes('UserClaimed') ? 'claim' : 'distribute',
      };
    });
    setPayouts(newPayouts);

    // Fetch reveal events
    const revealResult = await queryRoundRevealedEvents({ limit: 100 });
    const newReveals = revealResult.events.map((e: SuiEvent) => {
      const p = e.parsedJson as Record<string, unknown>;
      return {
        roundTargetMs: String(p.round_target_ms),
        systemChoice: Number(p.system_choice),
      };
    });
    setReveals(newReveals);
  }, [account, cursor, queryBetEvents, queryPayoutEvents, queryRoundRevealedEvents]);

  useEffect(() => {
    loadData();
  }, [account?.address]);

  const handleClaim = async (roundTargetMs: string) => {
    if (!account) return;
    setClaimStatus(prev => ({ ...prev, [roundTargetMs]: 'claiming' }));
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::game::claim`,
        typeArguments: [USDC_TYPE],
        arguments: [
          tx.object(GAME_ID),
          tx.pure.u64(BigInt(roundTargetMs)),
          tx.object(CLOCK_ID),
        ],
      });
      await signAndExecute({ transaction: tx });
      setClaimStatus(prev => ({ ...prev, [roundTargetMs]: 'claimed' }));
    } catch {
      setClaimStatus(prev => ({ ...prev, [roundTargetMs]: 'error' }));
    }
  };

  const roundMap = new Map<string, BetRow[]>();
  bets.forEach(b => {
    const arr = roundMap.get(b.roundTargetMs) || [];
    arr.push(b);
    roundMap.set(b.roundTargetMs, arr);
  });

  const payoutMap = new Map<string, string>();
  payouts.forEach(p => payoutMap.set(p.roundTargetMs, p.payoutAmount));

  const revealMap = new Map<string, number>();
  reveals.forEach(r => revealMap.set(r.roundTargetMs, r.systemChoice));

  const distributeDelay = gameState?.distribute_delay_ms ?? 86400000;

  if (!account) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <p className="text-[var(--text-secondary)]">{t('userHistory.connectWallet')}</p>
        <Link to="/" className="mt-4 inline-block text-[var(--accent)]">{t('userHistory.backHome')}</Link>
      </div>
    );
  }

  const resultLabels = RESULT_LABELS[lang] || RESULT_LABELS.en;

  return (
    <div className="mx-auto max-w-4xl px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">{t('userHistory.title')}</h2>
        <Link to="/" className="text-sm text-[var(--accent)]">{t('userHistory.back')}</Link>
      </div>

      {loading && bets.length === 0 && (
        <div className="text-center text-[var(--text-secondary)]">{t('userHistory.loading')}</div>
      )}

      <div className="space-y-3">
        {Array.from(roundMap.entries()).map(([roundMs, roundBets]) => {
          const payout = payoutMap.get(roundMs);
          const totalWagered = roundBets.reduce((s, b) => s + BigInt(b.amount), 0n);
          const hasPayout = payout !== undefined;
          const claimState = claimStatus[roundMs];
          const choice = roundBets[0]?.choice;
          const isCurrentRound = gameState && Number(roundMs) >= gameState.current_target_ms;

          // Reveal info
          const systemChoice = revealMap.get(roundMs);
          const isRevealed = systemChoice !== undefined;
          const result = isRevealed ? getRoundResult(choice, systemChoice) : null;

          // Distribute timing
          const distributeAfterMs = Number(roundMs) + distributeDelay;
          const canClaim = now >= distributeAfterMs;
          const timeUntilClaim = distributeAfterMs - now;

          return (
            <div key={roundMs} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">
                  {formatTimestamp(Number(roundMs))}
                </span>
                <div className="flex items-center gap-2">
                  {/* Show result if revealed */}
                  {isRevealed && result && (
                    <span className={`text-xs font-medium ${
                      result === 'win' ? 'text-[var(--green)]' :
                      result === 'lose' ? 'text-[var(--red)]' :
                      'text-[var(--yellow)]'
                    }`}>
                      {resultLabels[result]}
                    </span>
                  )}

                  {/* Claim / status */}
                  {hasPayout ? (
                    <span className="text-xs text-[var(--green)]">{t('userHistory.claimed')}</span>
                  ) : claimState === 'claimed' ? (
                    <span className="text-xs text-[var(--green)]">{t('userHistory.claimed')}</span>
                  ) : claimState === 'claiming' ? (
                    <span className="text-xs text-[var(--yellow)]">{t('userHistory.claiming')}</span>
                  ) : isCurrentRound ? (
                    <span className="text-xs text-[var(--text-secondary)]">{t('userHistory.waitingReveal')}</span>
                  ) : !isRevealed ? (
                    <span className="text-xs text-[var(--text-secondary)]">{t('userHistory.waitingReveal')}</span>
                  ) : !canClaim ? (
                    <span className="text-xs text-[var(--text-secondary)]">
                      ⏳ {formatCountdown(timeUntilClaim)}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaim(roundMs)}
                      disabled={claiming}
                      className="rounded bg-[var(--accent)] px-2 py-1 text-xs text-white hover:bg-[var(--accent-hover)] transition-colors"
                    >
                      Claim
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded bg-[var(--bg-secondary)] px-2 py-1">
                  {choiceLabels[choice]} {formatUsdc(totalWagered)} USDC
                </span>
                {isRevealed && (
                  <span className="rounded bg-[var(--bg-secondary)] px-2 py-1">
                    vs {CHOICE_EMOJI[systemChoice]} {choiceLabels[systemChoice]}
                  </span>
                )}
              </div>
              <div className="mt-2 flex gap-4 text-xs text-[var(--text-secondary)]">
                <span>{t('userHistory.wager', formatUsdc(totalWagered))}</span>
                {hasPayout && <span>{t('userHistory.payout', formatUsdc(payout!))}</span>}
                {hasPayout && (
                  <span className={BigInt(payout!) >= totalWagered ? 'text-[var(--green)]' : 'text-[var(--red)]'}>
                    {t('userHistory.pnl', `${BigInt(payout!) >= totalWagered ? '+' : ''}${formatUsdc(BigInt(payout!) - totalWagered)}`)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => loadData()}
          disabled={loading}
          className="mt-4 w-full rounded-lg border border-[var(--border)] py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--accent)] transition-colors"
        >
          {loading ? t('userHistory.loading') : t('userHistory.loadMore')}
        </button>
      )}
    </div>
  );
}
