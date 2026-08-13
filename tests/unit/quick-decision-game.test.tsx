import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { QuickDecisionGame } from "@/components/games/quick-decision-game";
import { getAllGames } from "@/lib/content/loaders";

describe("quick decision game accessibility", () => {
  beforeEach(() => window.localStorage.clear());

  it("moves focus between phase headings and announces only a concise result", async () => {
    const game = getAllGames()[0];
    const scenario = game.scenarios[0];
    const recommended = scenario.choices.find((choice) => choice.recommended)!;
    render(<QuickDecisionGame game={game} />);

    const begin = await screen.findByRole("button", { name: "Begin mission" });
    await waitFor(() => expect(begin).toBeEnabled());
    fireEvent.click(begin);

    const decisionHeading = screen.getByRole("heading", { level: 2, name: scenario.prompt });
    await waitFor(() => expect(decisionHeading).toHaveFocus());
    expect(decisionHeading).toHaveAttribute("tabindex", "-1");

    fireEvent.click(screen.getByText(recommended.text, { exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Run simulation" }));

    const resultHeading = screen.getByRole("heading", { level: 2, name: "Production ready" });
    await waitFor(() => expect(resultHeading).toHaveFocus());
    expect(resultHeading).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("status")).toHaveTextContent(/Simulation result: Production ready\. Overall score \d+ out of 100\. Mission cleared\./);
    expect(document.querySelectorAll('[aria-live="polite"]')).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Review briefing" }));
    const briefingHeading = screen.getByRole("heading", { level: 2, name: scenario.title });
    await waitFor(() => expect(briefingHeading).toHaveFocus());
    expect(briefingHeading).toHaveAttribute("tabindex", "-1");
  });
});
