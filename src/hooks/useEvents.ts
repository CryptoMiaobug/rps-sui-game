import { useSuiClient } from '@mysten/dapp-kit';
import { useCallback, useState } from 'react';
import { EVENT_TYPES } from '../constants';
import type { SuiEvent, EventId } from '@mysten/sui/jsonRpc';

export interface BetPlacedEvent {
  user: string;
  round_target_ms: string;
  choice: number;
  amount: string;
  shares: string;
  referrer: string | null;
}

export interface RoundRevealedEvent {
  round_target_ms: string;
  system_choice: number;
  next_target_ms: string;
  rock_total: string;
  paper_total: string;
  scissors_total: string;
}

export interface PayoutEvent {
  user: string;
  round_target_ms: string;
  payout_amount: string;
}

export function useEvents() {
  const client = useSuiClient();
  const [loading, setLoading] = useState(false);

  const queryBetEvents = useCallback(
    async (opts?: { sender?: string; cursor?: EventId | null; limit?: number }) => {
      setLoading(true);
      try {
        const result = await client.queryEvents({
          query: { MoveEventType: EVENT_TYPES.BetPlaced },
          order: 'descending',
          cursor: opts?.cursor ?? undefined,
          limit: opts?.limit ?? 50,
        });
        let events = result.data;
        if (opts?.sender) {
          events = events.filter((e: SuiEvent) => {
            const parsed = e.parsedJson as Record<string, unknown>;
            return parsed.user === opts.sender;
          });
        }
        return { events, nextCursor: result.nextCursor, hasNextPage: result.hasNextPage };
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
        return { events: result.data, nextCursor: result.nextCursor, hasNextPage: result.hasNextPage };
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
        let events = [...distResult.data, ...claimResult.data];
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
