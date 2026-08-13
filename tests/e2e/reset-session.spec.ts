import { expect, test } from "@playwright/test";

test("Start fresh stays available across AI Labs routes and uses an accessible confirmation", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });

  for (const route of ["/games/model-router-arena", "/experiments/retrieval-playground", "/labs/discovery-workshop"]) {
    await page.goto(route);
    await expect(page.getByRole("button", { name: "Start fresh" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start fresh" })).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }

  await page.goto("/labs");
  const labsNavigation = page.getByRole("navigation", { name: "AI Labs navigation" });
  const fieldMissions = labsNavigation.getByRole("link", { name: "Field Missions" });
  await fieldMissions.click();
  await expect(fieldMissions).toHaveAttribute("aria-current", "location");
  await expect(fieldMissions).toBeInViewport();

  const trigger = page.getByRole("button", { name: "Start fresh" });
  await trigger.click();
  const confirmation = page.getByRole("alertdialog", { name: /Clear this visitor(?:’|')s progress\?/ });
  await expect(confirmation).toBeVisible();
  await expect(confirmation.getByText(/Field Arcade, and Capstone progress/)).toBeVisible();
  await expect(confirmation.getByText(/Any unsaved work on the current screen will be lost/)).toBeVisible();
  await expect(confirmation.getByRole("button", { name: "Cancel" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(confirmation).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("Start fresh clears all app-owned profiles and leaves a dismissible success confirmation", async ({ page }) => {
  await page.goto("/games/model-router-arena");
  await page.evaluate(() => {
    window.localStorage.setItem("fde-ai-labs-profile-v1", JSON.stringify({ version: 2, xp: 80 }));
    window.localStorage.setItem("fde-learning-lab-visitor-progress-v1", JSON.stringify({ version: 1, lessons: {}, practiceAttempts: [], labs: {} }));
    window.localStorage.setItem("fde-learning-lab-capstone-progress-v1", JSON.stringify({ version: 1, currentPhaseId: "discovery", phases: {}, updatedAt: "2026-08-13T06:00:00.000Z" }));
    window.localStorage.setItem("unrelated-showcase-setting", "keep-me");
  });

  await page.getByRole("button", { name: "Start fresh" }).click();
  const confirmation = page.getByRole("alertdialog", { name: /Clear this visitor(?:’|')s progress\?/ });
  await confirmation.getByRole("button", { name: "Clear progress" }).click();

  await expect(page).toHaveURL(/\/labs$/);
  const status = page.getByRole("status");
  await expect(status.getByText(/Fresh session started/)).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("fde-ai-labs-profile-v1"))).toBeNull();
  expect(await page.evaluate(() => window.localStorage.getItem("fde-learning-lab-visitor-progress-v1"))).toBeNull();
  expect(await page.evaluate(() => window.localStorage.getItem("fde-learning-lab-capstone-progress-v1"))).toBeNull();
  expect(await page.evaluate(() => window.localStorage.getItem("unrelated-showcase-setting"))).toBe("keep-me");

  await status.getByRole("button", { name: "Dismiss fresh session confirmation" }).click();
  await expect(status).toBeHidden();
});
