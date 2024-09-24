"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod as parse } from "@conform-to/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFormState } from "react-dom";
import { HoneypotInputs } from "remix-utils/honeypot/react";

import { CheckboxField, ErrorList, Field } from "@/app/_components/forms";
import { StatusButton } from "@/app/_components/ui/status-button";
import { AuthenticityTokenInput } from "@/utils/csrf.client";

import { login as loginAction } from "../../actions";
import { LoginFormSchema } from "../../schema";

export function Form() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [actionState, login] = useFormState(loginAction, undefined);

  const [form, fields] = useForm({
    id: "login-form",
    constraint: getZodConstraint(LoginFormSchema),
    lastResult: actionState,
    defaultValue: { redirectTo },
    onValidate({ formData }) {
      return parse(formData, { schema: LoginFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <div className="mx-auto w-full max-w-md px-8">
      <form action={login} {...getFormProps(form)}>
        <AuthenticityTokenInput />
        <HoneypotInputs label="Please leave this field blank" />
        <Field
          labelProps={{ children: "Username" }}
          errors={fields.username.errors}
          inputProps={{
            ...getInputProps(fields.username, { type: "text" }),
            autoFocus: true,
            className: "lowercase",
          }}
        />

        <Field
          labelProps={{ children: "Password" }}
          inputProps={getInputProps(fields.password, {
            type: "password",
          })}
          errors={fields.password.errors}
        />

        <div className="flex justify-between">
          <CheckboxField
            labelProps={{
              htmlFor: fields.remember.id,
              children: "Remember me",
            }}
            buttonProps={getInputProps(fields.remember, { type: "checkbox" })}
            errors={fields.remember.errors}
          />
          <div>
            <Link
              href="/forgot-password"
              className="text-body-xs font-semibold"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <input {...getInputProps(fields.redirectTo, { type: "hidden" })} />

        <ErrorList errors={form.errors} id={form.errorId} />

        <div className="flex items-center justify-between gap-6 pt-3">
          <StatusButton className="w-full" type="submit" form={form.id}>
            Log in
          </StatusButton>
        </div>
      </form>

      <div className="flex items-center justify-center gap-2 pt-6">
        <span className="text-muted-foreground">New here?</span>
        <Link
          href={
            redirectTo ? `/signup?${encodeURIComponent(redirectTo)}` : "/signup"
          }
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
