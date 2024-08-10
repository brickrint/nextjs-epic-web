import {
  type FieldMetadata,
  getFieldsetProps,
  getInputProps,
  getTextareaProps,
} from "@conform-to/react";
import Image from "next/image";
import { useState } from "react";

import { Label } from "@/app/_components/ui/label";
import { Textarea } from "@/app/_components/ui/textarea";
import { cn } from "@/utils/styles";

import {
  type ImageFieldsetSchema,
  type NoteEditorSchema,
} from "../notes/schema";

export function ImageChooser({
  config,
}: {
  config: FieldMetadata<ImageFieldsetSchema, NoteEditorSchema>;
}) {
  const { id, altText, file } = config.getFieldset();

  const existingImage = Boolean(id);
  const [previewImage, setPreviewImage] = useState<string | null>(
    id.initialValue ? `/api/images/${id.initialValue}` : null,
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

export function ErrorList({
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
