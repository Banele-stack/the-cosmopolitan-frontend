"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  Building2,
  FileWarning,
  Users,
  FileBadge2,
  ClipboardCheck,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import type { CurrentUser } from "@/lib/session";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  links: NavLink[];
}

const GROUPS: NavGroup[] = [
  {
    label: "Contractors",
    links: [
      { href: "/contractors", label: "Contractors", icon: Building2 },
      { href: "/documents/expiring", label: "Expiring Documents", icon: FileWarning },
    ],
  },
  {
    label: "Workforce",
    links: [
      { href: "/workers", label: "Workers", icon: Users },
      { href: "/certifications", label: "Certifications", icon: FileBadge2 },
    ],
  },
  {
    label: "Safety",
    links: [
      { href: "/inspections", label: "Inspections", icon: ClipboardCheck },
      { href: "/incidents", label: "Incidents", icon: AlertTriangle },
    ],
  },
];

interface NavbarProps {
  user?: CurrentUser;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const isGroupActive = (group: NavGroup) => group.links.some((link) => isActive(link.href));

  const initials = user
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenGroup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setMobileOpen(false)}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
              <ShieldCheck size={18} strokeWidth={2.5} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-[var(--foreground)]">
              Compliance<span className="font-normal text-[var(--foreground-muted)]">Pro</span>
            </span>
          </Link>

          <nav ref={navRef} className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/")
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Dashboard
            </Link>

            {GROUPS.map((group) => (
              <div key={group.label} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenGroup((current) => (current === group.label ? null : group.label))}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isGroupActive(group)
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                  }`}
                  aria-expanded={openGroup === group.label}
                >
                  {group.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${openGroup === group.label ? "rotate-180" : ""}`}
                  />
                </button>

                {openGroup === group.label && (
                  <div className="absolute left-0 top-full mt-1 w-56 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-lg">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpenGroup(null)}
                        className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          isActive(link.href)
                            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                            : "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <link.icon size={16} />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {user && (
              <Link
                href="/team"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive("/team")
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Team
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-muted)] text-xs font-semibold text-[var(--foreground)] ring-1 ring-[var(--border)]"
                title={`${user.name} — ${user.organizationName}`}
              >
                {initials}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:block text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            >
              Sign in
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-[var(--border)] px-4 py-3 md:hidden">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className={`block rounded-md px-3 py-2 text-sm font-medium ${
              isActive("/") ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--foreground-muted)]"
            }`}
          >
            Dashboard
          </Link>
          {GROUPS.map((group) => (
            <div key={group.label} className="mt-1">
              <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
                {group.label}
              </p>
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium ${
                    isActive(link.href)
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "text-[var(--foreground-muted)]"
                  }`}
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
          {user && (
            <Link
              href="/team"
              onClick={() => setMobileOpen(false)}
              className={`mt-1 block rounded-md px-3 py-2 text-sm font-medium ${
                isActive("/team") ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--foreground-muted)]"
              }`}
            >
              Team
            </Link>
          )}
          {user ? (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="mt-2 block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-[var(--foreground-muted)]"
            >
              Log out
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-2 block rounded-md px-3 py-2 text-sm font-medium text-[var(--foreground-muted)]"
            >
              Sign in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
