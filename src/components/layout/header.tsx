"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Plus, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4 md:px-8">
      <div className="md:hidden">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open navigation" />}><Menu aria-hidden="true" /></SheetTrigger>
          <SheetContent side="left" className="w-[min(280px,85vw)] gap-0 shadow-none">
            <SheetTitle className="sr-only">HostelHub navigation</SheetTitle>
            <SheetDescription className="sr-only">Navigate between HostelHub pages.</SheetDescription>
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
      <span className="hidden font-mono text-[10px] tracking-widest text-muted-foreground md:block">HOSTEL OPERATIONS</span>
      <div className="relative ml-auto hidden w-full max-w-sm sm:block">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input disabled aria-label="Search complaints (coming soon)" placeholder="Search complaints, rooms, students…" className="h-9 bg-white pl-9 text-xs disabled:opacity-70" />
      </div>
      <Link href="/import" className={buttonVariants({ className: "ml-auto h-9 px-3 sm:ml-0" })}>
        <Plus aria-hidden="true" />Import Chats
      </Link>
      <div className="ml-1 hidden items-center gap-2 border-l pl-4 lg:flex" aria-label="Warden profile">
        <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-xs text-white" aria-hidden="true">W</span>
        <span className="text-xs">Warden</span>
      </div>
    </header>
  );
}
