export const PACKAGE_ID = '0x2bd622e03d84ef22c21e4aa86ac02725e4b311183e8eedcea48f19bc13c023df';
export const GAME_ID = '0x1ae97a968f8e961a9e2a23a62cf6691f7fa528f1f3eaf947f1623802c733dae1';
export const USDC_TYPE = '0x8734cfd80b09d058d1596a8f282a769e42f9602d3db791238caf5b3254be1a05::usdc::USDC';
export const FAUCET_PACKAGE_ID = '0x83e481f8ce48a01ab76deea92224922d1557317be8a2cfc01389c33212ef2291';
export const FAUCET_OBJECT_ID = '0x8c56f083719057be2499a943d596b8ccdc3f5cefcf77aac1eff37b1b11715214';
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
