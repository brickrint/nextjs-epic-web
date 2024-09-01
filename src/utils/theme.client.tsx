"use client";

import { getFormProps, getInputProps } from "@conform-to/react";
import { useForm } from "@conform-to/react";
import { parseWithZod as parse } from "@conform-to/zod";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useMedia } from "use-media";

import { ErrorList } from "@/app/_components/forms";
import { Input } from "@/app/_components/ui/input";
import { toggleTheme as toggleThemeAction } from "@/app/users/[username]/notes/actions";

import { AuthenticityTokenInput } from "./csrf.client";
import { THEME_COOKIE_NAME, type Theme, ThemeFormSchema } from "./theme.server";

export function ThemeSwitch({ userPreference }: { userPreference?: Theme }) {
  const [actionState, toggleTheme] = useFormState(toggleThemeAction, undefined);
  const router = useRouter();

  const [form, field] = useForm({
    id: "theme-switch",
    onValidate({ formData }) {
      return parse(formData, { schema: ThemeFormSchema });
    },
  });

  const prefersColorScheme: Theme = useMedia(
    "(prefers-color-scheme: dark)",
    userPreference === "dark",
  )
    ? "dark"
    : "light";

  const mode = userPreference ?? "light";
  const nextMode = mode === "light" ? "dark" : "light";

  useEffect(() => {
    if (mode !== prefersColorScheme) {
      Cookies.set(THEME_COOKIE_NAME, prefersColorScheme);
      router.refresh();
    }
  }, [prefersColorScheme, mode, router]);

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
