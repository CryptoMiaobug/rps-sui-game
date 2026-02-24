import { useCurrentAccount } from '@mysten/dapp-kit';

export function FaucetSuiButton() {
  const account = useCurrentAccount();
  if (!account) return null;

  return (
    <a
      href="https://faucet.sui.io/"
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
    >
      💧 领取测试 SUI
    </a>
  );
}
