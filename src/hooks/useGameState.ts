import { useSuiClientQuery } from '@mysten/dapp-kit';
import { GAME_ID } from '../constants';

export interface GameState {
  round_duration_ms: number;
  buffer_ms: number;
  current_target_ms: number;
  fee_bps: number;
  min_bet: number;
  max_bet: number;
  bet_cap: number;
  is_paused: boolean;
  total_rounds: number;
  total_volume: string;
  total_users: number;
  vault: string;
  rounds_table_id: string;
  player_stats_table_id: string;
}

function parseFields(fields: Record<string, unknown>): GameState {
  const f = fields as Record<string, unknown>;
  const vaultObj = f.vault as Record<string, unknown> | undefined;
  const vaultFields = vaultObj?.fields as Record<string, unknown> | undefined;
  const roundsObj = f.rounds as Record<string, unknown> | undefined;
  const roundsFields = roundsObj?.fields as Record<string, unknown> | undefined;
  const psObj = f.player_stats as Record<string, unknown> | undefined;
  const psFields = psObj?.fields as Record<string, unknown> | undefined;

  return {
    round_duration_ms: Number(f.round_duration_ms),
    buffer_ms: Number(f.buffer_ms),
    current_target_ms: Number(f.current_target_ms),
    fee_bps: Number(f.fee_bps),
    min_bet: Number(f.min_bet),
    max_bet: Number(f.max_bet),
    bet_cap: Number(f.bet_cap),
    is_paused: Boolean(f.is_paused),
    total_rounds: Number(f.total_rounds),
    total_volume: String(f.total_volume || '0'),
    total_users: Number(f.total_users),
    vault: String(vaultFields?.value ?? '0'),
    rounds_table_id: String((roundsFields?.id as Record<string, unknown>)?.id ?? ''),
    player_stats_table_id: String((psFields?.id as Record<string, unknown>)?.id ?? ''),
  };
}

export function useGameState() {
  const { data, isLoading, error, refetch } = useSuiClientQuery('getObject', {
    id: GAME_ID,
    options: { showContent: true },
  }, { refetchInterval: 5000 });

  let gameState: GameState | null = null;
  if (data?.data?.content?.dataType === 'moveObject') {
    const fields = (data.data.content as unknown as { fields: Record<string, unknown> }).fields;
    gameState = parseFields(fields);
  }

  return { gameState, isLoading, error, refetch };
}
