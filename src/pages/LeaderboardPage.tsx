import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReferral, type LeaderboardEntry } from '../hooks/useReferral';
import { useSuiNS } from '../hooks/useSuiNS';
import { formatUsdc } from '../utils';

export function LeaderboardPage() {
  const { getLeaderboard, loading } = useReferral();
  const { resolveNames } = useSuiNS();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [nameMap, setNameMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    getLeaderboard().then(async (data) => {
      setEntries(data);
      const names = await resolveNames(data.map(e => e.address));
      setNameMap(names);
    });
  }, []);

  const displayAddr = (addr: string) => {
    const name = nameMap.get(addr);
    if (name) return name;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">推荐排行榜</h2>
        <Link to="/" className="text-sm text-[var(--accent)]">← 返回</Link>
      </div>

      {loading && entries.length === 0 && (
        <div className="text-center text-[var(--text-secondary)]">加载中...</div>
      )}

      {!loading && entries.length === 0 && (
        <div className="text-center text-[var(--text-secondary)]">暂无推荐数据</div>
      )}

      <div className="space-y-2">
        {entries.map((entry, idx) => (
          <div key={entry.address} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold
              ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                idx === 2 ? 'bg-orange-500/20 text-orange-500' :
                'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}>
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{displayAddr(entry.address)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{entry.inviteCount} 人</div>
              <div className="text-xs text-[var(--text-secondary)]">{formatUsdc(entry.inviteVolume)} USDC</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
