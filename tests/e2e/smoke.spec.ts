import { expect, test } from "@playwright/test";

import { routeSupportQueue } from "./game-helpers";

test("landing page, navigation, and theme work", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: /Can you ship AI that survives the enterprise/i })).toBeVisible();
  await expect(page.getByText("Northstar Financial", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Run a 5-minute AI mission/ })).toHaveAttribute("href", "/games/model-router-arena");
  await expect(page.getByRole("link", { name: /Explore AI Labs/ })).toHaveAttribute("href", "/labs");
  await expect(page.getByRole("link", { name: /Change the variables/ })).toHaveAttribute("href", "/experiments");
  await expect(page.getByRole("link", { name: /Deliver the outcome/ })).toHaveAttribute("href", "/labs#field-missions");

  await page.getByRole("link", { name: "Learn", exact: true }).click();
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByRole("heading", { level: 1, name: "Learn through the customer problem." })).toBeVisible();

  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("all milestone routes render", async ({ page }) => {
  const routes = ["/labs", "/games", "/practice", "/case-studies", "/capstone", "/progress", "/resources"];

  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
  }
});

test("AI Labs owns its arcade, playground, and field-mission routes", async ({ page }) => {
  const mainNavigation = page.getByRole("navigation", { name: "Main navigation" });
  const labsNavigation = page.getByRole("navigation", { name: "AI Labs navigation" });

  await page.goto("/games/model-router-arena");
  await expect(mainNavigation.getByRole("link", { name: "AI Labs" })).toHaveAttribute("aria-current", "location");
  await expect(labsNavigation.getByRole("link", { name: "Field Arcade" })).toHaveAttribute("aria-current", "location");

  await page.goto("/experiments/retrieval-playground");
  await expect(mainNavigation.getByRole("link", { name: "AI Labs" })).toHaveAttribute("aria-current", "location");
  await expect(labsNavigation.getByRole("link", { name: "Playgrounds" })).toHaveAttribute("aria-current", "location");

  await page.goto("/labs/discovery-workshop");
  await expect(mainNavigation.getByRole("link", { name: "AI Labs" })).toHaveAttribute("aria-current", "location");
  await expect(labsNavigation.getByRole("link", { name: "Field Missions" })).toHaveAttribute("aria-current", "location");

  await page.goto("/labs#field-missions");
  await expect(labsNavigation.getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current");
  await expect(labsNavigation.getByRole("link", { name: "Field Missions" })).toHaveAttribute("aria-current", "location");
});

test("learner can navigate track to lesson to next lesson", async ({ page }) => {
  await page.goto("/learn");
  await expect(page.getByRole("link", { name: /LLM Engineering/ }).getByText("126 min", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /FDE Foundations/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "FDE Foundations" })).toBeVisible();

  await page.getByRole("link", { name: /What Is Forward Deployed Engineering/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "What Is Forward Deployed Engineering?" })).toBeVisible();
  await expect(page.getByText("Northstar's opening request")).toBeVisible();

  await page.getByRole("link", { name: /Next.*From Customer Request to Problem Statement/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "From Customer Request to Problem Statement" })).toBeVisible();
});

test("lesson practice action opens only its connected scenarios", async ({ page }) => {
  await page.goto("/learn/fde-foundations/what-is-fde");
  const practiceLink = page.getByRole("link", { name: "Practice this topic" });
  await expect(practiceLink).toHaveAttribute("href", "/practice?lesson=what-is-fde");
  await practiceLink.click();

  await expect(page).toHaveURL(/\/practice\?lesson=what-is-fde$/);
  await expect(page.getByText("Practicing scenarios connected to this lesson.")).toBeVisible();
  await expect(page.getByText("1 / 2", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Browse the full question bank/ })).toHaveAttribute("href", "/practice");
});

test("the showcase has no sign-in surface and legacy account routes redirect", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /sign in/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /sign in/i })).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  const mobileNavigation = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(mobileNavigation.getByRole("link", { name: /sign in/i })).toHaveCount(0);

  await page.goto("/signin");
  await expect(page).toHaveURL(/\/labs$/);
  await expect(page.getByRole("heading", { level: 1, name: /Make the architecture call.*See the production consequence/ })).toBeVisible();

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/progress$/);
});

test("visitor completes and resumes a lesson on this device", async ({ page }) => {
  await page.goto("/learn/fde-foundations/what-is-fde");
  await page.getByRole("button", { name: "Mark complete" }).click();
  await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();
  await page.goto("/progress");
  await expect(page.getByText(/Saved only in this browser/i)).toBeVisible();
  await expect(page.getByText("1 of 48 lessons", { exact: true })).toBeVisible();
  await expect(page.locator("#main-content").getByText("2%", { exact: true })).toBeVisible();
});

