"use client";

import { LogIn, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function AuthNav() {
  const { data: session, status } = useSession();

  if (status === "loading") return <span aria-label="Loading profile" className="size-9 animate-pulse rounded-full bg-muted" />;

  if (!session?.user) {
    return <Button asChild size="sm" variant="outline"><Link href="/signin"><LogIn aria-hidden="true" className="size-4" />Sign in</Link></Button>;
  }

  return (
    <div className="flex items-center gap-1">
      <Link aria-label="Open progress profile" className="grid size-9 place-items-center rounded-full bg-foreground text-background" href="/dashboard" title={session.user.name ?? session.user.email ?? "Learner profile"}>
        <UserRound aria-hidden="true" className="size-4" />
      </Link>
      <Button aria-label="Sign out" onClick={() => signOut({ redirectTo: "/" })} size="icon" variant="ghost"><LogOut aria-hidden="true" className="size-4" /></Button>
    </div>
  );
}
