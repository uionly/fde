import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sign in" };

async function signInDevelopment(formData: FormData) {
  "use server";
  try {
    await signIn("development", { email: formData.get("email"), redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) redirect("/signin?error=invalid");
    throw error;
  }
}

async function signInGoogle() {
  "use server";
  await signIn("google", { redirectTo: "/dashboard" });
}

export default function SignInPage() {
  const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  const devAuthEnabled = process.env.NODE_ENV !== "production" || process.env.ENABLE_DEV_AUTH === "true";

  return (
    <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-[1000px] items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">Learner workspace</p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Keep your fieldwork in context.</h1>
        <p className="mt-5 leading-7 text-muted-foreground">Sign in to persist lesson progress, practice evidence, active labs, and recommendations across sessions.</p>
        <div className="mt-8 flex items-start gap-3 rounded-lg border bg-muted/35 p-4 text-sm text-muted-foreground"><ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />Public lessons remain readable without an account.</div>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-lg sm:p-8">
        <div className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground"><KeyRound aria-hidden="true" className="size-5" /></div>
        <h2 className="mt-6 text-xl font-semibold">Sign in to continue</h2>
        <p className="mt-2 text-sm text-muted-foreground">Use a development identity locally or your configured provider.</p>

        {devAuthEnabled ? <form action={signInDevelopment} className="mt-7 space-y-4">
          <label className="block text-sm font-medium" htmlFor="email">Email</label>
          <input autoComplete="email" className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" defaultValue="learner@example.com" id="email" name="email" required type="email" />
          <Button className="w-full" type="submit">Continue as demo learner <ArrowRight aria-hidden="true" className="size-4" /></Button>
        </form> : null}

        {googleConfigured ? <form action={signInGoogle} className="mt-3"><Button className="w-full" type="submit" variant="outline">Continue with Google</Button></form> : null}

        {!devAuthEnabled && !googleConfigured ? <p className="mt-7 rounded-md border border-amber-500/25 bg-amber-500/8 p-3 text-sm text-amber-700 dark:text-amber-400">No authentication provider is configured.</p> : null}
      </div>
    </div>
  );
}
