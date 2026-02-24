import { useCurrentAccount } from '@mysten/dapp-kit';

export function FaucetSuiButton() {
  const account = useCurrentAccount();
  if (!account) return null;

  return (
    <a
      href="https://faucet.sui.io/"
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-lg bg-gradient-to-r from-blue-400 to-indigo-500 px-4 py-2 text-sm font-medium text-white hover:from-blue-500 hover:to-indigo-600 transition-all shadow-md"
    >
      💧 领取测试 SUI
    </a>
  );
}
