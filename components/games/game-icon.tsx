import { Bot, BrainCircuit, CircleGauge, DatabaseZap, Network, ShieldAlert } from "lucide-react";

import type { FieldGame } from "@/lib/content/schemas";

export function GameIcon({ category, className }: { category: FieldGame["category"]; className?: string }) {
  const icons = { models: BrainCircuit, security: ShieldAlert, retrieval: Network, agents: Bot, data: DatabaseZap, evaluations: CircleGauge };
  const Icon = icons[category];
  return <Icon aria-hidden="true" className={className} />;
}
