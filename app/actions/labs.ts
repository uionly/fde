"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { getAllLabs } from "@/lib/content";
import { saveLabProgress } from "@/lib/labs/store";

const schema = z.object({ labId: z.string().min(1), currentStep: z.number().int().nonnegative(), state: z.record(z.string(), z.string()), completed: z.boolean() });
export async function updateLabProgress(input: z.infer<typeof schema>) {
  const session = await auth(); if (!session?.user) return { ok: false as const, error: "Sign in to save lab progress." };
  const parsed = schema.safeParse(input); const lab = parsed.success ? getAllLabs().find((item) => item.id === parsed.data.labId) : undefined;
  if (!parsed.success || !lab || parsed.data.currentStep >= lab.steps.length) return { ok: false as const, error: "Invalid lab progress." };
  const record = await saveLabProgress({ userId: session.user.id, email: session.user.email, name: session.user.name, ...parsed.data });
  return { ok: true as const, currentStep: record.currentStep, completed: record.completed };
}
