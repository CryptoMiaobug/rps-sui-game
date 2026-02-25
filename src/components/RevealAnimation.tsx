import { useState, useEffect } from 'react';
import { CHOICE_EMOJI } from '../constants';
import { getWinnerLoser } from '../utils';
import { useLang } from '../i18n';

interface Props {
  systemChoice: number;
  onClose: () => void;
}

export function RevealAnimation({ systemChoice, onClose }: Props) {
  const [phase, setPhase] = useState<'shaking' | 'reveal' | 'done'>('shaking');
  const [displayChoice, setDisplayChoice] = useState(0);
  const { t } = useLang();

  const choiceLabels: Record<number, string> = {
    0: t('choice.rock'),
    1: t('choice.paper'),
    2: t('choice.scissors'),
  };

  useEffect(() => {
    if (phase !== 'shaking') return;
    const interval = setInterval(() => {
      setDisplayChoice(c => (c + 1) % 3);
    }, 150);
    const timer = setTimeout(() => {
      clearInterval(interval);
      setPhase('reveal');
    }, 2000);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [phase]);

  useEffect(() => {
    if (phase === 'reveal') {
      const timer = setTimeout(() => setPhase('done'), 500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const [winner] = getWinnerLoser(systemChoice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-[var(--bg-card)] p-8 border border-[var(--border)]" onClick={e => e.stopPropagation()}>
        <div className="text-lg font-semibold text-[var(--text-secondary)]">{t('reveal.systemMove')}</div>
        <div className={`text-7xl ${phase === 'shaking' ? 'animate-shake' : 'animate-bounce-in'}`}>
          {phase === 'shaking' ? CHOICE_EMOJI[displayChoice] : CHOICE_EMOJI[systemChoice]}
        </div>
        {phase === 'done' && (
          <div className="animate-bounce-in text-center">
            <div className="text-xl font-bold">{choiceLabels[systemChoice]}</div>
            <div className="mt-2 text-sm text-[var(--green)]">
              {t('reveal.winner', choiceLabels[winner])}
            </div>
            <button
              onClick={onClose}
              className="mt-4 rounded-lg bg-[var(--accent)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              {t('reveal.close')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
