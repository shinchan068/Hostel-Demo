import type { Metadata } from "next";
import { ComplaintsBoard } from "@/components/complaints/complaints-board";

export const metadata: Metadata = { title: "Complaints Board" };

export default function ComplaintsPage() {
  return <ComplaintsBoard />;
}
