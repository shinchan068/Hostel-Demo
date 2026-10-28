import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = { title: "Work Orders" };

export default function Page() {
  return (
    <PagePlaceholder
      title="Work Orders"
      description="Organized maintenance tasks for your hostel staff."
      icon={FileText}
      label="Maintenance dispatch, simplified"
      message="A dedicated work order workspace is planned for V2. In the MVP, you’ll export a formatted WhatsApp work order directly from the complaints board."
      deferred
    />
  );
}
