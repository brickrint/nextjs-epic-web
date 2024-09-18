import bcrypt from "bcryptjs";
import { addDays } from "date-fns";
import "server-only";

export { bcrypt };

const SESSION_EXPIRATION_TIME = 30;
export function getSessionExpirationTime(date = new Date()) {
  return addDays(date, SESSION_EXPIRATION_TIME);
}
