import React from "react";

import { Spacer } from "@/app/_components/spacer";
import { requireUserWithRole } from "@/utils/permissions";

type Props = Readonly<{
  children: React.ReactNode;
}>;

export default async function Layout({ children }: Props) {
  await requireUserWithRole("admin");

  return (
    <div className="container pb-32 pt-20">
      <div className="flex flex-col justify-center">
        <div className="text-center">
          <h1 className="text-h1">Admin</h1>
          <p className="mt-3 text-body-md text-muted-foreground">
            Yep, you`ve got admin permissions alright!
          </p>
        </div>
      </div>
      <Spacer size="xs" />
      <p className="mx-auto max-w-md text-center text-body-lg">
        Use your imagination. You could display all kinds of admin-y things on
        this page... For example, maybe a way to manage permissions?
      </p>
    </div>
  );
}
