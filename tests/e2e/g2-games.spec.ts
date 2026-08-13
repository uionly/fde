import { devices, expect, test } from "@playwright/test";

import { activate, packPolicyEvidence, routeSupportQueue } from "./game-helpers";

test("Retrieval Rank Race supports keyboard ranking, a hard budget, and deterministic resume", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/games/retrieval-rank-rush");

  await expect(page.getByRole("heading", { level: 1, name: "Retrieval Rank Race" })).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await activate(page, page.getByRole("button", { name: "Begin rank rush" }), "keyboard");
  await expect(page.getByRole("heading", { level: 2, name: "Which evidence should enter the context window, and in what order?" })).toBeFocused();

  await activate(page, page.getByRole("button", { name: "Include 2019 reversal playbook" }), "keyboard");
  await expect(page.getByRole("status")).toHaveText(/2019 reversal playbook included at rank 1/);
  await activate(page, page.getByRole("button", { name: "Remove 2019 reversal playbook" }), "keyboard");
  await expect(page.getByRole("status")).toHaveText(/2019 reversal playbook removed/);

  await packPolicyEvidence(page, "keyboard");
  await expect(page.getByRole("progressbar", { name: "380 of 420 context tokens used" })).toHaveAttribute("aria-valuenow", "380");
  await expect(page.getByRole("button", { name: "Include 2019 reversal playbook" })).toBeDisabled();
  const rankedItems = page.getByRole("heading", { name: "Ranked context pack" }).locator("xpath=../..").locator("ol > li");
  await expect(rankedItems).toHaveCount(3);
  await expect(rankedItems.nth(0)).toContainText("Current transfer reversal policy");
  await expect(rankedItems.nth(1)).toContainText("Account takeover procedure");
  await expect(rankedItems.nth(2)).toContainText("P2P transfer definitions");

  await activate(page, page.getByRole("button", { name: "Evaluate context" }), "keyboard");
  await expect(page.getByRole("heading", { level: 2, name: "Production ready" })).toBeFocused();
  await expect(page.getByRole("status")).toHaveText(/Retrieval result: Production ready\. Overall score \d+ out of 100\. All four launch gates cleared\./);
  await expect(page.locator('[aria-live="polite"]')).toHaveCount(1);
  await expect(page.getByText("Mission cleared · +70 XP")).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.reload();
  await page.getByRole("button", { name: "Begin rank rush" }).click();
  await expect(page.getByText("Stale policy dominance", { exact: true }).first()).toBeVisible();
});

test("a cleared scenario can improve its personal best without awarding duplicate XP", async ({ page }) => {
  await page.goto("/games/model-router-arena");
  await page.evaluate(() => {
    window.localStorage.setItem(
      "fde-ai-labs-profile-v1",
      JSON.stringify({
        version: 2,
        xp: 60,
        completedGameIds: ["model-router-arena"],
        completedScenarioKeys: ["model-router-arena:support-queue-routing"],
        bestScores: { "model-router-arena:support-queue-routing": 50 },
        attemptCounts: { "model-router-arena": 1 },
        playCounts: { "model-router-arena": 0 },
        lastScenarioIds: { "model-router-arena": "support-queue-routing" },
        mastery: { "AI Engineering": 50, "Business Thinking": 50 },
        streak: 1,
        lastPlayedDate: "2026-08-12",
      }),
    );
  });
  await page.reload();

  await page.getByRole("button", { name: "Open routing board" }).click();
  await routeSupportQueue(page);
  await page.getByRole("button", { name: "Run traffic" }).click();
  await expect(page.getByText("Mission cleared · personal best updated")).toBeVisible();

  const savedProfile = await page.evaluate(() => JSON.parse(window.localStorage.getItem("fde-ai-labs-profile-v1") ?? "null"));
  expect(savedProfile.xp).toBe(60);
  expect(savedProfile.completedScenarioKeys).toEqual(["model-router-arena:support-queue-routing"]);
  expect(savedProfile.playCounts["model-router-arena"]).toBe(1);
  expect(savedProfile.attemptCounts["model-router-arena"]).toBe(2);
});

test("routing and retrieval controls work with touch without horizontal overflow", async ({ browser }) => {
  const context = await browser.newContext({ ...devices["Pixel 5"], reducedMotion: "reduce" });
  const page = await context.newPage();

  try {
    await page.goto("/games/model-router-arena");
    await expect(page.getByRole("textbox")).toHaveCount(0);
    await activate(page, page.getByRole("button", { name: "Open routing board" }), "touch");
    await activate(page, page.getByRole("button", { name: /^Select request: Intent classification/ }), "touch");
    await activate(page, page.getByRole("button", { name: "Route Intent classification to Fast model" }), "touch");
    await expect(page.getByRole("button", { name: /Select request: Intent classification\. Routed to Fast model/ })).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByRole("status")).toHaveText(/Intent classification routed to Fast model/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

    await page.goto("/games/retrieval-rank-rush");
    await activate(page, page.getByRole("button", { name: "Begin rank rush" }), "touch");
    await activate(page, page.getByRole("button", { name: "Include Current transfer reversal policy" }), "touch");
    await activate(page, page.getByRole("button", { name: "Include Account takeover procedure" }), "touch");
    await activate(page, page.getByRole("button", { name: "Move Account takeover procedure up" }), "touch");
    const rankedItems = page.getByRole("heading", { name: "Ranked context pack" }).locator("xpath=../..").locator("ol > li");
    await expect(rankedItems.nth(0)).toContainText("Account takeover procedure");
    await expect(page.getByRole("progressbar", { name: "275 of 420 context tokens used" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  } finally {
    await context.close();
  }
});
