"use client";

import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFormState } from "react-dom";
import { HoneypotInputs } from "remix-utils/honeypot/react";

import { floatingToolbarClassName } from "@/app/_components/floating-toolbar";
import { ErrorList, Field, TextareaField } from "@/app/_components/forms";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { AuthenticityTokenInput } from "@/utils/csrf.client";

import { StatusButton } from "../../../../../_components/ui/status-button";
import { ImageChooser } from "../../../_components/image-chooser";
import { type getNote } from "../../../db";
import { edit } from "../../actions";
import { NoteEditorSchema } from "../../schema";

export function EditForm({
  noteId,
  username,
  note,
}: {
  noteId: string;
  username: string;
  note: ReturnType<typeof getNote>;
}) {
  const editAction = edit.bind(null, {
    noteId,
    username,
  });
  const [actionState, updateNote] = useFormState(editAction, undefined);

  const [form, fields] = useForm<NoteEditorSchema>({
    id: "note-edit",
    lastResult: actionState,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: NoteEditorSchema });
    },
    defaultValue: {
      title: note.title,
      content: note.content,
      images: note.images.length ? note.images : [{}],
    },
  });

  const imageList = fields.images.getFieldList();

  return (
    <>
      <form
        action={updateNote}
        {...getFormProps(form)}
        className="flex h-full flex-col gap-y-4 overflow-x-hidden px-10 pb-28 pt-12"
      >
        <AuthenticityTokenInput />
        <HoneypotInputs label="Please leave this field blank" />
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
    </>
  );
}
