import { useEffect, useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Link } from 'react-router-dom';
import { useReferral } from '../hooks/useReferral';
import { PACKAGE_ID, GAME_ID, USDC_TYPE } from '../constants';
import { formatUsdc } from '../utils';
import { useLang } from '../i18n';

export function ReferralCard() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const { getMyReferral, loading } = useReferral();
  const { t } = useLang();
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
    if (code.length < 3) return t('referral.codeMin');
    if (code.length > 20) return t('referral.codeMax');
    if (!/^[a-z0-9_]+$/.test(code)) return t('referral.codeFormat');
    return null;
  };

  const checkCodeAvailable = async (code: string): Promise<boolean> => {
    try {
      const game = await client.getObject({ id: GAME_ID, options: { showContent: true } });
      const fields = (game.data?.content as any)?.fields;
      if (!fields?.referral_codes?.fields?.id?.id) return true;
      const tableId = fields.referral_codes.fields.id.id;
      const result = await client.getDynamicFieldObject({
        parentId: tableId,
        name: { type: '0x0000000000000000000000000000000000000000000000000000000000000001::string::String', value: code },
      });
      // If error (not found), code is available
      if ((result as any).error) return true;
      // If data exists, code is taken
      return !result.data;
    } catch {
      return true; // error = available
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
      if (!available) { setCodeError(t('referral.codeTaken')); return; }

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
      setCodeSuccess(t('referral.codeSuccess'));
      setCodeInput('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('26')) setCodeError(t('referral.alreadyRegistered'));
      else if (msg.includes('24')) setCodeError(t('referral.codeTakenErr'));
      else if (msg.includes('23')) setCodeError(t('referral.betFirst'));
      else setCodeError(t('referral.registerFail', msg.slice(0, 80)));
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
        <h3 className="text-base font-semibold">{t('referral.title')}</h3>
        <Link
          to="/leaderboard"
          className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
        >
          {t('referral.leaderboard')}
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-[var(--text-secondary)]">{t('referral.loading')}</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-[var(--bg-secondary)] p-2">
            <div className="text-xs text-[var(--text-secondary)]">{t('referral.inviteCount')}</div>
            <div className="text-sm font-medium">{inviteCount}</div>
          </div>
          <div className="rounded-lg bg-[var(--bg-secondary)] p-2">
            <div className="text-xs text-[var(--text-secondary)]">{t('referral.inviteVolume')}</div>
            <div className="text-sm font-medium">{formatUsdc(inviteVolume)} USDC</div>
          </div>
        </div>
      )}

      {/* Referral code registration */}
      {!myCode ? (
        <div className="mt-3">
          <div className="text-xs text-[var(--text-secondary)] mb-1">{t('referral.setCode')}</div>
          <div className="flex gap-2">
            <input
              value={codeInput}
              onChange={e => setCodeInput(e.target.value.toLowerCase())}
              placeholder={t('referral.codePlaceholder')}
              maxLength={20}
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
            />
            <button
              onClick={handleRegister}
              disabled={isPending || checkingCode}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs hover:border-[var(--accent)] transition-colors disabled:opacity-50"
            >
              {isPending || checkingCode ? '...' : t('referral.register')}
            </button>
          </div>
          {codeError && <div className="mt-1 text-xs text-[var(--red)]">{codeError}</div>}
          {codeSuccess && <div className="mt-1 text-xs text-[var(--green)]">{codeSuccess}</div>}
        </div>
      ) : (
        <div className="mt-3">
          <div className="text-xs text-[var(--text-secondary)] mb-1">{t('referral.myCode')}<span className="text-[var(--accent)]">{myCode}</span></div>
        </div>
      )}

      <div className="mt-3">
        <div className="text-xs text-[var(--text-secondary)] mb-1">{t('referral.link')}</div>
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
            {t('referral.copy')}
          </button>
        </div>
      </div>
    </div>
  );
}
