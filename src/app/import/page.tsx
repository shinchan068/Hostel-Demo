import type { Metadata } from "next";
import { Import } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = { title: "Import Chats" };

export default function Page() {
  return (
    <PagePlaceholder
      title="Import Chats"
      description="Paste your WhatsApp chat dump and let AI extract and organize complaints."
      icon={Import}
      label="A clearer way to triage hostel chats"
      message="Next, this workspace will let you paste chats, load a sample, and review extracted complaints before adding them to the board."
      
    />
  );
}
