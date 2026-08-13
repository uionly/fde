"use client";

import { QuickDecisionGame } from "@/components/games/quick-decision-game";
import type { FieldGame } from "@/lib/content/schemas";

export const gameRendererRegistry = {
  "quick-decision": QuickDecisionGame,
} satisfies Record<FieldGame["type"], React.ComponentType<{ game: FieldGame }>>;

export function GameRenderer({ game }: { game: FieldGame }) {
  const Renderer = gameRendererRegistry[game.type];
  return <Renderer game={game} />;
}