test("practice filters, multiple-choice feedback, and persistence work", async ({ page }) => {
  await page.goto("/practice");
  await page.getByLabel("Filter by category").selectOption("security");
  await page.getByLabel("Filter by difficulty").selectOption("advanced");
  await page.getByLabel(/Treat document text as untrusted context/).check();
  await page.getByLabel(/Require approval for outbound messages/).check();
  await page.getByRole("button", { name: "Check decision" }).click();
  await expect(page.getByText("Strong call")).toBeVisible();
  await expect(page.getByText(/Attempt saved/)).toBeVisible();

  await page.reload();
  await page.goto("/progress");
  await expect(page.getByText(/Based on 1 saved practice/)).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Security skill score: 100%" })).toBeVisible();
});

test("all five deterministic experiments run and reset", async ({ page }) => {
  await page.goto("/experiments");
  await expect(page.getByRole("link", { name: /Chunking Playground/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /AI Cost Calculator/ })).toBeVisible();

  await page.goto("/experiments/chunking-playground");
  await page.getByRole("button", { name: "Create chunks" }).click();
  await expect(page.getByText("CHUNK 1")).toBeVisible();
  await page.getByRole("button", { name: "Reset experiment" }).click();
  await expect(page.getByText("0 chunks")).toBeVisible();

  await page.goto("/experiments/retrieval-playground");
  await page.getByRole("button", { name: "Retrieve" }).click();
  await expect(page.getByText("Failed payment dispute")).toBeVisible();

  await page.goto("/experiments/agent-tool-selection");
  for (const name of ["Verify identity", "Look up payment", "Search support policy", "Create support ticket"]) await page.getByRole("button", { name }).click();
  await page.getByRole("button", { name: "Evaluate sequence" }).click();
  await expect(page.getByText("Safe, efficient sequence")).toBeVisible();

  await page.goto("/experiments/prompt-injection-simulator");
  await page.getByLabel(/Ignore the injected instruction/).check();
  await page.getByRole("button", { name: "Evaluate response" }).click();
  await expect(page.getByText("Boundary preserved")).toBeVisible();

  await page.goto("/experiments/ai-cost-calculator");
  await page.getByRole("button", { name: "Calculate economics" }).click();
  await expect(page.getByText("Model cost")).toBeVisible();
});

