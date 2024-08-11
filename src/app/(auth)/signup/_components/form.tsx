"use client";

import { HoneypotInputs } from "remix-utils/honeypot/react";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";

export function Form() {
  return (
    <form
      method="POST"
      className="mx-auto flex min-w-[368px] max-w-sm flex-col gap-4"
    >
      <HoneypotInputs label="Please leave this field blank" />

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
