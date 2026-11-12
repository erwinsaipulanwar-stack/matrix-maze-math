import { Link } from "@tanstack/react-router";
import { BookOpen, ClipboardCheck, Home, Puzzle, Smile } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { AvatarBubble } from "./Avatar";
import { useUserData } from "@/hooks/use-user-data";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/beranda", label: "Beranda", icon: Home },
  { to: "/belajar", label: "Belajar", icon: BookOpen },
  { to: "/latihan", label: "Latihan", icon: Puzzle },
  { to: "/evaluasi", label: "Evaluasi", icon: ClipboardCheck },
  { to: "/profil", label: "Profil", icon: Smile },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { profile, points } = useUserData();
  return (
    <div className="min-h-screen bg-dots">
      <header className="sticky top-0 z-30 border-b-2 border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <Link to="/beranda" aria-label="Mahtrix beranda">
            <Logo className="text-xl sm:text-2xl" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Menu utama">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 font-display font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-sunny-soft !text-foreground" }}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-sunny px-3 py-1 font-display text-sm font-bold shadow-[0_3px_0_0_var(--sunny-shade)]">
              ⭐ {points}
            </span>
            <Link to="/profil" aria-label="Profil saya" className="hidden md:block">
              <AvatarBubble id={profile?.avatar} size="sm" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-5 pb-28 md:pt-8 md:pb-16">{children}</main>

      <nav
        aria-label="Menu utama"
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 rounded-t-3xl border-t-2 border-border bg-card px-2 pt-2 shadow-float md:hidden"
      >
        <ul className="grid grid-cols-5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link to={to} className="group flex flex-col items-center gap-0.5 py-1">
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "flex h-9 w-12 items-center justify-center rounded-2xl transition-all",
                        isActive ? "bg-coral text-primary-foreground shadow-[0_3px_0_0_var(--coral-shade)]" : "text-muted-foreground",
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span
                      className={cn(
                        "font-display text-[11px] font-semibold",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {label}
                    </span>
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function PageTitle({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-card text-3xl shadow-[0_4px_0_0_var(--border-shade)]">
        {emoji}
      </span>
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
