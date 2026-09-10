import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "@/app/page";
import { getAllTracks } from "@/lib/content";

describe("FDE learning hub", () => {
  it("exposes the published roadmap and reference tools without a game-first gate", () => {
    render(<HomePage />);
    expect(screen.getByRole("link", { name: "Start learning" })).toHaveAttribute("href", "/learn");
    expect(screen.getByRole("link", { name: "Continue your learning" })).toHaveAttribute("href", "/progress");
    for (const track of getAllTracks()) {
      expect(screen.getByRole("link", { name: new RegExp(track.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) })).toHaveAttribute("href", `/learn/${track.slug}`);
    }
    expect(screen.getByRole("link", { name: /Templates and checklists/ })).toHaveAttribute("href", "/resources");
    expect(screen.getByRole("link", { name: /FDE glossary/ })).toHaveAttribute("href", "/resources/glossary");
    const search = screen.getByRole("search", { name: "Search FDE knowledge" });
    expect(search).toHaveAttribute("action", "/search");
    expect(within(search).getByRole("searchbox", { name: "What do you need to learn or solve?" })).toHaveAttribute("name", "q");
  });
});
