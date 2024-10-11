"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod as parse } from "@conform-to/zod";
import { useFormState } from "react-dom";
import { HoneypotInputs } from "remix-utils/honeypot/react";

import { ErrorList, Field } from "@/app/_components/forms";
import { StatusButton } from "@/app/_components/ui/status-button";
import { AuthenticityTokenInput } from "@/utils/csrf.client";

import { resetPassword as resetPasswordAction } from "../../actions";
import { ResetPasswordSchema } from "../../schema";

export function Form() {
  const [lastResult, resetPassword] = useFormState(
    resetPasswordAction,
    undefined,
  );

  const [form, fields] = useForm({
    id: "reset-password",
    constraint: getZodConstraint(ResetPasswordSchema),
    lastResult,
    onValidate({ formData }) {
      return parse(formData, { schema: ResetPasswordSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <div className="mx-auto mt-16 min-w-[368px] max-w-sm">
      <form action={resetPassword} {...getFormProps(form)}>
        <AuthenticityTokenInput />
        <HoneypotInputs label="Please leave this field blank" />

        <Field
          labelProps={{
            htmlFor: fields.password.id,
            children: "New Password",
          }}
          inputProps={{
            ...getInputProps(fields.password, { type: "password" }),
            autoComplete: "new-password",
            autoFocus: true,
          }}
          errors={fields.password.errors}
        />
        <Field
          labelProps={{
            htmlFor: fields.confirmPassword.id,
            children: "Confirm Password",
          }}
          inputProps={{
            ...getInputProps(fields.confirmPassword, { type: "password" }),
            autoComplete: "new-password",
          }}
          errors={fields.confirmPassword.errors}
        />

        <ErrorList errors={form.errors} id={form.errorId} />

        <StatusButton className="w-full" type="submit">
          Reset password
        </StatusButton>
      </form>
    </div>
  );
}
