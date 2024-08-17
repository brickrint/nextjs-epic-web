"use client";

import { useFormStatus } from "react-dom";

import {
  StatusButton as SharedStatusButton,
  type StatusButtonProps,
} from "./shared-status-button";

export function StatusButton(
  props: Omit<StatusButtonProps, "status" | "disabled">,
) {
  const { pending } = useFormStatus();

  return (
    <SharedStatusButton
      status={pending ? "pending" : "idle"}
      disabled={pending}
      {...props}
    />
  );
}
