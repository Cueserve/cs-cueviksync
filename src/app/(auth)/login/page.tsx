"use client";

import Image from "next/image";
import { useActionState, useEffect } from "react";
import { signIn } from "@/app/actions/auth";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(signIn, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-12">
      <Card className="w-full max-w-96">
        <div className="flex flex-col items-center gap-2 mb-10">
          <h1 className="sr-only">CuevikSync</h1>
          <Image
            src="/logo/CuevikSync-Logo_Horizontal.png"
            alt="CuevikSync Logo"
            width={200}
            height={45}
            priority
            className="h-10 w-auto object-contain"
          />
        </div>

        <form action={action} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@yourcompany.com"
              defaultValue={state?.email || ""}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-semibold">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>

      <p className="text-xs text-muted-foreground text-center max-w-96">
        Accounts are provisioned by an administrator. Contact your admin if you
        cannot sign in.
      </p>
    </div>
  );
}
