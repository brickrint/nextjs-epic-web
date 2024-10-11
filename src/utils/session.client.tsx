"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { logout as logoutAction } from "@/app/(auth)/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/_components/ui/alert-dialog";

import { AuthenticityTokenInput } from "./csrf.client";

export function LogoutTimer() {
  const [status, setStatus] = useState<"idle" | "show-modal">("idle");
  const pathname = usePathname();
  const logoutTime = 1000 * 60 * 60;
  const modalTime = logoutTime - 1000 * 60 * 2;
  const modalTimer = useRef<ReturnType<typeof setTimeout>>();
  const logoutTimer = useRef<ReturnType<typeof setTimeout>>();

  const formRef = useRef<HTMLFormElement>(null);

  const logout = useCallback(() => {
    formRef.current?.requestSubmit();
  }, []);

  const cleanupTimers = useCallback(() => {
    clearTimeout(modalTimer.current);
    clearTimeout(logoutTimer.current);
  }, []);

  const resetTimers = useCallback(() => {
    cleanupTimers();
    modalTimer.current = setTimeout(() => {
      setStatus("show-modal");
    }, modalTime);
    logoutTimer.current = setTimeout(logout, logoutTime);
  }, [cleanupTimers, logout, logoutTime, modalTime]);

  useEffect(() => resetTimers(), [resetTimers, pathname]);
  useEffect(() => cleanupTimers, [cleanupTimers]);

  function closeModal() {
    setStatus("idle");
    resetTimers();
  }

  return (
    <AlertDialog
      aria-label="Pending Logout Notification"
      open={status === "show-modal"}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you still there?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          You are going to be logged out due to inactivity. Close this modal to
          stay logged in.
        </AlertDialogDescription>
        <AlertDialogFooter className="flex items-end gap-8">
          <AlertDialogCancel onClick={closeModal}>
            Remain Logged In
          </AlertDialogCancel>
          <form action={logoutAction} ref={formRef}>
            <AuthenticityTokenInput />
            <AlertDialogAction type="submit">Logout</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
