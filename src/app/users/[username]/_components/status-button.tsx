"use client";

import {
  type StatusButtonProps,
  StatusButton as SharedStatusButton,
} from "@/app/_components/ui/status-button";
import { useFormStatus } from "react-dom";

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
