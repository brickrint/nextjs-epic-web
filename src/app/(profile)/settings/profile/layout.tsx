import { FileTextIcon } from "@radix-ui/react-icons";
import Link from "next/link";

import { Spacer } from "@/app/_components/spacer";
import { getUser } from "@/utils/session.server";

import { Breadcrumbs } from "../../_components/breadcrumbs";

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser();

  return (
    <div className="m-auto mb-24 mt-16 max-w-3xl">
      <div className="container">
        <ul className="flex gap-3">
          <li>
            <Link
              className="text-muted-foreground flex items-center gap-1.5"
              href={`/users/${user.username}`}
            >
              <FileTextIcon />
              Profile
            </Link>
          </li>
          <Breadcrumbs ignorePath="settings/profile" />
        </ul>
      </div>
      <Spacer size="xs" />
      <div className="mx-auto bg-muted px-6 py-8 md:container md:rounded-3xl">
        {children}
      </div>
    </div>
  );
}
