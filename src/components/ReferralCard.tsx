import { useEffect, useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Link } from 'react-router-dom';
import { useReferral } from '../hooks/useReferral';
import { PACKAGE_ID, GAME_ID, USDC_TYPE } from '../constants';
import { formatUsdc } from '../utils';

export function ReferralCard() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const { getMyReferral, loading } = useReferral();
  const [inviteCount, setInviteCount] = useState(0);
  const [inviteVolume, setInviteVolume] = useState(0n);
  const [myCode, setMyCode] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');
  const [checkingCode, setCheckingCode] = useState(false);

  useEffect(() => {
    if (!account) return;
    getMyReferral(account.address).then((info) => {
      setInviteCount(info.inviteCount);
      setInviteVolume(info.inviteVolume);
    });
    // Check if user already has a code
    loadMyCode(account.address);
  }, [account?.address]);

  const loadMyCode = async (address: string) => {
    try {
      const game = await client.getObject({ id: GAME_ID, options: { showContent: true } });
      const fields = (game.data?.content as any)?.fields;
      if (!fields?.player_referral_code?.fields?.id?.id) return;
      const tableId = fields.player_referral_code.fields.id.id;
      const result = await client.getDynamicFieldObject({
        parentId: tableId,
        name: { type: 'address', value: address },
      });
      if (result.data?.content) {
        const val = (result.data.content as any).fields?.value;
        if (val) setMyCode(val);
      }
    } catch {
      // No code registered yet
    }
  };

  const validateCode = (code: string): string | null => {
    if (code.length < 3) return '推荐码至少3个字符';
    if (code.length > 20) return '推荐码最多20个字符';
    if (!/^[a-z0-9_]+$/.test(code)) return '只能用小写字母、数字和下划线';
    return null;
  };

  const checkCodeAvailable = async (code: string): Promise<boolean> => {
    try {
      const game = await client.getObject({ id: GAME_ID, options: { showContent: true } });
      const fields = (game.data?.content as any)?.fields;
      if (!fields?.referral_codes?.fields?.id?.id) return true;
      const tableId = fields.referral_codes.fields.id.id;
      await client.getDynamicFieldObject({
        parentId: tableId,
        name: { type: '0x0000000000000000000000000000000000000000000000000000000000000001::string::String', value: code },
      });
      return false; // found = taken
    } catch {
      return true; // not found = available
    }
  };

  const handleRegister = async () => {
    setCodeError('');
    setCodeSuccess('');
    const code = codeInput.toLowerCase().trim();
    setCodeInput(code);

    const err = validateCode(code);
    if (err) { setCodeError(err); return; }

    setCheckingCode(true);
    try {
      const available = await checkCodeAvailable(code);
      if (!available) { setCodeError('推荐码已被占用'); return; }

      const tx = new Transaction();
      const encoder = new TextEncoder();
      const codeBytes = Array.from(encoder.encode(code));
      tx.moveCall({
        target: `${PACKAGE_ID}::game::register_referral_code`,
        typeArguments: [USDC_TYPE],
        arguments: [
          tx.object(GAME_ID),
          tx.pure.vector('u8', codeBytes),
        ],
      });
      await signAndExecute({ transaction: tx });
      setMyCode(code);
      setCodeSuccess('推荐码注册成功！');
      setCodeInput('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('26')) setCodeError('你已经注册过推荐码了');
      else if (msg.includes('24')) setCodeError('推荐码已被占用');
      else if (msg.includes('23')) setCodeError('请先下注一次再注册推荐码');
      else setCodeError(`注册失败: ${msg.slice(0, 80)}`);
    } finally {
      setCheckingCode(false);
    }
  };

  if (!account) return null;

  const referralLink = myCode
    ? `${window.location.origin}${window.location.pathname}?ref=${myCode}`
    : `${window.location.origin}${window.location.pathname}?ref=${account.address}`;

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

      {/* Referral code registration */}
      {!myCode ? (
        <div className="mt-3">
          <div className="text-xs text-[var(--text-secondary)] mb-1">设置推荐码（一次性，不可修改）</div>
          <div className="flex gap-2">
            <input
              value={codeInput}
              onChange={e => setCodeInput(e.target.value.toLowerCase())}
              placeholder="3-20位，小写字母/数字/下划线"
              maxLength={20}
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
            />
            <button
              onClick={handleRegister}
              disabled={isPending || checkingCode}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs hover:border-[var(--accent)] transition-colors disabled:opacity-50"
            >
              {isPending || checkingCode ? '...' : '注册'}
            </button>
          </div>
          {codeError && <div className="mt-1 text-xs text-[var(--red)]">{codeError}</div>}
          {codeSuccess && <div className="mt-1 text-xs text-[var(--green)]">{codeSuccess}</div>}
        </div>
      ) : (
        <div className="mt-3">
          <div className="text-xs text-[var(--text-secondary)] mb-1">我的推荐码: <span className="text-[var(--accent)]">{myCode}</span></div>
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
