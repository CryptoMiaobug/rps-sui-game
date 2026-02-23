export const PACKAGE_ID = '0x403704dba69499bb153c88e37fe93bcd24e9869bad076f70c707fa542234704c';
export const GAME_ID = '0x0bd12c391ab20f73da1b9e1f54a44ceda5392af4ef2b114eb43dbbae79a9ff2f';
export const USDC_TYPE = '0xa9ab0f9ab0b2713ee7e1730dceca0768954e5ea2450b57e25a3c7115ad65a41b::usdc::USDC';
export const USDC_PACKAGE_ID = '0xa9ab0f9ab0b2713ee7e1730dceca0768954e5ea2450b57e25a3c7115ad65a41b';
export const USDC_TREASURY_CAP = '0x10e31be9b39c053d43e6a9e3519f5c33a57c8c8f94020b577619a1b0732d895d';
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
