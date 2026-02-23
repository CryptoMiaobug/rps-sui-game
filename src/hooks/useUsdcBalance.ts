import { useSuiClientQuery } from '@mysten/dapp-kit';
import { USDC_TYPE } from '../constants';

export function useUsdcBalance(address: string | undefined) {
  const { data, isLoading, refetch } = useSuiClientQuery(
    'getBalance',
    { owner: address!, coinType: USDC_TYPE },
    { enabled: !!address, refetchInterval: 10000 }
  );

  return {
    balance: data?.totalBalance ?? '0',
    isLoading,
    refetch,
  };
}
