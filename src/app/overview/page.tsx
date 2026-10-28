import type { Metadata } from "next";
import { House } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = { title: "Overview" };

export default function Page() {
  return (
    <PagePlaceholder
      title="Overview"
      description="Hostel operations at a glance."
      icon={House}
      label="Your hostel overview, in one place"
      message="Analytics and activity summaries are planned for V2. The MVP focuses on importing chats, organizing complaints, and exporting maintenance work orders."
      deferred
    />
  );
}
