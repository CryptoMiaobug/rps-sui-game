# RPS-Sui Frontend

石头剪刀布游戏的 Sui 区块链前端应用。

## 功能特性

- 💰 连接 Sui 钱包（Sui Wallet、Suiet 等）
- 🎮 实时下注：石头、布、剪刀
- ⏱️ 倒计时显示和封盘提醒
- 📊 实时赔率计算
- 📈 个人统计：总下注、盈亏、胜率、连胜
- 🏆 项目统计：总轮数、交易量、用户数
- 📜 历史记录查询
- 💸 手动领奖功能
- 🔗 推荐系统支持
- 🎬 开奖动画效果
- 📱 移动端响应式设计
- 🌙 暗色主题

## 技术栈

- React 19 + TypeScript
- Vite 7
- @mysten/dapp-kit (Sui 钱包集成)
- @mysten/sui (链上数据读取)
- TailwindCSS 4 (样式)
- React Router (路由)

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 部署到 GitHub Pages

1. 构建项目：
```bash
npm run build
```

2. 将 `dist/` 目录部署到 GitHub Pages

或使用 GitHub Actions 自动部署（参考 `.github/workflows/deploy.yml`）

## 合约信息

- Network: Sui Testnet
- Package: `0x403704dba69499bb153c88e37fe93bcd24e9869bad076f70c707fa542234704c`
- Game Object: `0x0bd12c391ab20f73da1b9e1f54a44ceda5392af4ef2b114eb43dbbae79a9ff2f`
- USDC Type: `0xa9ab0f9ab0b2713ee7e1730dceca0768954e5ea2450b57e25a3c7115ad65a41b::usdc::USDC`

## 推荐链接

在 URL 中添加 `?ref=0x...` 参数可以绑定推荐人：

```
https://your-domain.com/?ref=0x1234567890abcdef...
```

推荐关系会存储在 localStorage 中，首次下注时自动绑定。

## 项目结构

```
src/
├── components/       # React 组件
│   ├── Header.tsx
│   ├── BetPanel.tsx
│   ├── RoundStatus.tsx
│   ├── CountdownTimer.tsx
│   ├── PlayerStatsCard.tsx
│   ├── ProjectStatsCard.tsx
│   └── RevealAnimation.tsx
├── pages/           # 页面组件
│   ├── HomePage.tsx
│   ├── UserHistoryPage.tsx
│   └── ProjectHistoryPage.tsx
├── hooks/           # 自定义 Hooks
│   ├── useGameState.ts
│   ├── useRoundState.ts
│   ├── useUserBets.ts
│   ├── usePlayerStats.ts
│   ├── useEvents.ts
│   └── useUsdcBalance.ts
├── constants/       # 常量配置
│   └── index.ts
├── utils/           # 工具函数
│   └── index.ts
├── App.tsx          # 应用入口
└── main.tsx         # React 入口
```

## License

MIT
