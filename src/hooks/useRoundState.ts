import { useSuiClientQuery } from '@mysten/dapp-kit';

export interface RoundState {
  target_ms: number;
  is_revealed: boolean;
  system_choice: number;
  rock_pool: string;
  paper_pool: string;
  scissors_pool: string;
  rock_shares: number;
  paper_shares: number;
  scissors_shares: number;
  distributed: boolean;
  user_bets_table_id: string;
}

function parseRoundFields(fields: Record<string, unknown>): RoundState {
  const f = fields as Record<string, unknown>;
  const rp = f.rock_pool as Record<string, unknown> | undefined;
  const rpFields = rp?.fields as Record<string, unknown> | undefined;
  const pp = f.paper_pool as Record<string, unknown> | undefined;
  const ppFields = pp?.fields as Record<string, unknown> | undefined;
  const sp = f.scissors_pool as Record<string, unknown> | undefined;
  const spFields = sp?.fields as Record<string, unknown> | undefined;
  const ubObj = f.user_bets as Record<string, unknown> | undefined;
  const ubFields = ubObj?.fields as Record<string, unknown> | undefined;

  return {
    target_ms: Number(f.target_ms),
    is_revealed: Boolean(f.is_revealed),
    system_choice: Number(f.system_choice),
    rock_pool: String(rpFields?.value ?? '0'),
    paper_pool: String(ppFields?.value ?? '0'),
    scissors_pool: String(spFields?.value ?? '0'),
    rock_shares: Number(f.rock_shares),
    paper_shares: Number(f.paper_shares),
    scissors_shares: Number(f.scissors_shares),
    distributed: Boolean(f.distributed),
    user_bets_table_id: String((ubFields?.id as Record<string, unknown>)?.id ?? ''),
  };
}

export function useRoundState(roundsTableId: string | undefined, targetMs: number | undefined) {
  const { data, isLoading, error, refetch } = useSuiClientQuery(
    'getDynamicFieldObject',
    {
      parentId: roundsTableId!,
      name: { type: 'u64', value: String(targetMs) },
    },
    {
      enabled: !!roundsTableId && !!targetMs,
      refetchInterval: 5000,
    }
  );

  let roundState: RoundState | null = null;
  if (data?.data?.content?.dataType === 'moveObject') {
    const outerFields = (data.data.content as unknown as { fields: Record<string, unknown> }).fields;
    const valueFields = (outerFields.value as Record<string, unknown>)?.fields as Record<string, unknown>;
    if (valueFields) {
      roundState = parseRoundFields(valueFields);
    }
  }

  return { roundState, isLoading, error, refetch };
}
