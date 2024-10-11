"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod as parse } from "@conform-to/zod";
import Link from "next/link";
import { useFormState } from "react-dom";
import { HoneypotInputs } from "remix-utils/honeypot/react";

import { ErrorList, Field } from "@/app/_components/forms";
import { StatusButton } from "@/app/_components/ui/status-button";
import { AuthenticityTokenInput } from "@/utils/csrf.client";

import { forgotPassword as forgotPasswordAction } from "../../actions";
import { ForgotPasswordSchema } from "../../schema";

export function Form() {
  const [lastResult, forgotPassword] = useFormState(
    forgotPasswordAction,
    undefined,
  );

  const [form, fields] = useForm({
    id: "forgot-password-form",
    constraint: getZodConstraint(ForgotPasswordSchema),
    lastResult,
    onValidate({ formData }) {
      return parse(formData, { schema: ForgotPasswordSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <div className="mx-auto mt-16 min-w-[368px] max-w-sm">
      <form action={forgotPassword} {...getFormProps(form)}>
        <AuthenticityTokenInput />
        <HoneypotInputs label="Please leave this field blank" />
        <div>
          <Field
            labelProps={{
              htmlFor: fields.usernameOrEmail.id,
              children: "Username or Email",
            }}
            inputProps={{
              autoFocus: true,
              ...getInputProps(fields.usernameOrEmail, { type: "text" }),
            }}
            errors={fields.usernameOrEmail.errors}
          />
        </div>
        <ErrorList errors={form.errors} id={form.errorId} />

        <div className="mt-6">
          <StatusButton className="w-full" type="submit">
            Recover password
          </StatusButton>
        </div>
      </form>
      <Link href="/login" className="mt-11 text-center text-body-sm font-bold">
        Back to Login
      </Link>
    </div>
  );
}
