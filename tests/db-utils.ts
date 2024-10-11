import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { UniqueEnforcer } from "enforce-unique";

const usernameEnforcer = new UniqueEnforcer();

export function createUser() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  const username = usernameEnforcer
    .enforce(
      () =>
        faker.string.alphanumeric({ length: 5 }) +
        "_" +
        faker.internet.userName({
          firstName: firstName.toLowerCase(),
          lastName: lastName.toLowerCase(),
        }),
    )
    .slice(0, 20)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_");

  return {
    username,
    name: `${firstName} ${lastName}`,
    email: `${username}@example.com`,
  };
}

export function createPassword(password = faker.internet.password()) {
  return {
    hash: bcrypt.hashSync(password, 10),
  };
}
