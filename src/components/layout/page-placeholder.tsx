import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function PagePlaceholder({ title, description, icon: Icon, label, message, deferred = false }: {
  title: string;
  description: string;
  icon: LucideIcon;
  label: string;
  message: string;
  deferred?: boolean;
}) {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-[28px] font-medium leading-tight tracking-[-1px] md:text-[30px]">{title}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p></div>
        <span className="rounded-full border bg-white px-3 py-1 font-mono text-[10px] tracking-wide text-muted-foreground">{deferred ? "PLANNED FOR V2" : "COMING NEXT"}</span>
      </div>
      <section aria-label={label} className="flex min-h-[360px] flex-col items-center justify-center rounded-[6px] border bg-white px-6 py-16 text-center md:min-h-[440px]">
        <div className="mb-6 flex size-12 items-center justify-center rounded-[6px] border bg-background"><Icon size={22} strokeWidth={1.5} aria-hidden="true" /></div>
        <p className="mb-3 font-mono text-[10px] tracking-widest text-muted-foreground">HOSTELHUB TRIAGE</p>
        <h2 className="text-xl font-medium tracking-tight">{label}</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{message}</p>
        {deferred ? <Link href="/import" className={buttonVariants({ variant: "outline", className: "mt-6 h-9 px-4" })}>Go to Import Chats<ArrowRight aria-hidden="true" /></Link> : null}
      </section>
    </>
  );
}
