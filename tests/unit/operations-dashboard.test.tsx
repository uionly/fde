import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AIOperationsCenter } from "@/components/operations/ai-operations-center";
import { getOperationsDashboard, operationsDashboardSchema } from "@/lib/operations/dashboard";

describe("AI Operations Center", () => {
  afterEach(cleanup);

  it("validates the repository-authored dashboard data", () => {
    const dashboard = getOperationsDashboard();

    expect(operationsDashboardSchema.safeParse(dashboard).success).toBe(true);
    expect(dashboard.metrics).toHaveLength(4);
    expect(dashboard.models.some((model) => model.status === "degraded")).toBe(true);
    expect(dashboard.incidents.some((incident) => incident.severity === "critical")).toBe(true);
  });

  it("renders live operational context and acknowledges incidents", () => {
    render(<AIOperationsCenter data={getOperationsDashboard()} />);

    expect(screen.getByRole("heading", { level: 1, name: "AI Operations Center" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "AI activity grid" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Production terminal" })).toBeVisible();
    expect(screen.getByText("12 / 13 systems nominal")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Acknowledge inc-2481" }));
    expect(screen.getByText("inc-2481 acknowledged. Response lead notified.")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(screen.queryByText("inc-2481 acknowledged. Response lead notified.")).not.toBeInTheDocument();
  });
});
