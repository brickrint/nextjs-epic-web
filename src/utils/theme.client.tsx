"use client";

import { getFormProps, getInputProps } from "@conform-to/react";
import { useForm } from "@conform-to/react";
import { parseWithZod as parse } from "@conform-to/zod";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useFormState } from "react-dom";

import { ErrorList } from "@/app/_components/forms";
import { Input } from "@/app/_components/ui/input";
import { toggleTheme as toggleThemeAction } from "@/app/users/[username]/notes/actions";

import { AuthenticityTokenInput } from "./csrf.client";
import { type Theme, ThemeFormSchema } from "./theme.server";

export function ThemeSwitch({ userPreference }: { userPreference?: Theme }) {
  const [actionState, toggleTheme] = useFormState(toggleThemeAction, undefined);

  const [form, field] = useForm({
    id: "theme-switch",
    onValidate({ formData }) {
      return parse(formData, { schema: ThemeFormSchema });
    },
  });

  const mode: Theme = userPreference ?? "light";
  const nextMode = mode === "light" ? "dark" : "light";

  const modeLabel = {
    light: (
      <>
        <span className="sr-only">Light</span>
        <SunIcon />
      </>
    ),
    dark: (
      <>
        <span className="sr-only">Dark</span>
        <MoonIcon />
      </>
    ),
  };

  return (
    <form action={toggleTheme} {...getFormProps(form)}>
      <AuthenticityTokenInput />
      <Input
        {...getInputProps(field.theme, { type: "hidden" })}
        value={nextMode}
        readOnly
      />
      <div className="flex gap-2">
        <button
          name="intent"
          value="update-theme"
          type="submit"
          className="flex h-8 w-8 cursor-pointer items-center justify-center"
        >
          {modeLabel[mode]}
        </button>
      </div>
      <ErrorList errors={form.errors} id={form.errorId} />
    </form>
  );
}
