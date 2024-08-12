"use client";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { AuthenticityTokenInput } from "@/utils/csrf.client";

export function Form() {
  return (
    <form
      method="POST"
      className="mx-auto flex min-w-[368px] max-w-sm flex-col gap-4"
    >
      <AuthenticityTokenInput />

      <div>
        <Label htmlFor="email-input">Email</Label>
        <Input autoFocus id="email-input" name="email" type="email" />
      </div>
      <Button className="w-full" type="submit">
        Create an account
      </Button>
    </form>
  );
}
