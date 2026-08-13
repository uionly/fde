import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("Field Arcade runs a no-typing mission and persists the next deterministic variant", async ({ page }) => {
  await page.goto("/games");
  await expect(page.getByRole("heading", { level: 1, name: /Make the call/ })).toBeVisible();
  await expect(page.getByText("6 playable missions")).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);

  await page.getByRole("link", { name: /Model Router Arena/ }).click();
  await expect(page).toHaveURL(/\/games\/model-router-arena$/);
  await page.getByRole("button", { name: "Begin mission" }).click();
  await expect(page.getByText("Support queue launch", { exact: true }).first()).toBeVisible();
  await page.getByText("Use a small model for classification and escalate uncertain or complex cases", { exact: true }).click();
  await page.getByRole("button", { name: "Run simulation" }).click();
  const resultHeading = page.getByRole("heading", { name: "Production ready" });
  await expect(resultHeading).toBeVisible();
  await expect(resultHeading).toBeFocused();
  await expect(page.getByRole("status")).toHaveText(/Simulation result: Production ready\. Overall score \d+ out of 100\. Mission cleared\./);
  await expect(page.locator('[aria-live="polite"]')).toHaveCount(1);
  await expect(page.getByText("Mission cleared · +40 XP")).toBeVisible();
  await expect(page.getByRole("progressbar", { name: /Safety score/ })).toBeVisible();
  await page.getByRole("link", { name: /Test the unit economics/ }).click();
  await expect(page).toHaveURL(/\/experiments\/ai-cost-calculator$/);
  await expect(page.getByRole("heading", { name: "AI Cost Calculator" })).toBeVisible();

  await page.goto("/games/model-router-arena");
  await page.getByRole("button", { name: "Begin mission" }).click();
  await expect(page.getByText("Claims document intake", { exact: true }).first()).toBeVisible();
  await page.goto("/games");
  const profile = page.getByLabel("Field Arcade profile");
  await expect(profile.getByText("40", { exact: true })).toBeVisible();
  await expect(profile.getByText("1/6", { exact: true })).toBeVisible();
});

test("Start fresh resets the next visitor without deleting account work or display settings", async ({ page }) => {
  const email = `fresh-visitor-${randomUUID()}@example.com`;
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/signin");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: /Continue as demo learner/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.evaluate(() => window.localStorage.setItem("showcase-setting", "preserve"));
  await page.goto("/learn/fde-foundations/what-is-fde");
  await page.getByRole("button", { name: "Mark complete" }).click();
  await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();

  await page.goto("/games/model-router-arena");
  await page.getByRole("button", { name: "Begin mission" }).click();
  await page.getByText("Use a small model for classification and escalate uncertain or complex cases", { exact: true }).click();
  await page.getByRole("button", { name: "Run simulation" }).click();
  await expect(page.getByText("Mission cleared · +40 XP")).toBeVisible();

  await page.getByRole("button", { name: "Start fresh" }).click();
  const confirmation = page.getByRole("alertdialog", { name: "Start a fresh visitor session?" });
  await expect(confirmation).toBeVisible();
  await expect(confirmation.getByText(/Saved account work and display settings stay intact/)).toBeVisible();
  await confirmation.getByRole("button", { name: "Confirm start fresh" }).click();

  await expect(page).toHaveURL(/\/labs$/);
  await expect(page.getByRole("status").getByText(/Fresh session started/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Sign in/ })).toBeVisible();
  const freshProfile = page.getByLabel("AI Labs field profile");
  await expect(freshProfile.getByText("0", { exact: true }).first()).toBeVisible();
  await expect(freshProfile.getByText("0/6", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("fde-ai-labs-profile-v1"))).toBeNull();
  expect(await page.evaluate(() => window.localStorage.getItem("showcase-setting"))).toBe("preserve");
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.goto("/signin");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: /Continue as demo learner/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/learn/fde-foundations/what-is-fde");
  await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();
});

test("Field Arcade is keyboard operable on mobile and respects reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/games/model-router-arena");

  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(page.getByRole("textbox")).toHaveCount(0);

  const begin = page.getByRole("button", { name: "Begin mission" });
  await begin.focus();
  await page.keyboard.press("Enter");
  const decisionHeading = page.getByRole("heading", { level: 2, name: "Which routing policy gives the best starting architecture?" });
  await expect(decisionHeading).toBeFocused();
  const decision = page.getByRole("radio", { name: /Use a small model for classification/ });
  await decision.focus();
  await expect(decision).toBeFocused();
  await page.keyboard.press("Space");
  const simulate = page.getByRole("button", { name: "Run simulation" });
  await simulate.focus();
  await page.keyboard.press("Enter");
  const debriefHeading = page.getByRole("heading", { level: 2, name: "Production ready" });
  await expect(debriefHeading).toBeFocused();
  await expect(page.getByRole("status")).toHaveText(/Overall score \d+ out of 100\. Mission cleared\./);
  await expect(page.getByText("Mission cleared · +40 XP")).toBeVisible();
  const review = page.getByRole("button", { name: "Review briefing" });
  await review.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 2, name: "Support queue launch" })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("legacy nested game URLs redirect to the canonical Games route", async ({ page }) => {
  await page.goto("/labs/games/model-router-arena");
  await expect(page).toHaveURL(/\/games\/model-router-arena$/);
  await expect(page.getByRole("heading", { level: 1, name: "Model Router Arena" })).toBeVisible();
});
