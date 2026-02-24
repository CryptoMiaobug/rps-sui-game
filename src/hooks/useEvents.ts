import { useSuiClient } from '@mysten/dapp-kit';
import { useCallback, useState } from 'react';
import { EVENT_TYPES, GAME_ID } from '../constants';
import type { SuiEvent, EventId } from '@mysten/sui/jsonRpc';

export interface BetPlacedEvent {
  game_id: string;
  user: string;
  round_target_ms: string;
  choice: number;
  amount: string;
  referrer: string | null;
}

export interface RoundRevealedEvent {
  game_id: string;
  round_target_ms: string;
  system_choice: number;
  next_target_ms: string;
  total_wagered: string;
  player_count: string;
}

export interface PayoutEvent {
  game_id: string;
  user: string;
  round_target_ms: string;
  payout_amount: string;
}

const filterByGame = (events: SuiEvent[]) =>
  events.filter((e) => {
    const p = e.parsedJson as Record<string, unknown>;
    return p.game_id === GAME_ID;
  });

export function useEvents() {
  const client = useSuiClient();
  const [loading, setLoading] = useState(false);

  const queryBetEvents = useCallback(
    async (opts?: { sender?: string; cursor?: EventId | null; limit?: number }) => {
      setLoading(true);
      try {
        const targetCount = opts?.limit ?? 50;
        let allEvents: SuiEvent[] = [];
        let nextCursor: EventId | null | undefined = opts?.cursor ?? undefined;
        let hasNextPage = true;

        while (allEvents.length < targetCount && hasNextPage) {
          const result = await client.queryEvents({
            query: { MoveEventType: EVENT_TYPES.BetPlaced },
            order: 'descending',
            cursor: nextCursor ?? undefined,
            limit: 100,
          });
          let events = filterByGame(result.data);
          if (opts?.sender) {
            events = events.filter((e: SuiEvent) => {
              const parsed = e.parsedJson as Record<string, unknown>;
              return parsed.user === opts.sender;
            });
          }
          allEvents = [...allEvents, ...events];
          nextCursor = result.nextCursor ?? null;
          hasNextPage = result.hasNextPage;
        }

        return {
          events: allEvents.slice(0, targetCount),
          nextCursor,
          hasNextPage,
        };
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const queryRoundRevealedEvents = useCallback(
    async (opts?: { cursor?: EventId | null; limit?: number }) => {
      setLoading(true);
      try {
        const result = await client.queryEvents({
          query: { MoveEventType: EVENT_TYPES.RoundRevealed },
          order: 'descending',
          cursor: opts?.cursor ?? undefined,
          limit: opts?.limit ?? 50,
        });
        const events = filterByGame(result.data);
        return { events, nextCursor: result.nextCursor, hasNextPage: result.hasNextPage };
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const queryPayoutEvents = useCallback(
    async (opts?: { sender?: string; cursor?: EventId | null; limit?: number }) => {
      setLoading(true);
      try {
        const distResult = await client.queryEvents({
          query: { MoveEventType: EVENT_TYPES.PayoutDistributed },
          order: 'descending',
          cursor: opts?.cursor ?? undefined,
          limit: opts?.limit ?? 100,
        });
        const claimResult = await client.queryEvents({
          query: { MoveEventType: EVENT_TYPES.UserClaimed },
          order: 'descending',
          limit: opts?.limit ?? 100,
        });
        let events = [...filterByGame(distResult.data), ...filterByGame(claimResult.data)];
        if (opts?.sender) {
          events = events.filter((e: SuiEvent) => {
            const parsed = e.parsedJson as Record<string, unknown>;
            return parsed.user === opts.sender;
          });
        }
        return { events, nextCursor: distResult.nextCursor, hasNextPage: distResult.hasNextPage };
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return { queryBetEvents, queryRoundRevealedEvents, queryPayoutEvents, loading };
}
