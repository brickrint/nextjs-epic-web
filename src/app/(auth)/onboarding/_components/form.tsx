"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod as parse } from "@conform-to/zod";
import { useSearchParams } from "next/navigation";
import { useFormState } from "react-dom";
import { HoneypotInputs } from "remix-utils/honeypot/react";

import { CheckboxField, ErrorList, Field } from "@/app/_components/forms";
import { StatusButton } from "@/app/_components/ui/status-button";
import { AuthenticityTokenInput } from "@/utils/csrf.client";
import { redirectToQueryParam } from "@/utils/verification.server";

import { onboard } from "../../actions";
import { SignupFormSchema } from "../../schema";

export function Form() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get(redirectToQueryParam);

  const [lastResult, signup] = useFormState(onboard, undefined);

  const [form, fields] = useForm({
    id: "signup-form",
    constraint: getZodConstraint(SignupFormSchema),
    lastResult,
    defaultValue: { redirectTo },
    onValidate({ formData }) {
      return parse(formData, { schema: SignupFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <form
      className="mx-auto min-w-[368px] max-w-sm"
      action={signup}
      {...getFormProps(form)}
    >
      <AuthenticityTokenInput />
      <HoneypotInputs label="Please leave this field blank" />
      <Field
        labelProps={{ htmlFor: fields.username.id, children: "Username" }}
        inputProps={{
          ...getInputProps(fields.username, {
            type: "text",
          }),
          autoComplete: "username",
          inputMode: "text",
          className: "lowercase",
        }}
        errors={fields.username.errors}
      />
      <Field
        labelProps={{ htmlFor: fields.name.id, children: "Name" }}
        inputProps={{
          ...getInputProps(fields.name, {
            type: "text",
          }),
          inputMode: "text",
          autoComplete: "name",
        }}
        errors={fields.name.errors}
      />
      <Field
        labelProps={{ htmlFor: fields.password.id, children: "Password" }}
        inputProps={{
          ...getInputProps(fields.password, { type: "password" }),
          autoComplete: "new-password",
          inputMode: "none",
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
          inputMode: "none",
        }}
        errors={fields.confirmPassword.errors}
      />

      <CheckboxField
        labelProps={{
          htmlFor: fields.agreeToTermsOfServiceAndPrivacyPolicy.id,
          children: "Do you agree to our Terms of Service and Privacy Policy?",
        }}
        buttonProps={getInputProps(
          fields.agreeToTermsOfServiceAndPrivacyPolicy,
          { type: "checkbox" },
        )}
        errors={fields.agreeToTermsOfServiceAndPrivacyPolicy.errors}
      />
      <CheckboxField
        labelProps={{
          htmlFor: fields.remember.id,
          children: "Remember me",
        }}
        buttonProps={getInputProps(fields.remember, { type: "checkbox" })}
        errors={fields.remember.errors}
      />

      <input {...getInputProps(fields.redirectTo, { type: "hidden" })} />
      <ErrorList errors={form.errors} id={form.errorId} />

      <div className="flex items-center justify-between gap-6">
        <StatusButton className="w-full" type="submit">
          Create an account
        </StatusButton>
      </div>
    </form>
  );
}
