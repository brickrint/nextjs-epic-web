"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "./button";

export function SubmitButton(props: ButtonProps) {
  const { pending } = useFormStatus();

  return <Button {...props} type="submit" disabled={pending} />;
}
