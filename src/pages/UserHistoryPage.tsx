import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useEvents } from '../hooks/useEvents';
import { useGameState } from '../hooks/useGameState';
import { CHOICE_LABELS, PACKAGE_ID, GAME_ID, USDC_TYPE } from '../constants';
import { formatUsdc, formatTimestamp } from '../utils';
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

export function UserHistoryPage() {
  const account = useCurrentAccount();
  const { queryBetEvents, queryPayoutEvents, loading } = useEvents();
  const { gameState } = useGameState();
  const { mutateAsync: signAndExecute, isPending: claiming } = useSignAndExecuteTransaction();
  const [bets, setBets] = useState<BetRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [cursor, setCursor] = useState<EventId | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [claimStatus, setClaimStatus] = useState<Record<string, string>>({});

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
  }, [account, cursor, queryBetEvents, queryPayoutEvents]);

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

  if (!account) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <p className="text-[var(--text-secondary)]">请先连接钱包</p>
        <Link to="/" className="mt-4 inline-block text-[var(--accent)]">← 返回首页</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">我的历史记录</h2>
        <Link to="/" className="text-sm text-[var(--accent)]">← 返回</Link>
      </div>

      {loading && bets.length === 0 && (
        <div className="text-center text-[var(--text-secondary)]">加载中...</div>
      )}

      <div className="space-y-3">
        {Array.from(roundMap.entries()).map(([roundMs, roundBets]) => {
          const payout = payoutMap.get(roundMs);
          const totalWagered = roundBets.reduce((s, b) => s + BigInt(b.amount), 0n);
          const hasPayout = payout !== undefined;
          const claimState = claimStatus[roundMs];
          const choice = roundBets[0]?.choice;
          const isCurrentRound = gameState && Number(roundMs) >= gameState.current_target_ms;

          return (
            <div key={roundMs} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">
                  {formatTimestamp(Number(roundMs))}
                </span>
                <div className="flex items-center gap-2">
                  {hasPayout ? (
                    <span className="text-xs text-[var(--green)]">✅ 已领取</span>
                  ) : claimState === 'claimed' ? (
                    <span className="text-xs text-[var(--green)]">✅ 已领取</span>
                  ) : claimState === 'claiming' ? (
                    <span className="text-xs text-[var(--yellow)]">领取中...</span>
                  ) : isCurrentRound ? (
                    <span className="text-xs text-[var(--text-secondary)]">⏳ 等待开奖</span>
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
                  {CHOICE_LABELS[choice]} {formatUsdc(totalWagered)} USDC
                </span>
              </div>
              <div className="mt-2 flex gap-4 text-xs text-[var(--text-secondary)]">
                <span>下注: {formatUsdc(totalWagered)} USDC</span>
                {hasPayout && <span>派奖: {formatUsdc(payout!)} USDC</span>}
                {hasPayout && (
                  <span className={BigInt(payout!) >= totalWagered ? 'text-[var(--green)]' : 'text-[var(--red)]'}>
                    盈亏: {BigInt(payout!) >= totalWagered ? '+' : ''}{formatUsdc(BigInt(payout!) - totalWagered)}
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
          {loading ? '加载中...' : '加载更多'}
        </button>
      )}
    </div>
  );
}
