import { CountdownTimer } from './CountdownTimer';
import { formatUsdc, formatTimestamp } from '../utils';
import type { RoundState } from '../hooks/useRoundState';
import type { UserBets } from '../hooks/useUserBets';
import { CHOICE_EMOJI } from '../constants';
import { useLang } from '../i18n';

interface Props {
  round: RoundState;
  bufferMs: number;
  betCap: number;
  userBets: UserBets | null;
  userAddress: string | undefined;
}

export function RoundStatus({ round, bufferMs, betCap, userBets, userAddress }: Props) {
  const { t } = useLang();
  const totalWagered = BigInt(round.total_wagered);
  const remaining = BigInt(betCap) - totalWagered;

  const choiceLabels: Record<number, string> = {
    0: t('choice.rock'),
    1: t('choice.paper'),
    2: t('choice.scissors'),
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 animate-slide-up">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">{t('round.title')}</h3>
        <span className="text-xs text-[var(--text-secondary)]">
          {formatTimestamp(round.target_ms)}
        </span>
      </div>

      <CountdownTimer targetMs={round.target_ms} bufferMs={bufferMs} />

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] px-3 py-2">
          <span className="text-sm">{t('round.totalWagered')}</span>
          <span className="text-sm font-medium">{formatUsdc(totalWagered)} USDC</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] px-3 py-2">
          <span className="text-sm">{t('round.remaining')}</span>
          <span className="text-sm font-medium">{formatUsdc(remaining > 0n ? remaining : 0n)} USDC</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)] px-3 py-2">
          <span className="text-sm">{t('round.playerCount')}</span>
          <span className="text-sm font-medium">{round.bet_count}</span>
        </div>
        <div className="rounded-lg bg-[var(--bg-secondary)] px-3 py-2">
          <div className="text-xs text-[var(--text-secondary)] mb-1">{t('round.oddsRule')}</div>
          <div className="flex gap-3 text-xs">
            <span className="text-[var(--green)]">{t('round.win')}</span>
            <span className="text-[var(--yellow)]">{t('round.tie')}</span>
            <span className="text-[var(--red)]">{t('round.lose')}</span>
          </div>
        </div>
      </div>

      {userAddress && (
        <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
          <h4 className="mb-2 text-sm font-medium text-[var(--text-secondary)]">{t('round.myBets')}</h4>
          {userBets ? (
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded bg-[var(--accent)]/10 px-2 py-1">
                {CHOICE_EMOJI[userBets.choice]} {choiceLabels[userBets.choice]} {formatUsdc(userBets.amount)} USDC
              </span>
            </div>
          ) : (
            <span className="text-sm text-[var(--text-secondary)]">{t('round.notParticipated')}</span>
          )}
        </div>
      )}
    </div>
  );
}
