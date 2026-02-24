import { useSuiClientQuery } from '@mysten/dapp-kit';

export interface PlayerStats {
  total_bets: number;
  total_wagered: string;
  total_won: string;
  win_count: number;
  lose_count: number;
  tie_count: number;
  current_streak: number;
  max_streak: number;
}

function parsePlayerStatsFields(fields: Record<string, unknown>): PlayerStats {
  const f = fields as Record<string, unknown>;
  return {
    total_bets: Number(f.total_bets),
    total_wagered: String(f.total_wagered || '0'),
    total_won: String(f.total_won || '0'),
    win_count: Number(f.win_count),
    lose_count: Number(f.lose_count),
    tie_count: Number(f.tie_count),
    current_streak: Number(f.current_streak),
    max_streak: Number(f.max_streak),
  };
}

export function usePlayerStats(playerStatsTableId: string | undefined, userAddress: string | undefined) {
  const enabled = !!playerStatsTableId && !!userAddress;
  const { data, isLoading, error, refetch } = useSuiClientQuery(
    'getDynamicFieldObject',
    {
      parentId: playerStatsTableId || '',
      name: { type: 'address', value: userAddress || '' },
    },
    {
      enabled,
      refetchInterval: 10000,
    }
  );

  let playerStats: PlayerStats | null = null;
  if (data?.data?.content?.dataType === 'moveObject') {
    const outerFields = (data.data.content as unknown as { fields: Record<string, unknown> }).fields;
    const valueFields = (outerFields.value as Record<string, unknown>)?.fields as Record<string, unknown> | undefined;
    if (valueFields) {
      playerStats = parsePlayerStatsFields(valueFields);
    } else {
      playerStats = parsePlayerStatsFields(outerFields);
    }
  }

  return { playerStats, isLoading, error, refetch };
}
