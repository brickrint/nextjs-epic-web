import { db } from "@/server/db";
import type { Password, Session, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays } from "date-fns";
import "server-only";

const SESSION_EXPIRATION_TIME = 30;
export function getSessionExpirationTime(date = new Date()) {
  return addDays(date, SESSION_EXPIRATION_TIME);
}

export async function getPasswordHash(password: string) {
  const hash = await bcrypt.hash(password, 10);
  return hash;
}

export async function signup({
  email,
  username,
  name,
  password,
}: {
  email: User["email"];
  username: User["username"];
  name: User["name"];
  password: string;
}) {
  const hash = await getPasswordHash(password);

  const session = await db.session.create({
    data: {
      expirationDate: getSessionExpirationTime(),
      user: {
        create: {
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          name,
          password: {
            create: {
              hash,
            },
          },
          roles: { connect: { name: "user" } },
        },
      },
    },
    select: { id: true, expirationDate: true },
  });

  return session;
}

export async function login({
  username,
  password,
}: {
  username: User["username"];
  password: string;
}) {
  const user = await verifyUserPassword({ username }, password);

  if (!user) return null;

  const session = await db.session.create({
    select: { id: true, expirationDate: true },
    data: { userId: user.id, expirationDate: getSessionExpirationTime() },
  });

  return session;
}

export async function verifyUserPassword(
  where: Pick<User, "username"> | Pick<User, "id">,
  password: Password["hash"],
) {
  const userWithPassword = await db.user.findUnique({
    where,
    select: { id: true, password: { select: { hash: true } } },
  });

  if (!userWithPassword?.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash,
  );

  if (!isValid) {
    return null;
  }

  return { id: userWithPassword.id };
}

export async function logout(sessionId: Session["id"]) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  void db.session.deleteMany({ where: { id: sessionId } }).catch(() => {});
}
