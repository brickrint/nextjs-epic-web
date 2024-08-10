"use client";

import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFormState } from "react-dom";

import { floatingToolbarClassName } from "@/app/_components/floating-toolbar";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Textarea } from "@/app/_components/ui/textarea";

import { ErrorList, ImageChooser } from "../../../_components/image-chooser";
import { StatusButton } from "../../../_components/status-button";
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
        <button type="submit" className="hidden" />
        <div className="flex flex-col gap-1">
          <div>
            <Label htmlFor={fields.title.id}>Title</Label>
            <Input
              {...getInputProps(fields.title, { type: "text" })}
              autoFocus
            />
            <div className="min-h-[32px] px-4 pb-3 pt-1">
              <ErrorList
                id={fields.title.errorId}
                errors={fields.title.errors}
              />
            </div>
          </div>
          <div>
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
