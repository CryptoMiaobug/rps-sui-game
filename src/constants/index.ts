export const PACKAGE_ID = '0x403704dba69499bb153c88e37fe93bcd24e9869bad076f70c707fa542234704c';
export const GAME_ID = '0x0bd12c391ab20f73da1b9e1f54a44ceda5392af4ef2b114eb43dbbae79a9ff2f';
export const USDC_TYPE = '0xa9ab0f9ab0b2713ee7e1730dceca0768954e5ea2450b57e25a3c7115ad65a41b::usdc::USDC';
export const FAUCET_PACKAGE_ID = '0x7844cc910a7a94bb08c2119ac164863f7989bece1bb3382b4dd2bcfd7370fd26';
export const FAUCET_OBJECT_ID = '0x72d4743f8a204db8376ffb64ccc5c14349b159cac34d6d27f43a6a99d81ae906';
export const USDC_DECIMALS = 6;
export const USDC_UNIT = 1_000_000; // 10^6
export const SUI_NETWORK = 'testnet';
export const SUI_RPC = 'https://fullnode.testnet.sui.io:443';

export const CLOCK_ID = '0x0000000000000000000000000000000000000000000000000000000000000006';

export const CHOICE_ROCK = 0;
export const CHOICE_PAPER = 1;
export const CHOICE_SCISSORS = 2;

export const CHOICE_LABELS: Record<number, string> = {
  0: '🪨 石头',
  1: '📄 布',
  2: '✂️ 剪刀',
};

export const CHOICE_EMOJI: Record<number, string> = {
  0: '🪨',
  1: '📄',
  2: '✂️',
};

export const EVENT_TYPES = {
  BetPlaced: `${PACKAGE_ID}::game::BetPlaced`,
  RoundRevealed: `${PACKAGE_ID}::game::RoundRevealed`,
  PayoutDistributed: `${PACKAGE_ID}::game::PayoutDistributed`,
  UserClaimed: `${PACKAGE_ID}::game::UserClaimed`,
};

export const REFERRAL_KEY = 'rps_sui_referral';
