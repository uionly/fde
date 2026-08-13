import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NorthstarPage from "@/app/case-studies/northstar/page";

describe("Northstar customer engagement", () => {
  it("opens a validated scenario selected by the query string", async () => {
    const page = await NorthstarPage({
      searchParams: Promise.resolve({ scenario: "retrieval-failure" }),
    });
    const { container } = render(page);
    const selectedScenario = container.querySelector("#retrieval-failure");

    expect(selectedScenario).toHaveAttribute("open");
    expect(screen.getByText("The demo does not generalize", { exact: true })).toBeVisible();
  });

  it("ignores unknown scenario query values", async () => {
    const page = await NorthstarPage({
      searchParams: Promise.resolve({ scenario: "unknown-scenario" }),
    });
    const { container } = render(page);

    expect(container.querySelector("details[open]")).toBeNull();
  });
});
