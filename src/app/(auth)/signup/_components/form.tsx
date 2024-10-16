"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod as parse } from "@conform-to/zod";
import { useSearchParams } from "next/navigation";
import { useFormState } from "react-dom";
import { HoneypotInputs } from "remix-utils/honeypot/react";

import { ErrorList, Field } from "@/app/_components/forms";
import { StatusButton } from "@/app/_components/ui/status-button";
import { AuthenticityTokenInput } from "@/utils/csrf.client";
import { redirectToQueryParam } from "@/utils/verification";

import { signup as signupAction } from "../../actions";
import { SignupSchema } from "../../schema";

export function Form() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get(redirectToQueryParam);

  const [actionState, signup] = useFormState(signupAction, undefined);

  const [form, fields] = useForm({
    id: "signup-form",
    constraint: getZodConstraint(SignupSchema),
    lastResult: actionState,
    defaultValue: { redirectTo },
    onValidate({ formData }) {
      return parse(formData, { schema: SignupSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <form action={signup} {...getFormProps(form)}>
      <AuthenticityTokenInput />
      <HoneypotInputs label="Please leave this field blank" />

      <Field
        labelProps={{
          htmlFor: fields.email.id,
          children: "Email",
        }}
        inputProps={{
          ...getInputProps(fields.email, { type: "email" }),
          autoFocus: true,
          inputMode: "email",
        }}
        errors={fields.email.errors}
      />

      <input {...getInputProps(fields.redirectTo, { type: "hidden" })} />

      <ErrorList errors={form.errors} id={form.errorId} />
      <StatusButton className="w-full" type="submit">
        Submit
      </StatusButton>
    </form>
  );
}
