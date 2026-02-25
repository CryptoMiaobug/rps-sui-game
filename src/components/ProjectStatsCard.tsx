import { Link } from 'react-router-dom';
import type { GameState } from '../hooks/useGameState';
import { formatUsdc } from '../utils';
import { useLang } from '../i18n';

interface Props {
  game: GameState;
}

export function ProjectStatsCard({ game }: Props) {
  const { t } = useLang();

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 animate-slide-up">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">{t('project.title')}</h3>
        <Link
          to="/history/project"
          className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
        >
          {t('project.viewDetails')}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatItem label={t('project.totalRounds')} value={String(Math.max(0, game.total_rounds - 1))} />
        <StatItem label={t('project.totalVolume')} value={`${formatUsdc(game.total_volume)} USDC`} />
        <StatItem label={t('project.totalUsers')} value={String(game.total_users)} />
        <StatItem label={t('project.vault')} value={`${formatUsdc(game.vault)} USDC`} />
        <StatItem label={t('project.feeRate')} value={`${(game.fee_bps / 100).toFixed(1)}%`} />
        <StatItem label={t('project.roundCap')} value={`${formatUsdc(game.bet_cap)} USDC`} />
        <StatItem label={t('project.roundDuration')} value={t('project.minutes', game.round_duration_ms / 60000)} />
        <StatItem label={t('project.status')} value={game.is_paused ? t('project.paused') : t('project.running')} />
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
