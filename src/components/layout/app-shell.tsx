import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 border-r md:block"><Sidebar /></aside>
      <div className="md:pl-56">
        <Header />
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-[1440px] px-5 py-8 outline-none md:px-8 md:py-9">{children}</main>
      </div>
    </div>
  );
}
