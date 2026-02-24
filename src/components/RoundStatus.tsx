import { CountdownTimer } from './CountdownTimer';
import { formatUsdc, formatTimestamp } from '../utils';
import type { RoundState } from '../hooks/useRoundState';
import type { UserBets } from '../hooks/useUserBets';
import { CHOICE_EMOJI, CHOICE_LABELS } from '../constants';

interface Props {
  round: RoundState;
  bufferMs: number;
  betCap: number;
  userBets: UserBets | null;
  userAddress: string | undefined;
}

export function RoundStatus({ round, bufferMs, betCap, userBets, userAddress }: Props) {
  const totalWagered = BigInt(round.total_wagered);
  const remaining = BigInt(betCap) - totalWagered;

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
        <div className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] px-3 py-2">
          <span className="text-sm">总下注额</span>
          <span className="text-sm font-medium">{formatUsdc(totalWagered)} USDC</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] px-3 py-2">
          <span className="text-sm">剩余额度</span>
          <span className="text-sm font-medium">{formatUsdc(remaining > 0n ? remaining : 0n)} USDC</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] px-3 py-2">
          <span className="text-sm">参与人数</span>
          <span className="text-sm font-medium">{round.bet_count}</span>
        </div>
        <div className="rounded-lg bg-[var(--bg-secondary)] px-3 py-2">
          <div className="text-xs text-[var(--text-secondary)] mb-1">赔率规则（下注时收取 2% 手续费）</div>
          <div className="flex gap-3 text-xs">
            <span className="text-[var(--green)]">赢：一倍奖励 + 本金</span>
            <span className="text-[var(--yellow)]">平：退回本金</span>
            <span className="text-[var(--red)]">输：没收本金</span>
          </div>
        </div>
      </div>

      {userAddress && (
        <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
          <h4 className="mb-2 text-sm font-medium text-[var(--text-secondary)]">我的下注</h4>
          {userBets ? (
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded bg-[var(--accent)]/10 px-2 py-1">
                {CHOICE_EMOJI[userBets.choice]} {CHOICE_LABELS[userBets.choice]} {formatUsdc(userBets.amount)} USDC
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
