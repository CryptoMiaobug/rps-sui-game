import { useSuiClientQuery } from '@mysten/dapp-kit';

export interface UserBets {
  rock_shares: number;
  paper_shares: number;
  scissors_shares: number;
  rock_amount: string;
  paper_amount: string;
  scissors_amount: string;
  total_wagered: string;
  claimed: boolean;
}

function parseUserBetsFields(fields: Record<string, unknown>): UserBets {
  const f = fields as Record<string, unknown>;
  return {
    rock_shares: Number(f.rock_shares),
    paper_shares: Number(f.paper_shares),
    scissors_shares: Number(f.scissors_shares),
    rock_amount: String(f.rock_amount || '0'),
    paper_amount: String(f.paper_amount || '0'),
    scissors_amount: String(f.scissors_amount || '0'),
    total_wagered: String(f.total_wagered || '0'),
    claimed: Boolean(f.claimed),
  };
}

export function useUserBets(userBetsTableId: string | undefined, userAddress: string | undefined) {
  const { data, isLoading, error, refetch } = useSuiClientQuery(
    'getDynamicFieldObject',
    {
      parentId: userBetsTableId!,
      name: { type: 'address', value: userAddress! },
    },
    {
      enabled: !!userBetsTableId && !!userAddress,
      refetchInterval: 5000,
    }
  );

  let userBets: UserBets | null = null;
  if (data?.data?.content?.dataType === 'moveObject') {
    const outerFields = (data.data.content as unknown as { fields: Record<string, unknown> }).fields;
    const valueFields = (outerFields.value as Record<string, unknown>)?.fields as Record<string, unknown> | undefined;
    if (valueFields) {
      userBets = parseUserBetsFields(valueFields);
    } else {
      // Sometimes the fields are directly on outerFields (no wrapper)
      userBets = parseUserBetsFields(outerFields);
    }
  }

  return { userBets, isLoading, error, refetch };
}
