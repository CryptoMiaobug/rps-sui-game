import { USDC_UNIT, GAME_ID } from '../constants';

export function formatUsdc(raw: bigint | number | string): string {
  const n = typeof raw === 'bigint' ? raw : BigInt(raw);
  const whole = n / BigInt(USDC_UNIT);
  const frac = n % BigInt(USDC_UNIT);
  if (frac === 0n) return whole.toLocaleString();
  const fracStr = frac.toString().padStart(6, '0').replace(/0+$/, '');
  return `${whole.toLocaleString()}.${fracStr}`;
}

export function shortenAddress(addr: string): string {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getReferrer(): string | null {
  return localStorage.getItem('rps_sui_referral');
}

export function setReferrer(addr: string) {
  if (!localStorage.getItem('rps_sui_referral')) {
    localStorage.setItem('rps_sui_referral', addr);
  }
}

export async function resolveReferralCode(client: any, code: string): Promise<string | null> {
  try {
    const game = await client.getObject({ id: GAME_ID, options: { showContent: true } });
    const fields = (game.data?.content as any)?.fields;
    if (!fields?.referral_codes?.fields?.id?.id) return null;
    const tableId = fields.referral_codes.fields.id.id;
    const result = await client.getDynamicFieldObject({
      parentId: tableId,
      name: { type: '0x0000000000000000000000000000000000000000000000000000000000000001::string::String', value: code },
    });
    if ((result as any).error) return null;
    if (result.data?.content) {
      return (result.data.content as any).fields?.value || null;
    }
    return null;
  } catch {
    return null;
  }
}

/** Given system_choice, return [winner, loser] */
export function getWinnerLoser(systemChoice: number): [number, number] {
  if (systemChoice === 0) return [1, 2]; // paper beats rock, scissors loses
  if (systemChoice === 1) return [2, 0]; // scissors beats paper, rock loses
  return [0, 1]; // rock beats scissors, paper loses
}

export function getUserRoundStatus(
  userBets: { rock_shares: number; paper_shares: number; scissors_shares: number },
  systemChoice: number
): 'win' | 'lose' | 'tie' | 'mixed' {
  const [winner, loser] = getWinnerLoser(systemChoice);
  const hasWin = getSharesForChoice(userBets, winner) > 0;
  const hasLose = getSharesForChoice(userBets, loser) > 0;
  if (hasWin && hasLose) return 'mixed';
  if (hasWin) return 'win';
  if (hasLose) return 'lose';
  return 'tie';
}

function getSharesForChoice(
  ub: { rock_shares: number; paper_shares: number; scissors_shares: number },
  choice: number
): number {
  if (choice === 0) return ub.rock_shares;
  if (choice === 1) return ub.paper_shares;
  return ub.scissors_shares;
}
