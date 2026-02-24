import { useState } from 'react';

export function GuideCard() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-left text-sm text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
      >
        📖 查看游戏指南
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">📖 新手指南</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          收起 ✕
        </button>
      </div>

      <div className="space-y-3 text-sm text-[var(--text-secondary)]">
        <div className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">1</span>
          <div>
            <span className="text-[var(--text-primary)] font-medium">连接钱包</span>
            <span className="ml-1">— 点击右上角「Connect Wallet」连接 Sui 钱包（注意切换到测试网 Testnet）</span>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">2</span>
          <div>
            <span className="text-[var(--text-primary)] font-medium">领取测试币</span>
            <span className="ml-1">— 没有 SUI？点击「💧 领取 SUI」获取 Gas 费；再点「🪙 领取测试 USDC」获取下注代币</span>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">3</span>
          <div>
            <span className="text-[var(--text-primary)] font-medium">下注</span>
            <span className="ml-1">— 选择石头 ✊、布 ✋ 或剪刀 ✌️，输入金额（整数 USDC），每轮开奖前 5 分钟截止</span>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">4</span>
          <div>
            <span className="text-[var(--text-primary)] font-medium">开奖 & 赔付</span>
            <span className="ml-1">— 每小时整点自动开奖，系统随机出拳，奖金自动发放</span>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-500/20 text-xs font-bold text-yellow-400">5</span>
          <div>
            <span className="text-[var(--text-primary)] font-medium">赔率规则</span>
            <span className="ml-1">— 下注时收取 2% 手续费。赢：一倍奖励 + 本金 / 平：退回本金 / 输：没收本金</span>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-400">6</span>
          <div>
            <span className="text-[var(--text-primary)] font-medium">邀请返利</span>
            <span className="ml-1">— 下注一次后可注册专属推荐码，分享链接邀请好友，推荐数据实时统计</span>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-[var(--bg-secondary)] p-2.5 text-xs text-[var(--text-secondary)]">
        🔗 本游戏完全运行在 Sui 区块链上，所有下注、开奖、赔付均由智能合约自动执行，开奖结果由链上随机数生成，任何人（包括项目方）无法预测或篡改。每笔交易公开透明，可随时在链上验证。
      </div>

      <div className="mt-2 rounded-lg bg-[var(--bg-secondary)] p-2.5 text-xs text-[var(--text-secondary)]">
        ⚠️ 当前为 Sui Testnet 测试版，所有代币无真实价值。玩得开心就好！
      </div>
    </div>
  );
}
