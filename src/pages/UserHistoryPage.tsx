import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useEvents } from '../hooks/useEvents';
import { CHOICE_LABELS, CHOICE_EMOJI, PACKAGE_ID, GAME_ID, USDC_TYPE } from '../constants';
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

interface RevealRow {
  roundTargetMs: string;
  systemChoice: number;
}

// 0=rock,1=paper,2=scissors
// win: rock>scissors, paper>rock, scissors>paper
function getResult(userChoice: number, systemChoice: number): 'win' | 'lose' | 'tie' {
  if (userChoice === systemChoice) return 'tie';
  if (
    (userChoice === 0 && systemChoice === 2) ||
    (userChoice === 1 && systemChoice === 0) ||
    (userChoice === 2 && systemChoice === 1)
  ) return 'win';
  return 'lose';
}

const RESULT_LABEL: Record<string, string> = {
  win: '🏆 胜',
  lose: '💀 负',
  tie: '🤝 平',
};

const RESULT_COLOR: Record<string, string> = {
  win: 'text-[var(--green)]',
  lose: 'text-[var(--red)]',
  tie: 'text-[var(--yellow)]',
};

export function UserHistoryPage() {
  const account = useCurrentAccount();
  const { queryBetEvents, queryPayoutEvents, queryRoundRevealedEvents, loading } = useEvents();
  const { mutateAsync: signAndExecute, isPending: claiming } = useSignAndExecuteTransaction();
  const [bets, setBets] = useState<BetRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [reveals, setReveals] = useState<RevealRow[]>([]);
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

    // Load round reveals
    const revealResult = await queryRoundRevealedEvents({ limit: 50 });
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
        ],
      });
      await signAndExecute({ transaction: tx });
      setClaimStatus(prev => ({ ...prev, [roundTargetMs]: 'claimed' }));
    } catch {
      setClaimStatus(prev => ({ ...prev, [roundTargetMs]: 'error' }));
    }
  };

  // Group bets by round
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
          const isCurrentRound = Number(roundMs) > Date.now();
          const systemChoice = revealMap.get(roundMs);
          const isRevealed = systemChoice !== undefined;

          // Get user's primary choice (the one with most amount)
          const userChoice = roundBets.reduce((best, b) =>
            BigInt(b.amount) > BigInt(best.amount) ? b : best
          ).choice;
          const result = isRevealed ? getResult(userChoice, systemChoice) : null;

          return (
            <div key={roundMs} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {formatTimestamp(Number(roundMs))}
                  </span>
                  {isRevealed && (
                    <span className="rounded bg-[var(--bg-secondary)] px-1.5 py-0.5 text-xs">
                      系统: {CHOICE_EMOJI[systemChoice]}
                    </span>
                  )}
                  {result && (
                    <span className={`text-xs font-semibold ${RESULT_COLOR[result]}`}>
                      {RESULT_LABEL[result]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isCurrentRound ? (
                    <span className="text-xs text-[var(--yellow)]">⏳ 进行中</span>
                  ) : hasPayout ? (
                    <span className="text-xs text-[var(--green)]">✅ 已领取</span>
                  ) : claimState === 'claimed' ? (
                    <span className="text-xs text-[var(--green)]">✅ 已领取</span>
                  ) : claimState === 'claiming' ? (
                    <span className="text-xs text-[var(--yellow)]">领取中...</span>
                  ) : isRevealed ? (
                    <button
                      onClick={() => handleClaim(roundMs)}
                      disabled={claiming}
                      className="rounded bg-[var(--accent)] px-2 py-1 text-xs text-white hover:bg-[var(--accent-hover)] transition-colors"
                    >
                      Claim
                    </button>
                  ) : (
                    <span className="text-xs text-[var(--text-secondary)]">等待开奖</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                {roundBets.map((b, i) => (
                  <span key={i} className="rounded bg-[var(--bg-secondary)] px-2 py-1">
                    {CHOICE_LABELS[b.choice]} {formatUsdc(b.amount)} USDC
                  </span>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-[var(--text-secondary)]">
                <span>总下注: {formatUsdc(totalWagered)} USDC</span>
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
