import { useEffect, useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Link } from 'react-router-dom';
import { useReferral } from '../hooks/useReferral';
import { formatUsdc } from '../utils';

export function ReferralCard() {
  const account = useCurrentAccount();
  const { getMyReferral, loading } = useReferral();
  const [inviteCount, setInviteCount] = useState(0);
  const [inviteVolume, setInviteVolume] = useState(0n);

  useEffect(() => {
    if (!account) return;
    getMyReferral(account.address).then((info) => {
      setInviteCount(info.inviteCount);
      setInviteVolume(info.inviteVolume);
    });
  }, [account?.address]);

  if (!account) return null;

  const referralLink = `${window.location.origin}${window.location.pathname}?ref=${account.address}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 animate-slide-up">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">我的推荐</h3>
        <Link
          to="/leaderboard"
          className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
        >
          排行榜 →
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-[var(--text-secondary)]">加载中...</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-[var(--bg-secondary)] p-2">
            <div className="text-xs text-[var(--text-secondary)]">邀请人数</div>
            <div className="text-sm font-medium">{inviteCount}</div>
          </div>
          <div className="rounded-lg bg-[var(--bg-secondary)] p-2">
            <div className="text-xs text-[var(--text-secondary)]">邀请交易量</div>
            <div className="text-sm font-medium">{formatUsdc(inviteVolume)} USDC</div>
          </div>
        </div>
      )}

      <div className="mt-3">
        <div className="text-xs text-[var(--text-secondary)] mb-1">推荐链接</div>
        <div className="flex gap-2">
          <input
            readOnly
            value={referralLink}
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none truncate"
          />
          <button
            onClick={copyLink}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs hover:border-[var(--accent)] transition-colors"
          >
            复制
          </button>
        </div>
      </div>
    </div>
  );
}
