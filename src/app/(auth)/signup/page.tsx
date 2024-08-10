import type { Metadata } from "next";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";

export default function SignupPage() {
  return (
    <div className="container flex min-h-full flex-col justify-center pb-32 pt-20">
      <div className="mx-auto w-full max-w-lg">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-h1">Welcome aboard!</h1>
          <p className="text-body-md text-muted-foreground">
            Please enter your details.
          </p>
        </div>
        <form
          method="POST"
          action="/api/images/00000"
          className="mx-auto flex min-w-[368px] max-w-sm flex-col gap-4"
        >
          <div style={{ display: "none" }} aria-hidden>
            <label htmlFor="name-input">Please leave this field blank</label>
            <input id="name-input" name="name" type="text" />
          </div>
          <div>
            <Label htmlFor="email-input">Email</Label>
            <Input autoFocus id="email-input" name="email" type="email" />
          </div>
          <Button className="w-full" type="submit">
            Create an account
          </Button>
        </form>
      </div>
    </div>
  );
}

export const metadata: Metadata = { title: "Setup Epic Notes Account" };
