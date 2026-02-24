import { useSuiClientQuery } from '@mysten/dapp-kit';

export interface RoundState {
  target_ms: number;
  is_revealed: boolean;
  system_choice: number;
  total_wagered: string;
  distributed: boolean;
  user_bets_table_id: string;
  bet_count: number;
}

function parseRoundFields(fields: Record<string, unknown>): RoundState {
  const f = fields as Record<string, unknown>;
  const ubObj = f.user_bets as Record<string, unknown> | undefined;
  const ubFields = ubObj?.fields as Record<string, unknown> | undefined;
  const betAddrs = f.bet_addresses as string[] | undefined;

  return {
    target_ms: Number(f.target_ms),
    is_revealed: Boolean(f.is_revealed),
    system_choice: Number(f.system_choice),
    total_wagered: String(f.total_wagered || '0'),
    distributed: Boolean(f.distributed),
    user_bets_table_id: String((ubFields?.id as Record<string, unknown>)?.id ?? ''),
    bet_count: Array.isArray(betAddrs) ? betAddrs.length : 0,
  };
}

export function useRoundState(roundsTableId: string | undefined, targetMs: number | undefined) {
  const enabled = !!roundsTableId && !!targetMs;
  const { data, isLoading, error, refetch } = useSuiClientQuery(
    'getDynamicFieldObject',
    {
      parentId: roundsTableId || '',
      name: { type: 'u64', value: String(targetMs || 0) },
    },
    {
      enabled,
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
