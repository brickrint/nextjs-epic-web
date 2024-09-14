"use client";

import { useEffect } from "react";
import { toast as showToast } from "sonner";

import type { Toast } from "./toast.server";

export function ShowToast({ toast }: { toast: Toast }) {
  const { id, type, title, description } = toast;

  useEffect(() => {
    setTimeout(() => {
      showToast[type](title, { id, description });
    }, 0);
  }, [description, id, title, type]);
  return null;
}
