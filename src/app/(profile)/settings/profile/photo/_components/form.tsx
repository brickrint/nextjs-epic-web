"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod as parse } from "@conform-to/zod";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useState } from "react";
import { useFormState } from "react-dom";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { ServerOnly } from "remix-utils/server-only";

import { updateProfilePhoto as updateProfilePhotoAction } from "@/app/(profile)/actions";
import { PhotoFormSchema } from "@/app/(profile)/schema";
import { ErrorList } from "@/app/_components/forms";
import { Button } from "@/app/_components/ui/button";
import { StatusButton } from "@/app/_components/ui/status-button";
import { AuthenticityTokenInput } from "@/utils/csrf.client";
import { useDoubleCheck } from "@/utils/misc.client";
import { getUserImgSrc } from "@/utils/misc.server";
import type { getUser } from "@/utils/session.server";

export function Form({ user }: { user: Awaited<ReturnType<typeof getUser>> }) {
  const doubleCheckDeleteImage = useDoubleCheck();

  const [actionState, updateProfilePhoto] = useFormState(
    updateProfilePhotoAction,
    null,
  );

  const [form, fields] = useForm({
    id: "profile-photo",
    constraint: getZodConstraint(PhotoFormSchema),
    lastResult: actionState,
    onValidate({ formData }) {
      return parse(formData, { schema: PhotoFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  const [newImageSrc, setNewImageSrc] = useState<string | null>(null);

  return (
    <form
      onReset={() => setNewImageSrc(null)}
      action={updateProfilePhoto}
      {...getFormProps(form)}
      className="flex flex-col items-center justify-center gap-10"
    >
      <AuthenticityTokenInput />
      <HoneypotInputs label="Please leave this field blank" />
      <Image
        width={208}
        height={208}
        src={newImageSrc ?? (user ? getUserImgSrc(user.image?.id) : "")}
        alt={user?.name ?? user?.username}
        quality={100}
        className="h-52 w-52 rounded-full object-cover"
      />
      qewwq
      <ErrorList errors={fields.photoFile.errors} id={fields.photoFile.id} />
      <input
        {...getInputProps(fields.photoFile, { type: "file" })}
        accept="image/*"
        tabIndex={newImageSrc ? -1 : 0}
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              setNewImageSrc(event.target?.result?.toString() ?? null);
            };
            reader.readAsDataURL(file);
          }
        }}
        className="peer sr-only"
      />
      {newImageSrc ? (
        <div className="flex gap-4">
          <StatusButton type="submit">Save Photo</StatusButton>
          <Button
            {...form.reset.getButtonProps()}
            type="reset"
            variant="secondary"
          >
            Reset
          </Button>
        </div>
      ) : (
        <div className="flex gap-4 peer-invalid:[&>.server-only[type='submit']]:hidden">
          <Button asChild className="cursor-pointer">
            <label
              htmlFor={fields.photoFile.id}
              className="flex items-center gap-1.5"
            >
              <Pencil1Icon name="pencil-1" />
              Change
            </label>
          </Button>

          {/* This is here for progressive enhancement. If the client doesn't
						hydrate (or hasn't yet) this button will be available to submit the
						selected photo. */}
          <ServerOnly>
            {() => (
              <Button type="submit" className="server-only">
                Save Photo
              </Button>
            )}
          </ServerOnly>
          {user.image?.id ? (
            <Button
              variant="destructive"
              {...doubleCheckDeleteImage.getButtonProps({
                type: "submit",
                name: "intent",
                value: "delete",
              })}
              className="flex items-center gap-1.5"
            >
              <TrashIcon name="trash" />
              {doubleCheckDeleteImage.doubleCheck ? "Are you sure?" : "Delete"}
            </Button>
          ) : null}
        </div>
      )}
      <ErrorList errors={form.errors} />
    </form>
  );
}
