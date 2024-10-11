"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod as parse } from "@conform-to/zod";
import type { User } from "@prisma/client";
import { AvatarIcon, TrashIcon } from "@radix-ui/react-icons";
import { useFormState } from "react-dom";

import {
  deleteData as deleteDataAction,
  signOutOfSessions as signOutOfSessionsAction,
  updateProfile as updateProfileAction,
} from "@/app/(profile)/actions";
import { ProfileFormSchema } from "@/app/(profile)/schema";
import { ErrorList, Field } from "@/app/_components/forms";
import { StatusButton } from "@/app/_components/ui/status-button";
import { AuthenticityTokenInput } from "@/utils/csrf.client";
import { useDoubleCheck } from "@/utils/misc.client";

export function UpdateProfile({ user }: { user: Partial<User> }) {
  const [actionState, updateProfile] = useFormState(
    updateProfileAction,
    undefined,
  );

  const [form, fields] = useForm({
    id: "edit-profile",
    constraint: getZodConstraint(ProfileFormSchema),
    lastResult: actionState,
    onValidate({ formData }) {
      return parse(formData, { schema: ProfileFormSchema });
    },
    defaultValue: {
      username: user.username,
      name: user.name ?? "",
    },
  });

  return (
    <form {...getFormProps(form)} action={updateProfile}>
      <AuthenticityTokenInput />
      <div className="grid grid-cols-6 gap-x-10">
        <Field
          className="col-span-3"
          labelProps={{
            htmlFor: fields.username.id,
            children: "Username",
          }}
          inputProps={getInputProps(fields.username, { type: "text" })}
          errors={fields.username.errors}
        />
        <Field
          className="col-span-3"
          labelProps={{ htmlFor: fields.name.id, children: "Name" }}
          inputProps={getInputProps(fields.name, { type: "text" })}
          errors={fields.name.errors}
        />
      </div>

      <ErrorList errors={form.errors} id={form.errorId} />

      <div className="mt-8 flex justify-center">
        <StatusButton
          type="submit"
          size="wide"
          name="intent"
          value="update-profile"
        >
          Save changes
        </StatusButton>
      </div>
    </form>
  );
}

export function DeleteData() {
  const dc = useDoubleCheck();

  return (
    <form action={deleteDataAction}>
      <AuthenticityTokenInput />
      <StatusButton
        {...dc.getButtonProps({
          type: "submit",
        })}
        variant={dc.doubleCheck ? "destructive" : "default"}
        className="inline-flex items-center gap-1.5"
      >
        <TrashIcon className="w-[1em] h-[1em] inline self-center" />

        {dc.doubleCheck ? `Are you sure?` : `Delete all your data`}
      </StatusButton>
    </form>
  );
}

export function SignOutSessions({
  userId,
  sessionsCount,
}: {
  userId: User["id"];
  sessionsCount: number;
}) {
  const signOutOfSessions = signOutOfSessionsAction.bind(null, userId);
  const dc = useDoubleCheck();

  const otherSessionsCount = sessionsCount - 1;

  return (
    <div>
      {otherSessionsCount ? (
        <form action={signOutOfSessions}>
          <AuthenticityTokenInput />
          <StatusButton
            {...dc.getButtonProps({
              type: "submit",
            })}
            variant={dc.doubleCheck ? "destructive" : "default"}
            className="inline-flex items-center gap-1.5"
          >
            <AvatarIcon />
            {dc.doubleCheck
              ? `Are you sure?`
              : `Sign out of ${otherSessionsCount} other sessions`}
          </StatusButton>
        </form>
      ) : (
        <span className="inline-flex items-center gap-1.5">
          <AvatarIcon
            name="avatar"
            className="w-[1em] h-[1em] inline self-center"
          />
          This is your only session
        </span>
      )}
    </div>
  );
}
