import { Link } from 'react-router-dom';
import type { PlayerStats } from '../hooks/usePlayerStats';
import { formatUsdc } from '../utils';
import { useLang } from '../i18n';

interface Props {
  stats: PlayerStats;
  currentRoundWagered?: string;
  isCurrentRoundPending?: boolean;
}

export function PlayerStatsCard({ stats, currentRoundWagered, isCurrentRoundPending }: Props) {
  const { t } = useLang();
  const pendingWager = BigInt(currentRoundWagered || '0');
  const hasPending = isCurrentRoundPending && pendingWager > 0n;

  // Subtract current round from stats if it hasn't been revealed
  const adjustedBets = hasPending ? stats.total_bets - 1 : stats.total_bets;
  const adjustedWagered = hasPending ? BigInt(stats.total_wagered) - pendingWager : BigInt(stats.total_wagered);
  const won = BigInt(stats.total_won);
  const pnl = won - adjustedWagered;
  const totalGames = stats.win_count + stats.lose_count + stats.tie_count;
  const winRate = totalGames > 0 ? ((stats.win_count / totalGames) * 100).toFixed(1) : '0';

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 animate-slide-up">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">{t('player.title')}</h3>
        <Link
          to="/history/user"
          className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
        >
          {t('player.viewDetails')}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatItem label={t('player.settledRounds')} value={String(adjustedBets)} />
        <StatItem label={t('player.settledWager')} value={`${formatUsdc(adjustedWagered)} USDC`} />
        <StatItem label={t('player.totalWon')} value={`${formatUsdc(won)} USDC`} />
        <StatItem
          label={t('player.pnl')}
          value={`${pnl >= 0n ? '+' : ''}${formatUsdc(pnl)} USDC`}
          color={pnl >= 0n ? 'text-[var(--green)]' : 'text-[var(--red)]'}
        />
        <StatItem label={t('player.wlt')} value={`${stats.win_count}/${stats.lose_count}/${stats.tie_count}`} />
        <StatItem label={t('player.winRate')} value={`${winRate}%`} />
        <StatItem label={t('player.currentStreak')} value={String(stats.current_streak)} />
        <StatItem label={t('player.maxStreak')} value={String(stats.max_streak)} />
      </div>
      {hasPending && (
        <div className="mt-2 text-xs text-[var(--yellow)]">
          {t('player.pendingNote', formatUsdc(pendingWager))}
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] p-2">
      <div className="text-xs text-[var(--text-secondary)]">{label}</div>
      <div className={`text-sm font-medium ${color || ''}`}>{value}</div>
    </div>
  );
}
