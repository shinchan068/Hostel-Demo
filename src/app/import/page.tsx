import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImportWorkspace } from "@/components/import/import-workspace";

export const metadata: Metadata = { title: "Import Chats" };

async function getSampleChat() {
  "use cache";
  const sampleChat = await readFile(path.join(process.cwd(), "sample_whatsapp_dump.md"), "utf8");
  return sampleChat;
}

export default async function ImportPage() {
  const sampleChat = await getSampleChat();
  return <ImportWorkspace sampleChat={sampleChat} />;
}
