import { expect, test } from "@playwright/test";

const draftReasoning = "Draft: observe work first, then test customer assumptions.";
const completedReasoning =
  "I would shadow support specialists, baseline search and handling time, map decision owners, and validate regulated exceptions before proposing an automation boundary.";

test("the Northstar capstone deterministically completes, resumes, coaches, and contributes verified evidence", async ({ page }) => {
  await page.goto("/capstone");

  await expect(page.getByRole("heading", { level: 1, name: "Lead the Northstar transformation." })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Discovery" })).toBeVisible();
  await expect(page.getByText("0 of 12 phases complete", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Problem Definition/ })).toBeDisabled();

  await page.getByRole("button", { name: "Complete phase" }).click();
  const missingRequirements = page.getByRole("alert").filter({ hasText: "Finish these requirements" });
  await expect(missingRequirements).toBeVisible();
  await expect(missingRequirements).toBeFocused();
  await expect(missingRequirements).toContainText("Select 1 more option for “What should the engagement team do first?”");
  await expect(missingRequirements).toContainText("Select 2 more options for “Which evidence should anchor discovery?”");
  await expect(missingRequirements).toContainText("Add 80 more characters to your reasoning");
  await expect(page.getByText("0 of 12 phases complete", { exact: true })).toBeVisible();

  const observeWorkflow = page.getByRole("radio", { name: /Observe real support work/ });
  const workflowBaseline = page.getByRole("checkbox", { name: /Workflow and baseline metrics/ });
  const stakeholderMap = page.getByRole("checkbox", { name: /Stakeholder authority map/ });
  const reasoning = page.getByRole("textbox", { name: "Explain your field reasoning" });

  await observeWorkflow.check();
  await workflowBaseline.check();
  await stakeholderMap.check();
  await reasoning.fill(draftReasoning);

  // Leave through a global Next.js link immediately, before the 500 ms autosave
  // is expected to fire. The editor's navigation/unmount flush must preserve it.
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Learn", exact: true }).click();
  await expect(page).toHaveURL(/\/learn$/);
  const navigationSavedDraft = await page.evaluate(() => {
    const raw = window.localStorage.getItem("fde-learning-lab-capstone-progress-v1");
    return raw ? JSON.parse(raw).phases.discovery : null;
  });
  expect(navigationSavedDraft).toMatchObject({
    completed: false,
    reasoning: draftReasoning,
    selections: {
      "first-move": ["observe-workflow"],
      evidence: ["workflow-baseline", "stakeholder-map"],
    },
  });

  await page.goto("/capstone");
  await expect(observeWorkflow).toBeChecked();
  await expect(workflowBaseline).toBeChecked();
  await expect(stakeholderMap).toBeChecked();
  await expect(reasoning).toHaveValue(draftReasoning);

  await reasoning.fill(completedReasoning);
  await page.getByRole("button", { name: "Complete phase" }).click();
  await expect(page.getByText("1 of 12 phases complete", { exact: true })).toBeVisible();
  await expect(page.getByText("Completed", { exact: true })).toBeVisible();
  const deterministicReview = page.getByLabel("Deterministic field review");
  await expect(deterministicReview).toContainText("90/100");
  await expect(deterministicReview).toContainText("This authored score—not AI coaching—controls completion and skill evidence.");

  await page.getByRole("button", { name: "Continue" }).click();
  const problemDefinitionHeading = page.getByRole("heading", { level: 2, name: "Problem Definition" });
  await expect(problemDefinitionHeading).toBeVisible();
  await expect(problemDefinitionHeading).toBeFocused();

  await page.getByRole("button", { name: "Previous phase" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Discovery" })).toBeFocused();
  await page.getByRole("button", { name: "Get coach feedback" }).click();
  const coachReview = page.getByLabel("Advisory AI coach review");
  await expect(coachReview).toBeVisible();
  await expect(coachReview).toContainText("Advisory mock coach review");
  await expect(coachReview).toContainText("Does not affect completion or skill evidence");
  await expect(page.getByText("Mock coaching saved. It does not affect phase completion or skill evidence.")).toBeVisible();
  await expect(page.getByText("1 of 12 phases complete", { exact: true })).toBeVisible();
  await expect(page.getByText("Completed", { exact: true })).toBeVisible();

  const coachedProgress = await page.evaluate(() => {
    const raw = window.localStorage.getItem("fde-learning-lab-capstone-progress-v1");
    return raw ? JSON.parse(raw) : null;
  });
  expect(coachedProgress.phases.discovery).toMatchObject({
    completed: true,
    deterministicEvaluation: { overall: 90 },
    aiReview: { mode: "mock", provider: "mock" },
  });

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(problemDefinitionHeading).toBeFocused();
  await page.reload();
  await expect(page.getByRole("heading", { level: 2, name: "Problem Definition" })).toBeVisible();
  await expect(page.getByText("1 of 12 phases complete", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => {
    const raw = window.localStorage.getItem("fde-learning-lab-capstone-progress-v1");
    return raw ? JSON.parse(raw).currentPhaseId : null;
  })).toBe("problem-definition");

  // Cached deterministic and optional coach scores are not trust boundaries.
  // Progress must recompute the evidence from the authored controls above.
  await page.evaluate(() => {
    const key = "fde-learning-lab-capstone-progress-v1";
    const progress = JSON.parse(window.localStorage.getItem(key) ?? "null");
    progress.phases.discovery.deterministicEvaluation.overall = 1;
    progress.phases.discovery.deterministicEvaluation.dimensions = {
      customerAlignment: 1,
      architecture: 1,
      safety: 1,
      deliveryReadiness: 1,
    };
    progress.phases.discovery.aiReview.scores = {
      customerAlignment: 2,
      architecture: 2,
      safety: 2,
      deliveryReadiness: 2,
    };
    window.localStorage.setItem(key, JSON.stringify(progress));
  });

  await page.locator("header").getByRole("link", { name: "Progress" }).click();
  const summary = page.getByLabel("Visitor progress summary");
  await expect(summary.getByText("1/12", { exact: true })).toBeVisible();
  await expect(page.getByText(/Based on 1 saved practice, completed Field Mission, and completed Capstone evidence item/)).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Discovery skill score: 90%" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Customer Delivery skill score: 90%" })).toBeVisible();
  await expect(page.getByText("Continue Problem Definition. Your decisions and field notes are saved on this device.")).toBeVisible();
});

test("the capstone remains usable at 360 px with reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/capstone");

  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(page.getByLabel("Choose capstone phase")).toBeVisible();
  await expect(page.getByLabel("Choose capstone phase")).toHaveValue("discovery");
  await expect(page.getByLabel("Choose capstone phase").locator("option:disabled")).toHaveCount(11);

  await page.getByRole("radio", { name: /Observe real support work/ }).check();
  await page.getByRole("checkbox", { name: /Workflow and baseline metrics/ }).check();
  await page.getByRole("textbox", { name: "Explain your field reasoning" }).fill("A short mobile draft.");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByText("Draft saved on this device.")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
