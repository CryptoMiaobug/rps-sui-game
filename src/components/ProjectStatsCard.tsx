import { Link } from 'react-router-dom';
import type { GameState } from '../hooks/useGameState';
import { formatUsdc } from '../utils';

interface Props {
  game: GameState;
}

export function ProjectStatsCard({ game }: Props) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 animate-slide-up">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">项目统计</h3>
        <Link
          to="/history/project"
          className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
        >
          查看详情 →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatItem label="总轮数" value={String(Math.max(0, game.total_rounds - 1))} />
        <StatItem label="总交易量" value={`${formatUsdc(game.total_volume)} USDC`} />
        <StatItem label="总用户数" value={String(game.total_users)} />
        <StatItem label="资金池" value={`${formatUsdc(game.vault)} USDC`} />
        <StatItem label="手续费率" value={`${(game.fee_bps / 100).toFixed(1)}%`} />
        <StatItem label="单轮上限" value={`${formatUsdc(game.bet_cap)} USDC`} />
        <StatItem label="轮次时长" value={`${game.round_duration_ms / 60000} 分钟`} />
        <StatItem label="状态" value={game.is_paused ? '⏸ 暂停' : '▶ 运行中'} />
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] p-2">
      <div className="text-xs text-[var(--text-secondary)]">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
