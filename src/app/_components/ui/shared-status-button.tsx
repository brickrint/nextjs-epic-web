import { CheckIcon, Cross1Icon, UpdateIcon } from "@radix-ui/react-icons";
import * as React from "react";
import { useSpinDelay } from "spin-delay";

import { cn } from "@/utils/styles";

import { Button, type ButtonProps } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export type StatusButtonProps = ButtonProps & {
  status: "pending" | "success" | "error" | "idle";
  message?: string | null;
  spinDelay?: Parameters<typeof useSpinDelay>[1];
};

export const StatusButton = React.forwardRef<
  HTMLButtonElement,
  StatusButtonProps
>(({ message, status, className, children, spinDelay, ...props }, ref) => {
  const delayedPending = useSpinDelay(status === "pending", {
    delay: 400,
    minDuration: 300,
    ...spinDelay,
  });
  const companion = {
    pending: delayedPending ? (
      <div className="inline-flex h-6 w-6 items-center justify-center">
        <UpdateIcon className="animate-spin" />
      </div>
    ) : null,
    success: (
      <div className="inline-flex h-6 w-6 items-center justify-center">
        <CheckIcon />
      </div>
    ),
    error: (
      <div className="bg-destructive inline-flex h-6 w-6 items-center justify-center rounded-full">
        <Cross1Icon className="text-destructive-foreground" />
      </div>
    ),
    idle: null,
  }[status];

  return (
    <Button
      ref={ref}
      className={cn("flex justify-center gap-4", className)}
      {...props}
    >
      <div>{children}</div>
      {message ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>{companion}</TooltipTrigger>
            <TooltipContent>{message}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        companion
      )}
    </Button>
  );
});
StatusButton.displayName = "Button";
