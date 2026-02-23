import { Link } from 'react-router-dom';
import type { PlayerStats } from '../hooks/usePlayerStats';
import { formatUsdc } from '../utils';

interface Props {
  stats: PlayerStats;
}

export function PlayerStatsCard({ stats }: Props) {
  const wagered = BigInt(stats.total_wagered);
  const won = BigInt(stats.total_won);
  const pnl = won - wagered;
  const totalGames = stats.win_count + stats.lose_count + stats.tie_count;
  const winRate = totalGames > 0 ? ((stats.win_count / totalGames) * 100).toFixed(1) : '0';

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 animate-slide-up">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">我的统计</h3>
        <Link
          to="/history/user"
          className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
        >
          查看详情 →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatItem label="参与期数" value={String(stats.total_bets)} />
        <StatItem label="总下注" value={`${formatUsdc(wagered)} USDC`} />
        <StatItem label="总赢得" value={`${formatUsdc(won)} USDC`} />
        <StatItem
          label="盈亏"
          value={`${pnl >= 0n ? '+' : ''}${formatUsdc(pnl)} USDC`}
          color={pnl >= 0n ? 'text-[var(--green)]' : 'text-[var(--red)]'}
        />
        <StatItem label="胜/负/平" value={`${stats.win_count}/${stats.lose_count}/${stats.tie_count}`} />
        <StatItem label="胜率" value={`${winRate}%`} />
        <StatItem label="当前连胜" value={String(stats.current_streak)} />
        <StatItem label="最高连胜" value={String(stats.max_streak)} />
      </div>
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
