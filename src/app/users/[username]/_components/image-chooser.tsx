import { useState } from "react";
import Image from "next/image";

import { Label } from "@/app/_components/ui/label";
import { Textarea } from "@/app/_components/ui/textarea";
import { useHydrated } from "@/utils/misc.client";
import { cn } from "@/utils/styles";

export function ImageChooser({
  image,
}: {
  image?: { id: string; altText?: string | null };
}) {
  const existingImage = Boolean(image);
  const [previewImage, setPreviewImage] = useState<string | null>(
    image ? `/api/images/${image.id}` : null,
  );
  const [altText, setAltText] = useState(image?.altText ?? "");

  const isHydrated = useHydrated();

  return (
    <fieldset>
      <div className="flex gap-3">
        <div className="w-32">
          <div className="relative h-32 w-32">
            <label
              htmlFor="image-input"
              className={cn("group absolute h-32 w-32 rounded-lg", {
                "bg-accent opacity-40 focus-within:opacity-100 hover:opacity-100":
                  !previewImage && isHydrated,
                "cursor-pointer focus-within:ring-4":
                  !existingImage && isHydrated,
              })}
            >
              {previewImage && isHydrated ? (
                <div className="relative">
                  <Image
                    src={previewImage}
                    alt={altText ?? ""}
                    width={32}
                    height={32}
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
                <input name="imageId" type="hidden" value={image?.id} />
              ) : null}
              <input
                id="image-input"
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
                name="file"
                type="file"
                accept="image/*"
              />
            </label>
          </div>
        </div>
        <div className="flex-1">
          <Label htmlFor="alt-text">Alt Text</Label>
          <Textarea
            id="alt-text"
            name="altText"
            defaultValue={altText}
            onChange={(e) => setAltText(e.currentTarget.value)}
          />
        </div>
      </div>
    </fieldset>
  );
}
