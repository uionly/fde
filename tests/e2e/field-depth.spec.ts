import { expect, test } from "@playwright/test";
import { getAllChallenges, getAllLabs, getAllLessons, getAllResources } from "../../lib/content/loaders";

const reasoning = "The customer evidence identifies the failing boundary. I will preserve caller permissions, test allowed and denied cases, and verify the final workflow before accepting the change.";

test("debugging requires evidence, saves work, and resets with the visitor profile", async ({ page }) => {
  const challenge = getAllChallenges().find((item) => item.id === "crm-access-incident")!;
  if (challenge.kind !== "debugging") throw new Error("Wrong challenge kind");
  await page.goto(`/challenges/${challenge.id}`);
  await page.getByRole("button", { name: "Evaluate work" }).click();
  await expect(page.getByRole("heading", { name: /Work needs revision/ })).toBeVisible();
  await page.getByRole("radio", { name: challenge.causes.find((item) => item.id === challenge.correctCause)!.label }).check();
  await page.getByRole("radio", { name: challenge.remediations.find((item) => item.id === challenge.correctRemediation)!.label }).check();
  for (const id of challenge.requiredEvidence) {
    const evidence = challenge.evidence.find((item) => item.id === id)!;
    await page.getByText(`${evidence.title} · ${evidence.type}`, { exact: true }).click();
    await page.getByRole("checkbox", { name: `Cite ${evidence.title}` }).check();
  }
  await page.getByLabel("Your reasoning and verification plan").fill(reasoning);
  await page.getByRole("button", { name: "Evaluate work" }).click();
  await expect(page.getByRole("heading", { name: /Authored checks passed/ })).toBeVisible();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.reload();
  await expect(page.getByLabel("Your reasoning and verification plan")).toHaveValue(reasoning);
  await expect(page.getByRole("heading", { name: /Authored checks passed/ })).toBeVisible();
  await page.goto("/progress");
  await expect(page.getByRole("region", { name: "Field challenge progress" }).getByText("Authored checks passed")).toBeVisible();
  await page.goto("/labs");
  await page.getByRole("button", { name: "Start fresh" }).click();
  await page.getByRole("button", { name: "Clear progress" }).click();
  expect(await page.evaluate(() => localStorage.getItem("fde-learning-lab-challenges-v1"))).toBeNull();
});

test("architecture can be built with keyboard controls, rejects bypasses, and resumes", async ({ page }) => {
  const challenge = getAllChallenges().find((item) => item.id === "permission-aware-architecture")!;
  if (challenge.kind !== "architecture") throw new Error("Wrong kind");
  await page.goto(`/challenges/${challenge.id}`);
  for (const node of challenge.catalog) await page.getByRole("checkbox", { name: new RegExp(`^${node.label}`) }).check();
  for (const edge of challenge.example.edges) {
    await page.getByLabel("From component").selectOption(edge.source);
    await page.getByLabel("To component").selectOption(edge.target);
    await page.getByRole("button", { name: "Add connection" }).click();
  }
  await page.getByLabel("Your reasoning and verification plan").fill(reasoning);
  await page.getByRole("button", { name: "Evaluate work" }).click();
  await expect(page.getByRole("heading", { name: /Authored checks passed/ })).toBeVisible();
  await page.getByLabel("From component").selectOption("data");
  await page.getByLabel("To component").selectOption("model");
  await page.getByRole("button", { name: "Add connection" }).click();
  await page.getByRole("button", { name: "Evaluate work" }).click();
  await expect(page.getByRole("heading", { name: /Work needs revision/ })).toBeVisible();
  await page.getByRole("button", { name: "Remove Source documents to Model", exact: true }).click();
  await page.getByText("Import or export graph JSON", { exact: true }).click();
  await page.getByRole("button", { name: "Export JSON" }).click();
  const exported = JSON.parse(await page.getByLabel("Graph JSON", { exact: true }).inputValue());
  expect(exported.edges).toHaveLength(challenge.example.edges.length);
  await page.getByLabel("Graph JSON", { exact: true }).fill('{"nodes":[],"edges":[{"source":"bad","target":"unknown"}]}');
  await page.getByRole("button", { name: "Import JSON" }).click();
  await expect(page.getByText(/Invalid graph/)).toBeVisible();
  await expect(page.getByRole("list", { name: "Connections" }).getByRole("listitem")).toHaveCount(challenge.example.edges.length);
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: /Authored checks passed/ })).toBeVisible();
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({ path: "/private/tmp/fde-architecture-mobile.png", fullPage: true });
});

test("lab blocks unvalidated work and completes only after authored checks", async ({ page }) => {
  const lab = getAllLabs().find((item) => item.id === "discovery-workshop")!;
  await page.goto(`/labs/${lab.slug}`);
  await page.getByRole("button", { name: "Save & continue" }).click();
  await page.getByRole("button", { name: "Save & continue" }).click();
  await expect(page.getByText(/Write at least 80 characters/)).toBeVisible();
  for (const step of lab.steps.filter((item) => item.validation)) {
    await expect(page.getByRole("heading", { name: step.title })).toBeVisible();
    await page.getByLabel("Your working notes").fill(reasoning);
    const correct = step.validation!.check.choices.find((choice) => choice.id === step.validation!.check.correct)!;
    await page.getByRole("radio", { name: correct.text }).check();
    await page.getByRole("button", { name: step.id === lab.steps.at(-1)!.id ? "Complete mission" : "Save & continue" }).click();
  }
  await expect(page.getByRole("heading", { name: "Engagement complete" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Engagement complete" })).toBeVisible();
  await page.goto("/progress");
  await expect(page.getByRole("progressbar", { name: "Discovery skill score: 100%" })).toBeVisible();
  // Legacy/forged flags without the authored check do not count as skill evidence.
  await page.evaluate(() => {
    const key = "fde-learning-lab-visitor-progress-v1"; const progress = JSON.parse(localStorage.getItem(key)!);
    progress.labs["discovery-workshop"].state = {}; localStorage.setItem(key, JSON.stringify(progress));
  });
  await page.reload();
  await expect(page.getByRole("progressbar", { name: "Discovery skill score: 0%" })).toBeVisible();
});

test("all new lessons render with sources, practice links, and reference downloads", async ({ page, request }) => {
  for (const lesson of getAllLessons().filter((item) => item.frontmatter.reviewedAt)) {
    await page.goto(`/learn/${lesson.frontmatter.track}/${lesson.frontmatter.slug}`);
    await expect(page.getByRole("heading", { level: 1, name: lesson.frontmatter.title })).toBeVisible();
    await expect(page.getByRole("region", { name: "Sources and review date" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Practice this topic" })).toHaveAttribute("href", `/practice?lesson=${lesson.frontmatter.id}`);
  }
  for (const resource of getAllResources()) {
    const response = await request.get(`/api/resources/${resource.slug}`);
    expect(response.ok()).toBe(true); expect(await response.text()).toBe(resource.body);
  }
});

test("reference filters, full-text search, and removed operations route behave honestly", async ({ page, request }) => {
  const response = await request.get("/operations"); expect(response.status()).toBe(404);
  await page.goto("/resources");
  await page.getByRole("searchbox", { name: "Find a template" }).fill("denominator");
  await page.getByRole("button", { name: "Filter", exact: true }).click();
  await expect(page.getByRole("link", { name: /Evaluation Scorecard/ })).toBeVisible();
  await page.goto("/search?q=403&type=challenge");
  await expect(page.getByRole("link", { name: /Login works, CRM returns 403/ })).toBeVisible();
  await page.goto("/search?q=x&q=y&type=unknown");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
