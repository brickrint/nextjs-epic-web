import {
  CameraIcon, // DotsHorizontalIcon,
  DownloadIcon,
  EnvelopeClosedIcon,
  LockClosedIcon,
  LockOpen1Icon,
} from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/app/_components/ui/button";
import { getUserImgSrc } from "@/utils/misc.server";
import { get2FAUser, getUser } from "@/utils/session.server";

import { DeleteData, SignOutSessions, UpdateProfile } from "./_components/form";

export default async function Page() {
  const user = await getUser();

  const isTwoFAEnabled = Boolean(await get2FAUser(user.id));

  return (
    <div className="flex flex-col gap-12">
      <div className="flex justify-center">
        <div className="relative h-52 w-52">
          <Image
            src={getUserImgSrc(user.image?.id)}
            alt={user.username}
            width={208}
            height={208}
            quality={100}
            className="h-full w-full rounded-full object-cover"
          />
          <Button
            asChild
            variant="outline"
            size="icon"
            className="absolute -right-3 top-3 flex items-center justify-center rounded-full p-0"
          >
            <Link
              href="profile/photo"
              title="Change profile photo"
              aria-label="Change profile photo"
            >
              <CameraIcon name="camera" className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <UpdateProfile user={user} />

      <div className="col-span-6 my-6 h-1 border-b-[1.5px] border-foreground" />
      <div className="col-span-full flex flex-col gap-6">
        <div>
          <Link
            href="profile/two-factor"
            className="p-0 inline-flex items-center gap-1.5"
          >
            {isTwoFAEnabled ? (
              <>
                <LockClosedIcon />
                2FA is enabled
              </>
            ) : (
              <>
                <LockOpen1Icon />
                Enable 2FA
              </>
            )}
          </Link>
        </div>
        <div>
          <Link
            href="profile/change-email"
            className="p-0 inline-flex items-center gap-1.5"
          >
            <EnvelopeClosedIcon
              name="envelope-closed"
              className="w-[1em] h-[1em] inline self-center"
            />
            Change email from {user.email}
          </Link>
        </div>
        {/* <div>
          <Link href="password" className="inline-flex items-center gap-1.5">
            <DotsHorizontalIcon
              name="dots-horizontal"
              className="w-[1em] h-[1em] inline self-center"
            />
            Change Password
          </Link>
        </div> */}
        <div>
          <a
            download="my-epic-notes-data.json"
            href="/api/download-user-data"
            className="inline-flex items-center gap-1.5"
          >
            <DownloadIcon
              name="download"
              className="w-[1em] h-[1em] inline self-center"
            />
            Download your data
          </a>
        </div>
        <SignOutSessions
          userId={user.id}
          sessionsCount={user._count.sessions}
        />
        <DeleteData />
      </div>
    </div>
  );
}
