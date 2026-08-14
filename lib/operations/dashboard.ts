import { z } from "zod";

import dashboardData from "@/content/operations/ai-operations-center.json";

const metricSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  value: z.number().nonnegative(),
  unit: z.string(),
  delta: z.number(),
  tone: z.enum(["cyan", "magenta", "emerald"]),
});

const modelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  model: z.string().min(1),
  status: z.enum(["healthy", "degraded"]),
  load: z.number().min(0).max(100),
  latency: z.number().nonnegative(),
  tokensPerSecond: z.number().nonnegative(),
});

const incidentSchema = z.object({
  id: z.string().min(1),
  severity: z.enum(["info", "warning", "critical"]),
  title: z.string().min(1),
  service: z.string().min(1),
  ageMinutes: z.number().int().nonnegative(),
  status: z.enum(["investigating", "mitigated", "monitoring", "resolved"]),
});

const terminalEntrySchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  level: z.enum(["info", "success", "warning"]),
  message: z.string().min(1),
});

export const operationsDashboardSchema = z.object({
  environment: z.string().min(1),
  region: z.string().min(1),
  updatedAt: z.iso.datetime(),
  metrics: z.array(metricSchema).min(4),
  models: z.array(modelSchema).min(1),
  activity: z.array(z.object({
    source: z.string().min(1),
    target: z.string().min(1),
    volume: z.number().min(0).max(100),
  })).min(1),
  incidents: z.array(incidentSchema),
  terminal: z.array(terminalEntrySchema).min(1),
});

export type OperationsDashboard = z.infer<typeof operationsDashboardSchema>;

export function getOperationsDashboard(): OperationsDashboard {
  return operationsDashboardSchema.parse(dashboardData);
}
