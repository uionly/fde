import type { Metadata } from "next";
import { BriefcaseBusiness } from "lucide-react";

import { PagePreview } from "@/components/layout/page-preview";

export const metadata: Metadata = { title: "Capstone" };

export default function CapstonePage() {
  return (
    <PagePreview
      description="Own the Northstar AI transformation end to end—from stakeholder discovery and target architecture to production rollout, adoption, and ROI."
      eyebrow="Full FDE engagement"
      icon={BriefcaseBusiness}
      items={[
        { label: "Discover & Design", detail: "Map the workflow, define success, surface constraints, and shape the architecture." },
        { label: "Build & Evaluate", detail: "Create the smallest useful system and prove retrieval, agent, and safety quality." },
        { label: "Deploy & Distill", detail: "Operationalize, drive adoption, measure impact, and identify reusable product patterns." },
      ]}
      note="The capstone deliberately withholds information so you must ask before you design."
      title="Lead the engagement."
    />
  );
}
