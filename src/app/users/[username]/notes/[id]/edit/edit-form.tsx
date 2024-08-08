"use client";
import { useFormState } from "react-dom";

import { parseWithZod } from "@conform-to/zod";
import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { floatingToolbarClassName } from "@/app/_components/floating-toolbar";
import { Textarea } from "@/app/_components/ui/textarea";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";

import { StatusButton } from "../../../_components/status-button";
import { ImageChooser } from "../../../_components/image-chooser";
import { edit } from "../../actions";
import { NoteEditorSchema } from "../../schema";
import { type getNote } from "../../../db";

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

  const [form, fields] = useForm({
    id: "note-edit",
    lastResult: actionState,
    // Reuse the validation logic on the client
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: NoteEditorSchema });
    },
    defaultValue: {
      title: note.title,
      content: note.content,
    },
  });

  console.log("note", note);

  return (
    <>
      <form
        action={updateNote}
        {...getFormProps(form)}
        className="flex h-full flex-col gap-y-4 overflow-x-hidden px-10 pb-28 pt-12"
      >
        <div className="flex flex-col gap-1">
          <div>
            {/* 🦉 NOTE: this is not an accessible label, we'll get to that in the accessibility exercises */}
            <Label htmlFor={fields.title.id}>Title</Label>
            <Input {...getInputProps(fields.title, { type: "text" })} />
            <div className="min-h-[32px] px-4 pb-3 pt-1">
              <ErrorList
                id={fields.title.errorId}
                errors={fields.title.errors}
              />
            </div>
          </div>
          <div>
            {/* 🦉 NOTE: this is not an accessible label, we'll get to that in the accessibility exercises */}
            <Label htmlFor={fields.content.id}>Content</Label>
            <Textarea {...getTextareaProps(fields.content)} />
            <div className="min-h-[32px] px-4 pb-3 pt-1">
              <ErrorList
                id={fields.content.errorId}
                errors={fields.content.errors}
              />
            </div>
          </div>
          <div>
            <Label>Image</Label>
            <ImageChooser image={note.images?.[0]} />
          </div>
        </div>
        <ErrorList id={form.errorId} errors={form.errors} />
      </form>
      <div className={floatingToolbarClassName}>
        <Button form={form.id} variant="destructive" type="reset">
          Reset
        </Button>

        <StatusButton form={form.id} type="submit">
          Submit
        </StatusButton>
      </div>
    </>
  );
}

function ErrorList({
  id,
  errors,
}: {
  id?: string;
  errors?: Array<string> | null;
}) {
  return errors?.length ? (
    <ul id={id} className="flex flex-col gap-1">
      {errors.map((error, i) => (
        <li key={i} className="text-[10px] text-foreground-destructive">
          {error}
        </li>
      ))}
    </ul>
  ) : null;
}
