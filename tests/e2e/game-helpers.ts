import type { Locator, Page } from "@playwright/test";

export type ActivationMethod = "keyboard" | "pointer" | "touch";

const supportQueueRoutes = [
  ["Intent classification", "Fast model"],
  ["Payment status lookup", "Fast model"],
  ["Policy exception dispute", "Reasoning model"],
  ["Suspected fraud escalation", "Human review"],
] as const;

export async function activate(page: Page, control: Locator, method: ActivationMethod = "pointer") {
  if (method === "keyboard") {
    await control.focus();
    await page.keyboard.press("Enter");
    return;
  }

  if (method === "touch") {
    await control.tap();
    return;
  }

  await control.click();
}

export async function routeSupportQueue(page: Page, method: ActivationMethod = "pointer") {
  for (const [request, lane] of supportQueueRoutes) {
    await activate(page, page.getByRole("button", { name: new RegExp(`^Select request: ${request}`) }), method);
    await activate(page, page.getByRole("button", { name: `Route ${request} to ${lane}` }), method);
  }
}

export async function packPolicyEvidence(page: Page, method: ActivationMethod = "pointer") {
  for (const title of ["P2P transfer definitions", "Account takeover procedure", "Current transfer reversal policy"]) {
    await activate(page, page.getByRole("button", { name: `Include ${title}` }), method);
  }

  await activate(page, page.getByRole("button", { name: "Move Current transfer reversal policy up" }), method);
  await activate(page, page.getByRole("button", { name: "Move Current transfer reversal policy up" }), method);
  await activate(page, page.getByRole("button", { name: "Move Account takeover procedure up" }), method);
}
