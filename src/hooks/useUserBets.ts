import { useSuiClientQuery } from '@mysten/dapp-kit';

export interface UserBets {
  choice: number;
  amount: string;
  claimed: boolean;
}

function parseUserBetsFields(fields: Record<string, unknown>): UserBets {
  const f = fields as Record<string, unknown>;
  return {
    choice: Number(f.choice),
    amount: String(f.amount || '0'),
    claimed: Boolean(f.claimed),
  };
}

export function useUserBets(userBetsTableId: string | undefined, userAddress: string | undefined) {
  const enabled = !!userBetsTableId && !!userAddress;
  const { data, isLoading, error, refetch } = useSuiClientQuery(
    'getDynamicFieldObject',
    {
      parentId: userBetsTableId || '',
      name: { type: 'address', value: userAddress || '' },
    },
    {
      enabled,
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
      userBets = parseUserBetsFields(outerFields);
    }
  }

  return { userBets, isLoading, error, refetch };
}
