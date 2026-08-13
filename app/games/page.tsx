import type { Metadata } from "next";

import { FieldArcadeHome } from "@/components/games/field-arcade-home";
import { getAllGames } from "@/lib/content";

export const metadata: Metadata = {
  title: "Field Arcade",
  description: "Play short, no-typing enterprise AI simulations and see the impact on quality, safety, cost, and latency.",
};

export default function FieldArcadePage() {
  return <FieldArcadeHome games={getAllGames()} />;
}
