"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, House, Import, PanelsTopLeft, Settings, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/overview", label: "Overview", icon: House },
  { href: "/import", label: "Import Chats", icon: Import },
  { href: "/complaints", label: "Complaints", icon: PanelsTopLeft },
  { href: "/work-orders", label: "Work Orders", icon: FileText },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-sidebar px-4 pb-5 pt-7">
      <Link href="/overview" onClick={onNavigate} className="mx-3 mb-9 w-fit" aria-label="HostelHub Triage home">
        <span className="block text-[22px] font-medium tracking-[-0.8px]">HostelHub</span>
        <span className="mt-0.5 block font-mono text-[10px] tracking-[0.3em] text-muted-foreground">TRIAGE</span>
      </Link>
      <nav aria-label="Main navigation" className="space-y-1">
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} onClick={onNavigate} aria-current={pathname === href ? "page" : undefined}
            className={cn("flex min-h-11 items-center gap-3 rounded-[6px] px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", pathname === href && "bg-muted font-medium text-foreground")}>
            <Icon size={18} aria-hidden="true" />{label}
          </Link>
        ))}
      </nav>
      <div className="mt-10">
        <p className="mb-3 px-3 font-mono text-[10px] tracking-wider text-muted-foreground">MANAGE</p>
        {[{ label: "Maintenance Staff", icon: Users }, { label: "Settings", icon: Settings }].map(({ label, icon: Icon }) => (
          <button key={label} type="button" disabled title="Planned for V2" className="flex min-h-11 w-full items-center gap-3 px-3 text-left text-sm text-muted-foreground opacity-60">
            <Icon size={18} className="shrink-0" aria-hidden="true" /><span>{label}</span><span className="sr-only"> (planned for V2)</span>
          </button>
        ))}
      </div>
      <div className="mt-auto pt-12">
        <div className="flex items-center gap-3 rounded-[6px] border bg-white px-3 py-3">
          <Sparkles size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          <div><p className="text-xs text-muted-foreground">AI triage powered by</p><p className="mt-0.5 text-sm font-medium">Gemma 4</p></div>
        </div>
        <div className="mt-6 flex items-center gap-3 px-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm text-white" aria-hidden="true">W</span>
          <div><p className="text-sm font-medium">Warden</p><p className="mt-0.5 text-xs text-muted-foreground">Hostel Block B</p></div>
        </div>
      </div>
    </div>
  );
}
