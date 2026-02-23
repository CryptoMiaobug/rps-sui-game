import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { CHOICE_LABELS } from '../constants';
import { formatTimestamp } from '../utils';
import type { SuiEvent, EventId } from '@mysten/sui/jsonRpc';

interface RoundRow {
  roundTargetMs: string;
  systemChoice: number;
  rockTotal: string;
  paperTotal: string;
  scissorsTotal: string;
  timestamp: string;
}

export function ProjectHistoryPage() {
  const { queryRoundRevealedEvents, loading } = useEvents();
  const [rounds, setRounds] = useState<RoundRow[]>([]);
  const [cursor, setCursor] = useState<EventId | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadData = useCallback(async () => {
    const result = await queryRoundRevealedEvents({ cursor, limit: 20 });
    const newRounds = result.events.map((e: SuiEvent) => {
      const p = e.parsedJson as Record<string, unknown>;
      return {
        roundTargetMs: String(p.round_target_ms),
        systemChoice: Number(p.system_choice),
        rockTotal: String(p.rock_total),
        paperTotal: String(p.paper_total),
        scissorsTotal: String(p.scissors_total),
        timestamp: e.timestampMs || '',
      };
    });
    setRounds(prev => cursor ? [...prev, ...newRounds] : newRounds);
    setCursor(result.nextCursor ?? null);
    setHasMore(result.hasNextPage);
  }, [cursor, queryRoundRevealedEvents]);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">项目历史记录</h2>
        <Link to="/" className="text-sm text-[var(--accent)]">← 返回</Link>
      </div>

      {loading && rounds.length === 0 && (
        <div className="text-center text-[var(--text-secondary)]">加载中...</div>
      )}

      <div className="space-y-3">
        {rounds.map((r, idx) => {
          const totalShares = BigInt(r.rockTotal) + BigInt(r.paperTotal) + BigInt(r.scissorsTotal);
          return (
            <div key={idx} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">
                  {formatTimestamp(Number(r.roundTargetMs))}
                </span>
                <span className="rounded bg-[var(--accent)]/20 px-2 py-0.5 text-xs text-[var(--accent)]">
                  系统: {CHOICE_LABELS[r.systemChoice]}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded bg-[var(--bg-secondary)] p-2 text-center">
                  <div className="text-xs text-[var(--text-secondary)]">🪨 石头</div>
                  <div>{r.rockTotal} 份</div>
                </div>
                <div className="rounded bg-[var(--bg-secondary)] p-2 text-center">
                  <div className="text-xs text-[var(--text-secondary)]">📄 布</div>
                  <div>{r.paperTotal} 份</div>
                </div>
                <div className="rounded bg-[var(--bg-secondary)] p-2 text-center">
                  <div className="text-xs text-[var(--text-secondary)]">✂️ 剪刀</div>
                  <div>{r.scissorsTotal} 份</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-[var(--text-secondary)]">
                总份额: {totalShares.toString()}
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => loadData()}
          disabled={loading}
          className="mt-4 w-full rounded-lg border border-[var(--border)] py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--accent)] transition-colors"
        >
          {loading ? '加载中...' : '加载更多'}
        </button>
      )}
    </div>
  );
}
