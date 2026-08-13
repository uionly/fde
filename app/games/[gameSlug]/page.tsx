import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GameRenderer } from "@/components/games/registry";
import { getAllGames, getGameBySlug } from "@/lib/content";

type GamePageProps = { params: Promise<{ gameSlug: string }> };

export function generateStaticParams() {
  return getAllGames().map((game) => ({ gameSlug: game.slug }));
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const game = getGameBySlug((await params).gameSlug);
  if (!game) return { title: "Game not found" };
  return { title: game.title, description: game.description };
}

export default async function GamePage({ params }: GamePageProps) {
  const game = getGameBySlug((await params).gameSlug);
  if (!game) notFound();
  return <GameRenderer game={game} />;
}
