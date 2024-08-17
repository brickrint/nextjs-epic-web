"use client";

import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { usePathname, useSearchParams } from "next/navigation";
import { useId } from "react";

import { useDebounce } from "@/utils/misc.client";

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { StatusButton } from "./ui/status-button";

type SearchBarProps = {
  autoFocus?: boolean;
  autoSubmit?: boolean;
  initialSearch?: string | null;
};

export function SharedSearchBar({
  autoFocus = false,
  autoSubmit = false,
  initialSearch,
}: SearchBarProps) {
  const id = useId();

  const handleFormChange = useDebounce((form: HTMLFormElement) => {
    // submit(form);
  }, 400);

  return (
    <form
      method="GET"
      action="/users"
      className="flex flex-wrap items-center justify-center gap-2"
      onChange={(e) => autoSubmit && handleFormChange(e.currentTarget)}
    >
      <div className="flex-1">
        <Label htmlFor={id} className="sr-only">
          Search
        </Label>
        <Input
          type="search"
          name="search"
          id={id}
          defaultValue={initialSearch ?? ""}
          placeholder="Search"
          className="w-full"
          autoFocus={autoFocus}
        />
      </div>
      <div>
        <StatusButton
          type="submit"
          className="flex w-full items-center justify-center"
          size="sm"
        >
          <MagnifyingGlassIcon />
          <span className="sr-only">Search</span>
        </StatusButton>
      </div>
    </form>
  );
}

export function SearchBar(props: SearchBarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  if (pathname === "/users") {
    return null;
  }

  return (
    <SharedSearchBar {...props} initialSearch={searchParams.get("search")} />
  );
}
