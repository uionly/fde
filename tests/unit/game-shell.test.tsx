import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GameShell } from "@/components/games/game-shell";
import { getAllGames } from "@/lib/content/loaders";

describe("game shell", () => {
  it("exposes a semantic game region, customer context, and no-typing instructions", () => {
    const game = getAllGames()[0];
    render(<GameShell game={game} scenario={game.scenarios[0]}><button type="button">Playable control</button></GameShell>);

    expect(screen.getByRole("heading", { level: 1, name: game.title })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: `${game.title} game` })).toBeInTheDocument();
    expect(screen.getByText(game.scenarios[0].customer)).toBeInTheDocument();
    expect(screen.getByText("No typing required")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Playable control" })).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
