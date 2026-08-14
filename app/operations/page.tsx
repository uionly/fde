import type { Metadata } from "next";

import { AIOperationsCenter } from "@/components/operations/ai-operations-center";
import { getOperationsDashboard } from "@/lib/operations/dashboard";

export const metadata: Metadata = {
  title: "AI Operations Center",
  description: "Monitor model traffic, token economics, safety controls, and production AI incidents.",
};

export default function OperationsPage() {
  return <AIOperationsCenter data={getOperationsDashboard()} />;
}
