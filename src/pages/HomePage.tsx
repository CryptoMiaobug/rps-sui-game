import { useEffect, useState, useRef } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useGameState } from '../hooks/useGameState';
import { useRoundState } from '../hooks/useRoundState';
import { useUserBets } from '../hooks/useUserBets';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { BetPanel } from '../components/BetPanel';
import { RoundStatus } from '../components/RoundStatus';
import { PlayerStatsCard } from '../components/PlayerStatsCard';
import { ProjectStatsCard } from '../components/ProjectStatsCard';
import { ReferralCard } from '../components/ReferralCard';
import { RevealAnimation } from '../components/RevealAnimation';

export function HomePage() {
  const account = useCurrentAccount();
  const { gameState } = useGameState();
  const { roundState } = useRoundState(gameState?.rounds_table_id, gameState?.current_target_ms);
  const { userBets } = useUserBets(roundState?.user_bets_table_id, account?.address);
  const { playerStats } = usePlayerStats(gameState?.player_stats_table_id, account?.address);

  const [showReveal, setShowReveal] = useState(false);
  const prevRevealedRef = useRef<boolean | null>(null);

  // Detect reveal transition
  useEffect(() => {
    if (roundState) {
      if (prevRevealedRef.current === false && roundState.is_revealed) {
        setShowReveal(true);
      }
      prevRevealedRef.current = roundState.is_revealed;
    }
  }, [roundState?.is_revealed]);

  // Check betting window
  const now = Date.now();
  const isBettingOpen = gameState
    ? now < gameState.current_target_ms - gameState.buffer_ms && !gameState.is_paused
    : false;

  if (!gameState) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[var(--text-secondary)]">加载中...</div>
      </div>
    );
  }

  const remainingCap = roundState
    ? BigInt(gameState.bet_cap) - BigInt(roundState.total_wagered)
    : BigInt(gameState.bet_cap);

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-4">
      {roundState && (
        <RoundStatus
          round={roundState}
          bufferMs={gameState.buffer_ms}
          betCap={gameState.bet_cap}
          userBets={userBets}
          userAddress={account?.address}
        />
      )}

      <BetPanel
        minBet={gameState.min_bet}
        maxBet={gameState.max_bet}
        isBettingOpen={isBettingOpen}
        userBets={userBets}
        remainingCap={remainingCap > 0n ? remainingCap : 0n}
      />

      {account && playerStats && (
        <PlayerStatsCard
          stats={playerStats}
          currentRoundWagered={roundState && !roundState.is_revealed ? userBets?.amount : undefined}
          isCurrentRoundPending={!!roundState && !roundState.is_revealed}
        />
      )}

      {account && <ReferralCard />}

      <ProjectStatsCard game={gameState} />

      {showReveal && roundState && (
        <RevealAnimation
          systemChoice={roundState.system_choice}
          onClose={() => setShowReveal(false)}
        />
      )}
    </div>
  );
}
