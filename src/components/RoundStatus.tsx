import { CountdownTimer } from './CountdownTimer';
import { formatUsdc, formatTimestamp } from '../utils';
import type { RoundState } from '../hooks/useRoundState';
import type { UserBets } from '../hooks/useUserBets';
import { CHOICE_EMOJI } from '../constants';

interface Props {
  round: RoundState;
  bufferMs: number;
  userBets: UserBets | null;
  userAddress: string | undefined;
}

export function RoundStatus({ round, bufferMs, userBets, userAddress }: Props) {
  const rockPool = BigInt(round.rock_pool);
  const paperPool = BigInt(round.paper_pool);
  const scissorsPool = BigInt(round.scissors_pool);
  const totalPool = rockPool + paperPool + scissorsPool;

  // Odds calculation
  const rockOdds = rockPool > 0n ? Number(rockPool + scissorsPool) / Number(rockPool) : null;
  const paperOdds = paperPool > 0n ? Number(paperPool + rockPool) / Number(paperPool) : null;
  const scissorsOdds = scissorsPool > 0n ? Number(scissorsPool + paperPool) / Number(scissorsPool) : null;

  const formatOdds = (odds: number | null) => odds === null ? '∞' : `${odds.toFixed(2)}x`;

  const pools = [
    { label: '🪨 石头', pool: rockPool, shares: round.rock_shares, odds: rockOdds },
    { label: '📄 布', pool: paperPool, shares: round.paper_shares, odds: paperOdds },
    { label: '✂️ 剪刀', pool: scissorsPool, shares: round.scissors_shares, odds: scissorsOdds },
  ];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 animate-slide-up">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">当前轮次</h3>
        <span className="text-xs text-[var(--text-secondary)]">
          {formatTimestamp(round.target_ms)}
        </span>
      </div>

      <CountdownTimer targetMs={round.target_ms} bufferMs={bufferMs} />

      <div className="mt-4 space-y-2">
        {pools.map((p, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">{p.label}</span>
              <span className="text-xs text-[var(--text-secondary)]">({p.shares} 份)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{formatUsdc(p.pool)} USDC</span>
              <span className="rounded bg-[var(--accent)]/20 px-2 py-0.5 text-xs text-[var(--accent)]">
                {formatOdds(p.odds)}
              </span>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-2">
          <span className="text-sm font-medium">总池</span>
          <span className="text-sm font-bold">{formatUsdc(totalPool)} USDC</span>
        </div>
      </div>

      {userAddress && (
        <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
          <h4 className="mb-2 text-sm font-medium text-[var(--text-secondary)]">我的下注</h4>
          {userBets ? (
            <div className="flex flex-wrap gap-3 text-sm">
              {[
                { choice: 0, amount: userBets.rock_amount },
                { choice: 1, amount: userBets.paper_amount },
                { choice: 2, amount: userBets.scissors_amount },
              ].filter(b => BigInt(b.amount) > 0n).map(b => (
                <span key={b.choice} className="rounded bg-[var(--accent)]/10 px-2 py-1">
                  {CHOICE_EMOJI[b.choice]} {formatUsdc(b.amount)} USDC
                </span>
              ))}
              <span className="text-[var(--text-secondary)]">
                总计: {formatUsdc(userBets.total_wagered)} USDC
              </span>
            </div>
          ) : (
            <span className="text-sm text-[var(--text-secondary)]">本期未参与</span>
          )}
        </div>
      )}
    </div>
  );
}
