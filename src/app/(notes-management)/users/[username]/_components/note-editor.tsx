"use client";

import {
  type FieldMetadata,
  type SubmissionResult,
  getFieldsetProps,
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import type { Note, NoteImage } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import { useFormState } from "react-dom";
import { HoneypotInputs } from "remix-utils/honeypot/react";

import { floatingToolbarClassName } from "@/app/_components/floating-toolbar";
import { ErrorList, Field, TextareaField } from "@/app/_components/forms";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { StatusButton } from "@/app/_components/ui/status-button";
import { Textarea } from "@/app/_components/ui/textarea";
import { AuthenticityTokenInput } from "@/utils/csrf.client";
import { getNoteImgSrc } from "@/utils/misc.server";
import { cn } from "@/utils/styles";

import { type ImageFieldsetSchema, NoteEditorSchema } from "../notes/schema";

export function NoteEditor({
  note,
  action,
}: {
  note?: Pick<Note, "id" | "title" | "content"> & {
    images: Array<Pick<NoteImage, "id" | "altText">>;
  };
  action: (
    prevState: unknown,
    formData: FormData,
  ) => Promise<SubmissionResult<string[]>>;
}) {
  const [actionState, updateNote] = useFormState(action, null);

  const [form, fields] = useForm<NoteEditorSchema>({
    id: "note-edit",
    lastResult: actionState,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: NoteEditorSchema });
    },
    defaultValue: {
      title: note?.title,
      content: note?.content,
      images: note?.images ?? [{}],
    },
  });

  const imageList = fields.images.getFieldList();

  return (
    <div className="absolute inset-0">
      <form
        action={updateNote}
        {...getFormProps(form)}
        className="flex h-full flex-col gap-y-4 overflow-y-auto overflow-x-hidden px-10 pb-28 pt-12"
      >
        <AuthenticityTokenInput />
        <HoneypotInputs label="Please leave this field blank" />
        {/*
					This hidden submit button is here to ensure that when the user hits
					"enter" on an input field, the primary form function is submitted
					rather than the first button in the form (which is delete/add image).
				*/}
        <button type="submit" className="hidden" />
        <div className="flex flex-col gap-1">
          <Field
            labelProps={{
              children: "Title",
            }}
            inputProps={{
              ...getInputProps(fields.title, { type: "text" }),
              autoFocus: true,
            }}
            errors={fields.title.errors}
          />
          <TextareaField
            labelProps={{
              children: "Content",
            }}
            textareaProps={getTextareaProps(fields.content)}
            errors={fields.content.errors}
          />
          <div>
            <Label>Image</Label>
            <ul className="flex flex-col gap-4">
              {imageList.map((image, index) => (
                <li
                  key={image.key}
                  className="relative border-b-2 border-muted-foreground"
                >
                  <Button
                    variant="ghost"
                    className="absolute right-0 top-0 h-auto pr-0 pt-0 text-foreground-destructive"
                    {...form.remove.getButtonProps({
                      name: fields.images.name,
                      index,
                    })}
                  >
                    <span aria-hidden>❌</span>{" "}
                    <span className="sr-only">Remove image {index + 1}</span>
                  </Button>
                  <ImageChooser config={image} />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Button
          className="mt-3"
          {...form.insert.getButtonProps({
            name: fields.images.name,
            defaultValue: {},
          })}
        >
          <span aria-hidden>➕ Image</span>{" "}
          <span className="sr-only">Add image</span>
        </Button>
        <ErrorList id={form.errorId} errors={form.errors} />
      </form>
      <div className={floatingToolbarClassName}>
        <Button
          {...form.reset.getButtonProps()}
          variant="destructive"
          type="reset"
        >
          Reset
        </Button>

        <StatusButton form={form.id} type="submit">
          Submit
        </StatusButton>
      </div>
    </div>
  );
}

export function ImageChooser({
  config,
}: {
  config: FieldMetadata<ImageFieldsetSchema, NoteEditorSchema>;
}) {
  const { id, altText, file } = config.getFieldset();

  const existingImage = Boolean(id);
  const [previewImage, setPreviewImage] = useState<string | null>(
    id.initialValue ? getNoteImgSrc(id.initialValue) : null,
  );

  return (
    <fieldset {...getFieldsetProps(config)}>
      <div className="flex gap-3">
        <div className="w-32">
          <div className="relative h-32 w-32">
            <label
              htmlFor={file.id}
              className={cn("group absolute h-32 w-32 rounded-lg", {
                "bg-accent opacity-40 focus-within:opacity-100 hover:opacity-100":
                  !previewImage,
                "cursor-pointer focus-within:ring-4": !existingImage,
              })}
            >
              {previewImage ? (
                <div className="relative">
                  <Image
                    src={previewImage}
                    alt={altText.value ?? ""}
                    width={200}
                    height={200}
                    quality={100}
                    className="h-32 w-32 rounded-lg object-cover"
                  />
                  {existingImage ? null : (
                    <div className="pointer-events-none absolute -right-0.5 -top-0.5 rotate-12 rounded-sm bg-secondary px-2 py-1 text-xs text-secondary-foreground shadow-md">
                      new
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-lg border border-muted-foreground text-4xl text-muted-foreground">
                  ➕
                </div>
              )}
              {existingImage ? (
                <input
                  {...getInputProps(id, {
                    type: "hidden",
                  })}
                  key={id.id}
                />
              ) : null}
              <input
                {...getInputProps(file, {
                  type: "file",
                })}
                key={file.id}
                aria-label="Image"
                className="absolute left-0 top-0 z-0 h-32 w-32 cursor-pointer opacity-0"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setPreviewImage(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setPreviewImage(null);
                  }
                }}
                accept="image/*"
              />
            </label>
          </div>
          <div className="min-h-[32px] px-4 pb-3 pt-1">
            <ErrorList id={file.errorId} errors={file.errors} />
          </div>
        </div>
        <div className="flex-1">
          <Label htmlFor={altText.id}>Alt Text</Label>
          <Textarea {...getTextareaProps(altText)} key={altText.id} />
          <div className="min-h-[32px] px-4 pb-3 pt-1">
            <ErrorList id={altText.errorId} errors={altText.errors} />
          </div>
        </div>
      </div>
      <div className="min-h-[32px] px-4 pb-3 pt-1">
        <ErrorList id={config.errorId} errors={config.errors} />
      </div>
    </fieldset>
  );
}
