import { useState, useEffect } from 'react';
import { formatCountdown } from '../utils';

interface Props {
  targetMs: number;
  bufferMs: number;
}

export function CountdownTimer({ targetMs, bufferMs }: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeToReveal = targetMs - now;
  const timeToBetting = targetMs - bufferMs - now;

  let status: 'betting' | 'buffer' | 'revealing';
  let statusLabel: string;
  let statusColor: string;

  if (timeToBetting > 0) {
    status = 'betting';
    statusLabel = '🟢 下注中';
    statusColor = 'text-[var(--green)]';
  } else if (timeToReveal > 0) {
    status = 'buffer';
    statusLabel = '🟡 封盘中';
    statusColor = 'text-[var(--yellow)]';
  } else {
    status = 'revealing';
    statusLabel = '🔴 等待开奖';
    statusColor = 'text-[var(--red)]';
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-sm font-medium ${statusColor}`}>{statusLabel}</span>
      {status === 'betting' && (
        <div className="text-center">
          <div className="text-xs text-[var(--text-secondary)]">下注截止倒计时</div>
          <div className="text-2xl font-mono font-bold tabular-nums">{formatCountdown(timeToBetting)}</div>
        </div>
      )}
      {status === 'buffer' && (
        <div className="text-center">
          <div className="text-xs text-[var(--text-secondary)]">开奖倒计时</div>
          <div className="text-2xl font-mono font-bold tabular-nums">{formatCountdown(timeToReveal)}</div>
        </div>
      )}
      {status === 'revealing' && (
        <div className="text-xs text-[var(--text-secondary)]">等待链上开奖...</div>
      )}
    </div>
  );
}
