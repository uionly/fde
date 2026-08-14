"use client";

import { BookOpen, ChartNoAxesColumnIncreasing, Library, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ResetVisitorSession } from "@/components/labs/reset-visitor-session";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", exactOnly: true },
  { href: "/learn", label: "Learn", activePrefixes: ["/learn"] },
  { href: "/labs", label: "AI Labs", activePrefixes: ["/labs", "/games", "/experiments"] },
  { href: "/practice", label: "Practice", activePrefixes: ["/practice"] },
  { href: "/case-studies", label: "Customer Engagement", activePrefixes: ["/case-studies", "/capstone"] },
] as const;

const utilityItems = [
  { href: "/progress", label: "Progress", icon: ChartNoAxesColumnIncreasing },
  { href: "/resources", label: "Resources", icon: Library },
  { href: "/search", label: "Search learning lab", shortLabel: "Search", icon: Search },
] as const;

const aiLabsNavItems = [
  { href: "/labs", label: "Overview", matches: (pathname: string, hash: string) => pathname === "/labs" && hash !== "#field-missions" },
  { href: "/games", label: "Field Arcade", matches: (pathname: string) => matchesPath(pathname, "/games") },
  { href: "/experiments", label: "Playgrounds", matches: (pathname: string) => matchesPath(pathname, "/experiments") },
  { href: "/labs#field-missions", label: "Field Missions", matches: (pathname: string, hash: string) => pathname.startsWith("/labs/") || (pathname === "/labs" && hash === "#field-missions") },
] as const;

function matchesPath(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isNavItemActive(pathname: string, item: typeof navItems[number]) {
  if ("exactOnly" in item) return pathname === item.href;
  return item.activePrefixes.some((prefix) => matchesPath(pathname, prefix));
}

function subscribeToHashChange(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  window.addEventListener("popstate", onStoreChange);
  return () => {
    window.removeEventListener("hashchange", onStoreChange);
    window.removeEventListener("popstate", onStoreChange);
  };
}

function getHashSnapshot() {
  return window.location.hash;
}

function getServerHashSnapshot() {
  return "";
}

export function SiteHeader() {
  const pathname = usePathname();
  const hash = useSyncExternalStore(subscribeToHashChange, getHashSnapshot, getServerHashSnapshot);
  const [open, setOpen] = useState(false);
  const activeAILabsLinkRef = useRef<HTMLAnchorElement>(null);
  const aiLabsNavRef = useRef<HTMLElement>(null);
  const aiLabsContext = ["/labs", "/games", "/experiments"].some((prefix) => matchesPath(pathname, prefix));

  useEffect(() => {
    const activeLink = activeAILabsLinkRef.current;
    const navigation = aiLabsNavRef.current;
    if (!activeLink || !navigation) return;

    const edgePadding = 8;
    const activeLeft = activeLink.offsetLeft;
    const activeRight = activeLeft + activeLink.offsetWidth;
    const visibleLeft = navigation.scrollLeft;
    const visibleRight = visibleLeft + navigation.clientWidth;

    if (activeLeft < visibleLeft + edgePadding) navigation.scrollLeft = Math.max(0, activeLeft - edgePadding);
    else if (activeRight > visibleRight - edgePadding) navigation.scrollLeft = activeRight - navigation.clientWidth + edgePadding;
  }, [hash, pathname]);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link aria-label="FDE Learning Lab home" className="group flex shrink-0 items-center gap-2.5" href="/">
          <span className="grid size-8 place-items-center rounded-md bg-foreground text-background transition-transform group-hover:-rotate-3">
            <BookOpen aria-hidden="true" className="size-[17px]" strokeWidth={2.25} />
          </span>
          <span className="hidden text-sm font-bold tracking-[-0.02em] sm:inline">FDE Learning Lab</span>
        </Link>

        <nav aria-label="Main navigation" className="ml-auto hidden items-center gap-0.5 lg:flex">
          {navItems.map((item) => {
            const exact = pathname === item.href;
            const active = isNavItemActive(pathname, item);
            return (
              <Link
                aria-current={exact ? "page" : active ? "location" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  active && "bg-accent text-accent-foreground",
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          {utilityItems.map((item, index) => {
            const active = matchesPath(pathname, item.href);
            const Icon = item.icon;
            return (
              <Button asChild className={cn(index < 2 && "hidden sm:inline-flex", active && "bg-accent text-accent-foreground")} key={item.href} size="icon" variant="ghost">
                <Link aria-current={active ? "page" : undefined} aria-label={item.label} href={item.href} title={"shortLabel" in item ? item.shortLabel : item.label}>
                  <Icon aria-hidden="true" className="size-[18px]" />
                </Link>
              </Button>
            );
          })}
          <ThemeToggle />
          <Button
            aria-controls="mobile-menu"
            aria-expanded={open}
            aria-label={open ? "Close navigation" : "Open navigation"}
            className="lg:hidden"
            onClick={() => setOpen((value) => !value)}
            size="icon"
            variant="ghost"
          >
            {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav aria-label="Mobile navigation" className="border-t bg-background px-4 py-3 lg:hidden" id="mobile-menu">
          <div className="mx-auto grid max-w-[1440px] gap-1 sm:grid-cols-2">
            {navItems.map((item) => {
              const exact = pathname === item.href;
              const active = isNavItemActive(pathname, item);
              return (
                <Link
                  aria-current={exact ? "page" : active ? "location" : undefined}
                  className={cn("rounded-md px-3 py-2.5 text-sm font-medium", active ? "bg-accent text-accent-foreground" : "hover:bg-muted")}
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-2 grid grid-cols-2 gap-1 border-t pt-2 sm:col-span-2">
              {utilityItems.slice(0, 2).map((item) => (
                <Link
                  aria-current={matchesPath(pathname, item.href) ? "page" : undefined}
                  className={cn("rounded-md px-3 py-2.5 text-sm font-medium", matchesPath(pathname, item.href) ? "bg-accent text-accent-foreground" : "hover:bg-muted")}
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      ) : null}

      {aiLabsContext ? (
        <div className="border-t bg-background/95">
          <div className="mx-auto flex max-w-[1440px] items-stretch px-4 sm:px-6 lg:px-8">
            <nav aria-label="AI Labs navigation" className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain" ref={aiLabsNavRef}>
              <div className="flex min-w-max items-center gap-1 py-2">
                {aiLabsNavItems.map((item) => {
                  const active = item.matches(pathname, hash);
                  const exactPage = !item.href.includes("#") && pathname === item.href;
                  const className = cn(
                    "shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    active && "bg-muted text-foreground",
                  );
                  const content = item.label;

                  if (item.href.includes("#")) {
                    return (
                      <a
                        aria-current={active ? "location" : undefined}
                        className={className}
                        href={item.href}
                        key={item.href}
                        ref={active ? activeAILabsLinkRef : undefined}
                      >
                        {content}
                      </a>
                    );
                  }

                  return (
                    <Link
                      aria-current={active ? (exactPage ? "page" : "location") : undefined}
                      className={className}
                      href={item.href}
                      key={item.href}
                      ref={active ? activeAILabsLinkRef : undefined}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            </nav>
            <ResetVisitorSession className="ml-1 flex shrink-0 items-center border-l bg-background/95 pl-1 sm:ml-2 sm:pl-2" triggerClassName="whitespace-nowrap px-2 text-[11px] sm:px-3 sm:text-xs" />
          </div>
        </div>
      ) : null}
    </header>
  );
}
