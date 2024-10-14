"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod as parse } from "@conform-to/zod";
import { useFormState } from "react-dom";

import { verify2FA } from "@/app/(profile)/actions";
import { VerifySchema } from "@/app/(profile)/schema";
import { Field } from "@/app/_components/forms";
import { StatusButton } from "@/app/_components/ui/status-button";
import { AuthenticityTokenInput } from "@/utils/csrf.client";

export function Form() {
  const [lastResult, verify] = useFormState(verify2FA, undefined);

  const [form, fields] = useForm({
    id: "verify-form",
    constraint: getZodConstraint(VerifySchema),
    lastResult,
    onValidate({ formData }) {
      return parse(formData, { schema: VerifySchema });
    },
  });

  return (
    <form action={verify} {...getFormProps(form)} className="flex-1">
      <AuthenticityTokenInput />
      <Field
        labelProps={{
          htmlFor: fields.code.id,
          children: "Code",
        }}
        inputProps={{
          ...getInputProps(fields.code, { type: "text" }),
          autoFocus: true,
          inputMode: "numeric",
        }}
        errors={fields.code.errors}
      />
      <div className="flex justify-between gap-4">
        <StatusButton
          className="w-full"
          type="submit"
          name="intent"
          value="verify"
        >
          Submit
        </StatusButton>
        <StatusButton
          className="w-full"
          variant="secondary"
          type="submit"
          name="intent"
          value="cancel"
        >
          Cancel
        </StatusButton>
      </div>
    </form>
  );
}