test("AI Labs home rewards a correct routing simulation and persists XP", async ({ page }) => {
  await page.goto("/labs");
  await expect(page.getByRole("heading", { level: 1, name: /Make the architecture call.*See the production consequence/ })).toBeVisible();
  const labModes = page.getByLabel("Choose an AI Lab mode");
  await expect(labModes.getByRole("link", { name: /Simulate/ })).toBeVisible();
  await expect(labModes.getByRole("link", { name: /Experiment/ })).toBeVisible();
  await expect(labModes.getByRole("link", { name: /Deliver/ })).toBeVisible();
  await expect(page.getByText("The demo does not generalize", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /Run today's incident/ }).click();
  await expect(page.getByRole("heading", { name: "Model Router Rush" })).toBeVisible();
  await page.getByRole("button", { name: "Open routing board" }).click();
  await routeSupportQueue(page);
  await page.getByRole("button", { name: "Run traffic" }).click();
  await expect(page.getByText("Mission cleared · +60 XP")).toBeVisible();
  await page.goto("/labs");
  const fieldProfile = page.getByLabel("AI Labs field profile");
  await expect(fieldProfile.getByText("60", { exact: true })).toBeVisible();
});

test("guided lab saves and resumes the current step", async ({ page }) => {
  await page.goto("/labs/discovery-workshop");
  await expect(page.getByRole("heading", { name: "Read the customer request" })).toBeVisible();
  await page.getByRole("button", { name: "Save & continue" }).click();
  await expect(page.getByRole("heading", { name: "Map the stakeholders" })).toBeVisible();
  await page.getByLabel("Your working notes").fill("Sponsor, support specialists, operations, security, and data owners");
  await page.getByRole("button", { name: "Save & continue" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Draft discovery questions" })).toBeVisible();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByLabel("Your working notes")).toHaveValue(/support specialists/);
  await page.getByRole("button", { name: "Show hint" }).click();
  await expect(page.getByText(/frontline support specialists/)).toBeVisible();
});

test("Northstar case study reveals the continuous customer story", async ({ page }) => {
  await page.goto("/case-studies/northstar");
  await expect(page.getByRole("heading", { level: 1, name: "Northstar Financial" })).toBeVisible();
  await expect(page.getByText("Atlas CRM", { exact: true })).toBeVisible();
  await page.getByText("Permission-sensitive knowledge", { exact: true }).click();
  await expect(page.getByText(/Naive retrieval discarded source permissions/)).toBeVisible();
  await expect(page.getByText(/All people, accounts, tickets/)).toBeVisible();

  await page.goto("/case-studies/northstar?scenario=retrieval-failure#retrieval-failure");
  const linkedIncident = page.locator("#retrieval-failure:visible");
  await expect(linkedIncident).toHaveCount(1);
  await expect(linkedIncident).toHaveAttribute("open", "");
  await expect(linkedIncident.getByText(/curated demo hid a vocabulary mismatch/i)).toBeVisible();
});

test("skill snapshot changes only after visitor evidence", async ({ page }) => {
  await page.goto("/practice");
  await page.getByLabel("Filter by category").selectOption("security");
  await page.getByLabel("Filter by difficulty").selectOption("advanced");
  await page.getByLabel(/Treat document text as untrusted context/).check();
  await page.getByLabel(/Require approval for outbound messages/).check();
  await page.getByRole("button", { name: "Check decision" }).click();
  await expect(page.getByText("Attempt saved")).toBeVisible();
  await page.goto("/progress");
  await expect(page.locator("#main-content").getByText(/Based on 1 saved practice/)).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Security skill score: 100%" })).toBeVisible();
});

test("search finds content and field resources are downloadable", async ({ page }) => {
  await page.goto("/search");
  await page.getByRole("searchbox").fill("permission retrieval");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByRole("link", { name: /Permission-Aware Enterprise Retrieval/ })).toBeVisible();
  await page.getByRole("searchbox").fill("model router");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByRole("link", { name: /Model Router Rush/ })).toHaveAttribute("href", "/games/model-router-arena");
  await page.getByRole("searchbox").fill("prompt injection simulator");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByRole("link", { name: /Prompt Injection Simulator/ })).toHaveAttribute("href", "/experiments/prompt-injection-simulator");
  await page.goto("/resources");
  await page.getByRole("link", { name: /FDE glossary/ }).click();
  await expect(page.getByText("Model Context Protocol", { exact: true })).toBeVisible();
  const response = await page.request.get("/api/resources/discovery-canvas");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-disposition"]).toContain("discovery-canvas.md");
  expect(await response.text()).toContain("FDE Discovery Canvas");
});

test("mobile navigation and skip link are keyboard accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "AI Labs" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Customer Engagement" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Progress" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Resources" })).toBeVisible();
  await page.goto("/games");
  await expect(page.getByRole("navigation", { name: "AI Labs navigation" }).getByRole("link", { name: "Field Arcade" })).toHaveAttribute("aria-current", "page");
  await page.reload();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
});

test("integrated visitor learning journey", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Learn", exact: true }).click();
  await page.getByRole("link", { name: /FDE Foundations/ }).click();
  await page.getByRole("link", { name: /What Is Forward Deployed Engineering/ }).click();
  await expect(page.getByText("Northstar's opening request")).toBeVisible();

  await page.goto("/learn/fde-foundations/what-is-fde");
  await page.getByRole("button", { name: "Mark complete" }).click();
  await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();

  await page.goto("/practice");
  await page.getByLabel("Filter by category").selectOption("security");
  await page.getByLabel("Filter by difficulty").selectOption("advanced");
  await page.getByLabel(/Treat document text as untrusted context/).check();
  await page.getByLabel(/Require approval for outbound messages/).check();
  await page.getByRole("button", { name: "Check decision" }).click();
  await expect(page.getByText("Strong call")).toBeVisible();

  await page.goto("/experiments/retrieval-playground");
  await page.getByRole("button", { name: "Retrieve" }).click();
  await expect(page.getByText("Failed payment dispute")).toBeVisible();

  await page.goto("/labs/discovery-workshop");
  await page.getByRole("button", { name: "Save & continue" }).click();
  await expect(page.getByRole("heading", { name: "Map the stakeholders" })).toBeVisible();

  await page.goto("/case-studies/northstar");
  await expect(page.getByRole("heading", { name: "Northstar Financial" })).toBeVisible();
  await page.goto("/progress");
  await expect(page.locator("#main-content").getByText("2%", { exact: true })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Security skill score: 100%" })).toBeVisible();
});
