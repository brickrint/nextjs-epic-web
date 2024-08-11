import { Honeypot, SpamError } from "remix-utils/honeypot/server";

import { env } from "@/env";

import { invariantError } from "./misc.server";

export const honeypot = new Honeypot({
  validFromFieldName: env.NEXT_PUBLIC_NODE_ENV === "test" ? null : undefined, // null to disable it
  encryptionSeed: env.NEXT_PUBLIC_HONEYPOT_ENCRYPTION_SEED,
});

export function checkHoneypot(formData: FormData) {
  try {
    honeypot.check(formData);
  } catch (error) {
    if (error instanceof SpamError) {
      invariantError(false, "Form not submitted properly", { status: 400 });
    }
  }
}
