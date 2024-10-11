"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod as parse } from "@conform-to/zod";
import { useSearchParams } from "next/navigation";
import { useFormState } from "react-dom";
import { HoneypotInputs } from "remix-utils/honeypot/react";

import { ErrorList, Field } from "@/app/_components/forms";
import { StatusButton } from "@/app/_components/ui/status-button";
import { AuthenticityTokenInput } from "@/utils/csrf.client";

import { verify as verifyAction } from "../../actions";
import {
  VerifySchema,
  codeQueryParam,
  redirectToQueryParam,
  targetQueryParam,
  typeQueryParam,
} from "../../schema";

export function Form() {
  const params = useSearchParams();

  const [actionData, verify] = useFormState(verifyAction, undefined);

  if (!params.has(codeQueryParam)) {
    // we don't want to show an error message on page load if the otp hasn't be
    // prefilled in yet, so we'll send a response with an empty submission.
    // return json({
    //   status: "idle",
    //   submission: {
    //     intent: "",
    //     payload: Object.fromEntries(params) as Record<string, unknown>,
    //     error: {} as Record<string, Array<string>>,
    //   },
    // } as const);
  }

  const [form, fields] = useForm({
    id: "verify-form",
    constraint: getZodConstraint(VerifySchema),
    lastResult: actionData,
    onValidate({ formData }) {
      return parse(formData, { schema: VerifySchema });
    },
    defaultValue: {
      code: params.get(codeQueryParam) ?? "",
      target: params.get(targetQueryParam) ?? "",
      redirectTo: params.get(redirectToQueryParam) ?? "",
      type: params.get(typeQueryParam) ?? "",
    },
  });

  return (
    <div className="mx-auto flex w-72 max-w-full flex-col justify-center gap-1">
      <div>
        <ErrorList errors={form.errors} id={form.errorId} />
      </div>
      <div className="flex w-full gap-2">
        <form action={verify} {...getFormProps(form)} className="flex-1">
          <AuthenticityTokenInput />
          <HoneypotInputs label="Please leave this field blank" />
          <Field
            labelProps={{
              htmlFor: fields[codeQueryParam].id,
              children: "Code",
            }}
            inputProps={getInputProps(fields[codeQueryParam], { type: "text" })}
            errors={fields[codeQueryParam].errors}
          />
          <input
            {...getInputProps(fields[typeQueryParam], { type: "hidden" })}
          />
          <input
            {...getInputProps(fields[targetQueryParam], { type: "hidden" })}
          />
          <input
            {...getInputProps(fields[redirectToQueryParam], { type: "hidden" })}
          />
          <StatusButton className="w-full" type="submit">
            Submit
          </StatusButton>
        </form>
      </div>
    </div>
  );
}
