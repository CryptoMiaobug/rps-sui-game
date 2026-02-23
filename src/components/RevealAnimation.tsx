import { useState, useEffect } from 'react';
import { CHOICE_EMOJI, CHOICE_LABELS } from '../constants';
import { getWinnerLoser } from '../utils';

interface Props {
  systemChoice: number;
  onClose: () => void;
}

export function RevealAnimation({ systemChoice, onClose }: Props) {
  const [phase, setPhase] = useState<'shaking' | 'reveal' | 'done'>('shaking');
  const [displayChoice, setDisplayChoice] = useState(0);

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
        <div className="text-lg font-semibold text-[var(--text-secondary)]">系统出拳</div>
        <div className={`text-7xl ${phase === 'shaking' ? 'animate-shake' : 'animate-bounce-in'}`}>
          {phase === 'shaking' ? CHOICE_EMOJI[displayChoice] : CHOICE_EMOJI[systemChoice]}
        </div>
        {phase === 'done' && (
          <div className="animate-bounce-in text-center">
            <div className="text-xl font-bold">{CHOICE_LABELS[systemChoice]}</div>
            <div className="mt-2 text-sm text-[var(--green)]">
              🏆 赢家: {CHOICE_LABELS[winner]}
            </div>
            <button
              onClick={onClose}
              className="mt-4 rounded-lg bg-[var(--accent)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              关闭
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
