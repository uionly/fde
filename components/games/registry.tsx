"use client";

import { ModelRouterGame } from "@/components/games/model-router-game";
import { QuickDecisionGame } from "@/components/games/quick-decision-game";
import { RetrievalRankGame } from "@/components/games/retrieval-rank-game";
import type { FieldGame } from "@/lib/content/schemas";

export const gameRendererRegistry = {
  "quick-decision": QuickDecisionGame,
  "model-router": ModelRouterGame,
  "retrieval-rank": RetrievalRankGame,
} as const;

export function GameRenderer({ game }: { game: FieldGame }) {
  switch (game.type) {
    case "quick-decision":
      return <QuickDecisionGame game={game} />;
    case "model-router":
      return <ModelRouterGame game={game} />;
    case "retrieval-rank":
      return <RetrievalRankGame game={game} />;
    default: {
      const exhaustiveGame: never = game;
      return exhaustiveGame;
    }
  }
}
