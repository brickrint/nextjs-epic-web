"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod as parse } from "@conform-to/zod";
import { useFormState } from "react-dom";

import { changeEmail as changeEmailAction } from "@/app/(profile)/actions";
import { ChangeEmailSchema } from "@/app/(profile)/schema";
import { ErrorList, Field } from "@/app/_components/forms";
import { StatusButton } from "@/app/_components/ui/status-button";
import { AuthenticityTokenInput } from "@/utils/csrf.client";

export function Form() {
  const [lastResult, changeEmail] = useFormState(changeEmailAction, undefined);

  const [form, fields] = useForm({
    id: "change-email-form",
    constraint: getZodConstraint(ChangeEmailSchema),
    lastResult,
    onValidate({ formData }) {
      return parse(formData, { schema: ChangeEmailSchema });
    },
  });

  return (
    <div>
      <div className="mx-auto mt-5 max-w-sm">
        <form action={changeEmail} {...getFormProps(form)}>
          <AuthenticityTokenInput />
          <Field
            labelProps={{ children: "New Email" }}
            inputProps={{
              ...getInputProps(fields.email, { type: "text" }),
              inputMode: "email",
            }}
            errors={fields.email.errors}
          />
          <ErrorList id={form.errorId} errors={form.errors} />
          <div>
            <StatusButton>Send Confirmation</StatusButton>
          </div>
        </form>
      </div>
    </div>
  );
}
