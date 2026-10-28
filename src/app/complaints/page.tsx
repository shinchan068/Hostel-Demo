import type { Metadata } from "next";
import { PanelsTopLeft } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = { title: "Complaints Board" };

export default function Page() {
  return (
    <PagePlaceholder
      title="Complaints Board"
      description="Track and manage hostel complaints from triage to resolution."
      icon={PanelsTopLeft}
      label="Every complaint has a place"
      message="The complaints board is coming in Phase 3, with Todo, In Progress, and Resolved columns. Imported complaints will appear here once that flow is connected."
      
    />
  );
}
