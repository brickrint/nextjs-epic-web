import { db } from "@/server/db";
import { RedirectType, redirect } from "next/navigation";
import "server-only";

import { type getUser, requireUserId } from "./session.server";
import { invariantToastRedirect } from "./toast.server";

export async function requireUserWithPermission(permission: PermissionString) {
  const userId = await requireUserId();
  const permissionData = parsePermissionString(permission);
  const user = await db.user.findFirst({
    select: { id: true },
    where: {
      id: userId,
      roles: {
        some: {
          permissions: {
            some: {
              ...permissionData,
              access: permissionData.access
                ? { in: permissionData.access }
                : undefined,
            },
          },
        },
      },
    },
  });

  invariantToastRedirect(
    user,
    {
      type: "error",
      title: "Unauthorized",
      description: `Unauthorized: required permissions: ${permission}`,
    },
    "/",
    RedirectType.replace,
  );

  return user.id;
}

export async function requireUserWithRole(name: string) {
  const userId = await requireUserId();
  const user = await db.user.findFirst({
    select: { id: true },
    where: { id: userId, roles: { some: { name } } },
  });

  if (!user) {
    redirect("/", RedirectType.replace);
  }

  return user.id;
}

type Action = "create" | "read" | "update" | "delete";
type Entity = "user" | "note";
type Access = "own" | "any" | "own,any" | "any,own";
type PermissionString = `${Action}:${Entity}` | `${Action}:${Entity}:${Access}`;
function parsePermissionString(permissionString: PermissionString) {
  const [action, entity, access] = permissionString.split(":") as [
    Action,
    Entity,
    Access | undefined,
  ];
  return {
    action,
    entity,
    access: access ? (access.split(",") as Array<Access>) : undefined,
  };
}

type Roles = Pick<Awaited<ReturnType<typeof getUser>>, "roles">;
export function userHasPermission(
  user: Roles | null,
  permission: PermissionString,
) {
  if (!user) return false;
  const { action, entity, access } = parsePermissionString(permission);
  return user.roles.some((role) =>
    role.permissions.some(
      (permission) =>
        permission.entity === entity &&
        permission.action === action &&
        (!access || access.includes(permission.access)),
    ),
  );
}

export function userHasRole(user: Roles | null, role: string) {
  if (!user) return false;
  return user.roles.some((r) => r.name === role);
}
