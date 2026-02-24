import { useSuiClient } from '@mysten/dapp-kit';
import { useCallback, useState } from 'react';
import { EVENT_TYPES, GAME_ID } from '../constants';

export interface ReferralInfo {
  inviteCount: number;
  inviteVolume: bigint;
  invitees: Map<string, bigint>; // address → total wagered
}

export interface LeaderboardEntry {
  address: string;
  inviteCount: number;
  inviteVolume: bigint;
}

export function useReferral() {
  const client = useSuiClient();
  const [loading, setLoading] = useState(false);

  // Get my referral stats (fast: filter by referrer)
  const getMyReferral = useCallback(async (myAddress: string): Promise<ReferralInfo> => {
    setLoading(true);
    try {
      const invitees = new Map<string, bigint>();
      let cursor: any = undefined;
      let hasMore = true;

      while (hasMore) {
        const result = await client.queryEvents({
          query: { MoveEventType: EVENT_TYPES.BetPlaced },
          order: 'descending',
          cursor,
          limit: 100,
        });

        for (const e of result.data) {
          const p = e.parsedJson as Record<string, unknown>;
          if (p.game_id !== GAME_ID) continue;
          const ref = p.referrer as Record<string, unknown> | null;
          if (!ref) continue;
          // Option<address> in Sui events: { vec: [addr] } or { vec: [] }
          const vec = ref.vec as string[] | undefined;
          if (!vec || vec.length === 0) continue;
          const referrerAddr = vec[0];
          if (referrerAddr !== myAddress) continue;

          const user = p.user as string;
          const amount = BigInt(p.amount as string);
          const prev = invitees.get(user) || 0n;
          invitees.set(user, prev + amount);
        }

        cursor = result.nextCursor;
        hasMore = result.hasNextPage;
      }

      let inviteVolume = 0n;
      for (const vol of invitees.values()) {
        inviteVolume += vol;
      }

      return {
        inviteCount: invitees.size,
        inviteVolume,
        invitees,
      };
    } finally {
      setLoading(false);
    }
  }, [client]);

  // Get full leaderboard (slower: scan all events)
  const getLeaderboard = useCallback(async (): Promise<LeaderboardEntry[]> => {
    setLoading(true);
    try {
      const referrerMap = new Map<string, Map<string, bigint>>(); // referrer → (user → volume)
      let cursor: any = undefined;
      let hasMore = true;

      while (hasMore) {
        const result = await client.queryEvents({
          query: { MoveEventType: EVENT_TYPES.BetPlaced },
          order: 'descending',
          cursor,
          limit: 100,
        });

        for (const e of result.data) {
          const p = e.parsedJson as Record<string, unknown>;
          if (p.game_id !== GAME_ID) continue;
          const ref = p.referrer as Record<string, unknown> | null;
          if (!ref) continue;
          const vec = ref.vec as string[] | undefined;
          if (!vec || vec.length === 0) continue;
          const referrerAddr = vec[0];
          const user = p.user as string;
          const amount = BigInt(p.amount as string);

          if (!referrerMap.has(referrerAddr)) {
            referrerMap.set(referrerAddr, new Map());
          }
          const userMap = referrerMap.get(referrerAddr)!;
          const prev = userMap.get(user) || 0n;
          userMap.set(user, prev + amount);
        }

        cursor = result.nextCursor;
        hasMore = result.hasNextPage;
      }

      const entries: LeaderboardEntry[] = [];
      for (const [addr, userMap] of referrerMap) {
        let inviteVolume = 0n;
        for (const vol of userMap.values()) {
          inviteVolume += vol;
        }
        entries.push({
          address: addr,
          inviteCount: userMap.size,
          inviteVolume,
        });
      }

      entries.sort((a, b) => (b.inviteVolume > a.inviteVolume ? 1 : b.inviteVolume < a.inviteVolume ? -1 : 0));
      return entries;
    } finally {
      setLoading(false);
    }
  }, [client]);

  return { getMyReferral, getLeaderboard, loading };
}
