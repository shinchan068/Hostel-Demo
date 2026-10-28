"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Complaint } from "@/lib/types";
import { formatWorkOrder } from "@/lib/work-order";

export function WorkOrderExportDialog({ complaints, onClose }: { complaints: Complaint[]; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [workOrder] = useState(() => formatWorkOrder(complaints));

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(workOrder);
      setMessage("Work order copied. Paste it into WhatsApp.");
    } catch {
      setMessage("Copy was unavailable. Select the work order text and copy it manually.");
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-[6px] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>WhatsApp work order</DialogTitle>
          <DialogDescription className="text-neutral-700">Exporting {complaints.length} open {complaints.length === 1 ? "complaint" : "complaints"} from your selection, grouped by trade. Missing locations are listed for follow-up.</DialogDescription>
        </DialogHeader>
        <label htmlFor="work-order-message" className="text-xs font-medium">Message preview</label>
        <Textarea id="work-order-message" readOnly value={workOrder} className="h-72 max-h-[45dvh] min-h-40 resize-y rounded-[6px] bg-white font-mono text-xs leading-5 [field-sizing:fixed]" />
        <p role="status" aria-live="polite" className="min-h-4 text-xs text-neutral-700">{message}</p>
        <DialogFooter className="rounded-b-[6px]">
          <Button onClick={() => void copyToClipboard()}>Copy to WhatsApp</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
