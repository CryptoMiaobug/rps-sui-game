import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Lang = 'zh' | 'en';

const translations = {
  zh: {
    // Header
    // (no hardcoded Chinese in Header besides sub-components)

    // BetPanel
    'bet.selectFirst': '请先选择石头、布或剪刀',
    'bet.enterAmount': '请输入下注金额',
    'bet.connectWallet': '请先连接钱包',
    'bet.integerOnly': '下注金额必须为整数 USDC',
    'bet.minBet': '最小下注 {0} USDC',
    'bet.maxBet': '最大下注 {0} USDC',
    'bet.exceedCap': '超出本轮剩余额度，最多还能下 {0} USDC',
    'bet.noUsdc': '没有 USDC 代币',
    'bet.insufficientBalance': 'USDC 余额不足，当前 {0} USDC',
    'bet.success': '下注成功！{0} {1} USDC',
    'bet.fail': '下注失败: {0}',
    'bet.selectMove': '选择出拳',
    'bet.rock': '石头',
    'bet.paper': '布',
    'bet.scissors': '剪刀',
    'bet.alreadyBet': '本轮已下注 {0}，只能加注同一选择',
    'bet.amountLabel': '下注金额 (USDC)',
    'bet.placeholder': '最小 {0} USDC',
    'bet.connectFirst': '请先连接钱包',
    'bet.submitting': '提交中...',
    'bet.closed': '封盘中，等待开奖',
    'bet.confirm': '确认下注',

    // CountdownTimer
    'timer.betting': '🟢 下注中',
    'timer.buffer': '🟡 封盘中',
    'timer.revealing': '🔴 等待开奖',
    'timer.bettingDeadline': '下注截止倒计时',
    'timer.revealCountdown': '开奖倒计时',
    'timer.waitingChain': '等待链上开奖...',

    // MintUsdcButton
    'mint.success': '✅ 领取成功！+50 USDC',
    'mint.alreadyClaimed': '⏰ 24小时内已领取，请稍后再试',
    'mint.cooldown': '⏰ 冷却中，还需等待 {0} 分钟',
    'mint.claiming': '领取中...',
    'mint.cooldownBtn': '🪙 冷却中 ({0}分钟)',
    'mint.claim': '🪙 领取测试 USDC',

    // ProjectStatsCard
    'project.title': '项目统计',
    'project.viewDetails': '查看详情 →',
    'project.totalRounds': '总轮数',
    'project.totalVolume': '总交易量',
    'project.totalUsers': '总用户数',
    'project.vault': '资金池',
    'project.feeRate': '手续费率',
    'project.roundCap': '单轮上限',
    'project.roundDuration': '轮次时长',
    'project.minutes': '{0} 分钟',
    'project.status': '状态',
    'project.paused': '⏸ 暂停',
    'project.running': '▶ 运行中',

    // PlayerStatsCard
    'player.title': '我的统计',
    'player.viewDetails': '查看详情 →',
    'player.settledRounds': '已结算期数',
    'player.settledWager': '已结算下注',
    'player.totalWon': '总赢得',
    'player.pnl': '盈亏',
    'player.wlt': '胜/负/平',
    'player.winRate': '胜率',
    'player.currentStreak': '当前连胜',
    'player.maxStreak': '最高连胜',
    'player.pendingNote': '⏳ 当前轮次下注 {0} USDC 待结算，未计入统计',

    // ReferralCard
    'referral.title': '我的推荐',
    'referral.leaderboard': '排行榜 →',
    'referral.loading': '加载中...',
    'referral.inviteCount': '邀请人数',
    'referral.inviteVolume': '邀请交易量',
    'referral.setCode': '设置推荐码（一次性，不可修改）',
    'referral.codePlaceholder': '3-20位，小写字母/数字/下划线',
    'referral.register': '注册',
    'referral.codeMin': '推荐码至少3个字符',
    'referral.codeMax': '推荐码最多20个字符',
    'referral.codeFormat': '只能用小写字母、数字和下划线',
    'referral.codeTaken': '推荐码已被占用',
    'referral.codeSuccess': '推荐码注册成功！',
    'referral.alreadyRegistered': '你已经注册过推荐码了',
    'referral.codeTakenErr': '推荐码已被占用',
    'referral.betFirst': '请先下注一次再注册推荐码',
    'referral.registerFail': '注册失败: {0}',
    'referral.myCode': '我的推荐码: ',
    'referral.link': '推荐链接',
    'referral.copy': '复制',

    // GuideCard
    'guide.showGuide': '📖 查看游戏指南',
    'guide.title': '📖 新手指南',
    'guide.collapse': '收起 ✕',
    'guide.step1Title': '连接钱包',
    'guide.step1Desc': '— 点击右上角「Connect Wallet」连接 Sui 钱包（注意切换到测试网 Testnet）',
    'guide.step2Title': '领取测试币',
    'guide.step2Desc': '— 没有 SUI？点击「💧 领取 SUI」获取 Gas 费；再点「🪙 领取测试 USDC」获取下注代币',
    'guide.step3Title': '下注',
    'guide.step3Desc': '— 选择石头 ✊、布 ✋ 或剪刀 ✌️，输入金额（整数 USDC），每轮开奖前 5 分钟截止',
    'guide.step4Title': '开奖 & 赔付',
    'guide.step4Desc': '— 每小时整点自动开奖，系统随机出拳，奖金自动发放',
    'guide.step5Title': '邀请返利',
    'guide.step5Desc': '— 下注一次后可注册专属推荐码，分享链接邀请好友，推荐数据实时统计',
    'guide.disclaimer': '🔗 本游戏完全运行在 Sui 区块链上，所有下注、开奖、赔付均由智能合约自动执行，开奖结果由链上随机数生成，任何人（包括项目方）无法预测或篡改。每笔交易公开透明，可随时在链上验证。',
    'guide.testnet': '⚠️ 当前为 Sui Testnet 测试版，所有代币无真实价值。玩得开心就好！',

    // RoundStatus
    'round.title': '当前轮次',
    'round.totalWagered': '总下注额',
    'round.remaining': '剩余额度',
    'round.playerCount': '参与人数',
    'round.oddsRule': '赔率规则（下注时收取 1% 手续费）',
    'round.win': '赢：一倍奖励 + 本金',
    'round.tie': '平：退回本金',
    'round.lose': '输：没收本金',
    'round.myBets': '我的下注',
    'round.notParticipated': '本期未参与',

    // ProjectHistoryPage
    'projectHistory.title': '项目历史记录',
    'projectHistory.back': '← 返回',
    'projectHistory.loading': '加载中...',
    'projectHistory.system': '系统: {0}',
    'projectHistory.totalWagered': '总下注额',
    'projectHistory.playerCount': '参与人数',
    'projectHistory.loadMore': '加载更多',

    // UserHistoryPage
    'userHistory.title': '我的历史记录',
    'userHistory.back': '← 返回',
    'userHistory.connectWallet': '请先连接钱包',
    'userHistory.backHome': '← 返回首页',
    'userHistory.loading': '加载中...',
    'userHistory.claimed': '✅ 已领取',
    'userHistory.claiming': '领取中...',
    'userHistory.waitingReveal': '⏳ 等待开奖',
    'userHistory.wager': '下注: {0} USDC',
    'userHistory.payout': '派奖: {0} USDC',
    'userHistory.pnl': '盈亏: {0}',
    'userHistory.loadMore': '加载更多',

    // HomePage
    'home.loading': '加载中...',

    // LeaderboardPage
    'leaderboard.title': '推荐排行榜',
    'leaderboard.back': '← 返回',
    'leaderboard.loading': '加载中...',
    'leaderboard.empty': '暂无推荐数据',
    'leaderboard.people': '{0} 人',

    // RevealAnimation
    'reveal.systemMove': '系统出拳',
    'reveal.winner': '🏆 赢家: {0}',
    'reveal.close': '知道了',

    // FaucetSuiButton
    'faucet.sui': '💧 领取测试 SUI',

    // Choice labels
    'choice.rock': '🪨 石头',
    'choice.paper': '📄 布',
    'choice.scissors': '✂️ 剪刀',

    // Language switch
    'lang.switch': '中/EN',
  },
  en: {
    // BetPanel
    'bet.selectFirst': 'Please select Rock, Paper, or Scissors first',
    'bet.enterAmount': 'Please enter bet amount',
    'bet.connectWallet': 'Please connect wallet first',
    'bet.integerOnly': 'Bet amount must be an integer USDC',
    'bet.minBet': 'Minimum bet {0} USDC',
    'bet.maxBet': 'Maximum bet {0} USDC',
    'bet.exceedCap': 'Exceeds remaining cap, max {0} USDC left',
    'bet.noUsdc': 'No USDC tokens',
    'bet.insufficientBalance': 'Insufficient USDC, current {0} USDC',
    'bet.success': 'Bet placed! {0} {1} USDC',
    'bet.fail': 'Bet failed: {0}',
    'bet.selectMove': 'Select Move',
    'bet.rock': 'Rock',
    'bet.paper': 'Paper',
    'bet.scissors': 'Scissors',
    'bet.alreadyBet': 'Already bet {0} this round, can only add to same choice',
    'bet.amountLabel': 'Bet Amount (USDC)',
    'bet.placeholder': 'Min {0} USDC',
    'bet.connectFirst': 'Please connect wallet first',
    'bet.submitting': 'Submitting...',
    'bet.closed': 'Betting closed, awaiting reveal',
    'bet.confirm': 'Confirm Bet',

    // CountdownTimer
    'timer.betting': '🟢 Betting Open',
    'timer.buffer': '🟡 Betting Closed',
    'timer.revealing': '🔴 Awaiting Reveal',
    'timer.bettingDeadline': 'Betting deadline',
    'timer.revealCountdown': 'Reveal countdown',
    'timer.waitingChain': 'Waiting for on-chain reveal...',

    // MintUsdcButton
    'mint.success': '✅ Claimed! +50 USDC',
    'mint.alreadyClaimed': '⏰ Already claimed in 24h, try later',
    'mint.cooldown': '⏰ Cooling down, {0} min remaining',
    'mint.claiming': 'Claiming...',
    'mint.cooldownBtn': '🪙 Cooldown ({0}min)',
    'mint.claim': '🪙 Claim Test USDC',

    // ProjectStatsCard
    'project.title': 'Project Stats',
    'project.viewDetails': 'Details →',
    'project.totalRounds': 'Total Rounds',
    'project.totalVolume': 'Total Volume',
    'project.totalUsers': 'Total Users',
    'project.vault': 'Vault',
    'project.feeRate': 'Fee Rate',
    'project.roundCap': 'Round Cap',
    'project.roundDuration': 'Round Duration',
    'project.minutes': '{0} min',
    'project.status': 'Status',
    'project.paused': '⏸ Paused',
    'project.running': '▶ Running',

    // PlayerStatsCard
    'player.title': 'My Stats',
    'player.viewDetails': 'Details →',
    'player.settledRounds': 'Settled Rounds',
    'player.settledWager': 'Settled Wager',
    'player.totalWon': 'Total Won',
    'player.pnl': 'PnL',
    'player.wlt': 'W/L/T',
    'player.winRate': 'Win Rate',
    'player.currentStreak': 'Current Streak',
    'player.maxStreak': 'Max Streak',
    'player.pendingNote': '⏳ Current round bet {0} USDC pending, not counted',

    // ReferralCard
    'referral.title': 'My Referrals',
    'referral.leaderboard': 'Leaderboard →',
    'referral.loading': 'Loading...',
    'referral.inviteCount': 'Invites',
    'referral.inviteVolume': 'Invite Volume',
    'referral.setCode': 'Set referral code (one-time, cannot change)',
    'referral.codePlaceholder': '3-20 chars, lowercase/digits/underscore',
    'referral.register': 'Register',
    'referral.codeMin': 'Code must be at least 3 characters',
    'referral.codeMax': 'Code must be at most 20 characters',
    'referral.codeFormat': 'Only lowercase letters, digits, and underscores',
    'referral.codeTaken': 'Code already taken',
    'referral.codeSuccess': 'Referral code registered!',
    'referral.alreadyRegistered': 'You already registered a referral code',
    'referral.codeTakenErr': 'Code already taken',
    'referral.betFirst': 'Place a bet first before registering a code',
    'referral.registerFail': 'Registration failed: {0}',
    'referral.myCode': 'My code: ',
    'referral.link': 'Referral Link',
    'referral.copy': 'Copy',

    // GuideCard
    'guide.showGuide': '📖 Game Guide',
    'guide.title': '📖 Beginner Guide',
    'guide.collapse': 'Collapse ✕',
    'guide.step1Title': 'Connect Wallet',
    'guide.step1Desc': '— Click "Connect Wallet" in the top right to connect your Sui wallet (switch to Testnet)',
    'guide.step2Title': 'Get Test Tokens',
    'guide.step2Desc': '— No SUI? Click "💧 Get SUI" for gas; then "🪙 Claim Test USDC" for betting tokens',
    'guide.step3Title': 'Place Bet',
    'guide.step3Desc': '— Choose Rock ✊, Paper ✋, or Scissors ✌️, enter amount (integer USDC), betting closes 5 min before reveal',
    'guide.step4Title': 'Reveal & Payout',
    'guide.step4Desc': '— Auto-reveal every hour on the hour, system picks randomly, winnings auto-distributed',
    'guide.step5Title': 'Referral Rewards',
    'guide.step5Desc': '— After your first bet, register a referral code, share your link, track referral stats in real-time',
    'guide.disclaimer': '🔗 This game runs entirely on the Sui blockchain. All bets, reveals, and payouts are executed by smart contracts. Results are generated by on-chain randomness — no one (including the team) can predict or tamper with them. Every transaction is transparent and verifiable on-chain.',
    'guide.testnet': '⚠️ This is a Sui Testnet demo. All tokens have no real value. Have fun!',

    // RoundStatus
    'round.title': 'Current Round',
    'round.totalWagered': 'Total Wagered',
    'round.remaining': 'Remaining Cap',
    'round.playerCount': 'Players',
    'round.oddsRule': 'Odds (1% fee deducted on bet)',
    'round.win': 'Win: 1x reward + principal',
    'round.tie': 'Tie: refund principal',
    'round.lose': 'Lose: forfeit principal',
    'round.myBets': 'My Bets',
    'round.notParticipated': 'Not participated',

    // ProjectHistoryPage
    'projectHistory.title': 'Project History',
    'projectHistory.back': '← Back',
    'projectHistory.loading': 'Loading...',
    'projectHistory.system': 'System: {0}',
    'projectHistory.totalWagered': 'Total Wagered',
    'projectHistory.playerCount': 'Players',
    'projectHistory.loadMore': 'Load More',

    // UserHistoryPage
    'userHistory.title': 'My History',
    'userHistory.back': '← Back',
    'userHistory.connectWallet': 'Please connect wallet',
    'userHistory.backHome': '← Back to Home',
    'userHistory.loading': 'Loading...',
    'userHistory.claimed': '✅ Claimed',
    'userHistory.claiming': 'Claiming...',
    'userHistory.waitingReveal': '⏳ Awaiting reveal',
    'userHistory.wager': 'Wager: {0} USDC',
    'userHistory.payout': 'Payout: {0} USDC',
    'userHistory.pnl': 'PnL: {0}',
    'userHistory.loadMore': 'Load More',

    // HomePage
    'home.loading': 'Loading...',

    // LeaderboardPage
    'leaderboard.title': 'Referral Leaderboard',
    'leaderboard.back': '← Back',
    'leaderboard.loading': 'Loading...',
    'leaderboard.empty': 'No referral data yet',
    'leaderboard.people': '{0}',

    // RevealAnimation
    'reveal.systemMove': 'System Move',
    'reveal.winner': '🏆 Winner: {0}',
    'reveal.close': 'Got it',

    // FaucetSuiButton
    'faucet.sui': '💧 Get Test SUI',

    // Choice labels
    'choice.rock': '🪨 Rock',
    'choice.paper': '📄 Paper',
    'choice.scissors': '✂️ Scissors',

    // Language switch
    'lang.switch': '中/EN',
  },
} as const;

type TranslationKey = keyof typeof translations.zh;

function getInitialLang(): Lang {
  const stored = localStorage.getItem('rps-lang');
  if (stored === 'zh' || stored === 'en') return stored;
  return navigator.language.startsWith('zh') ? 'zh' : 'en';
}

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, ...args: (string | number)[]) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('rps-lang', newLang);
  }, []);

  const t = useCallback((key: TranslationKey, ...args: (string | number)[]): string => {
    let text: string = translations[lang][key] || key;
    args.forEach((arg, i) => {
      text = text.replace(`{${i}}`, String(arg));
    });
    return text;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
