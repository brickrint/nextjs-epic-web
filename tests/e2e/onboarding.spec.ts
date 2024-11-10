import { db } from "@/server/db";
import { faker } from "@faker-js/faker";
import { requireEmail } from "tests/mocks/resend";
import { test as base, createUser, waitFor } from "tests/playwright-utils";

const CODE_REGEX = /\d+/;
function extractCode(text: string) {
  const match = CODE_REGEX.exec(text);
  return match?.[0];
}

const test = base.extend<{
  getOnboardingData: () => {
    username: string;
    name: string;
    email: string;
    password: string;
  };
}>({
  getOnboardingData: async ({}, use) => {
    const user = createUser();
    await use(() => {
      const onboardinData = {
        ...user,
        password: faker.internet.password(),
      };
      return onboardinData;
    });
    await db.user.deleteMany({ where: { username: user.username } });
  },
});

const { expect } = test;

test("Onboard with code", async ({ page, getOnboardingData }) => {
  const onboardingData = getOnboardingData();

  await page.goto("/");
  await page.getByRole("link", { name: /log in/i }).click();
  await expect(page).toHaveURL("/login");

  const createAccountLink = page.getByRole("link", {
    name: /create an account/i,
  });

  await createAccountLink.click();
  await expect(page).toHaveURL("/signup");

  await page
    .getByRole("textbox", { name: /email/i })
    .fill(onboardingData.email);
  await page.getByRole("button", { name: /submit/i }).click();
  await expect(
    page.getByRole("button", { name: /submit/i, disabled: true }),
  ).toBeVisible();

  await expect(page.getByText(/check your email/i)).toBeVisible();

  const email = await waitFor(() => requireEmail(onboardingData.email));

  expect(email.to).toBe(onboardingData.email.toLowerCase());
  expect(email.from).toBe("hello@epicstack.dev");
  expect(email.subject).toMatch(/welcome/i);

  const code = extractCode(email.text);
  await page.getByRole("textbox", { name: /code/i }).fill(String(code));
  await page.getByRole("button", { name: /submit/i }).click();
  await expect(
    page.getByRole("button", { name: /submit/i, disabled: true }),
  ).toBeVisible();

  await expect(
    page.getByText(`Welcome aboard ${onboardingData.email}!`),
  ).toBeVisible();

  await expect(page).toHaveURL(`/onboarding`);
  await page
    .getByRole("textbox", { name: /^username/i })
    .fill(onboardingData.username);
  await page.getByRole("textbox", { name: /^name/i }).fill(onboardingData.name);
  await page.getByLabel(/^password/i).fill(onboardingData.password);
  await page.getByLabel(/confirm password/i).fill(onboardingData.password);

  await page.getByRole("checkbox", { name: /terms/i }).check();
  await page.getByLabel(/remember me/i).check();

  await page.getByRole("button", { name: /create an account/i }).click();

  await expect(page).toHaveURL(`/`);

  await page.getByRole("link", { name: onboardingData.name }).click();

  await expect(page).toHaveURL(`/users/${onboardingData.username}`);

  await page.getByRole("button", { name: /logout/i }).click();
  await expect(page).toHaveURL(`/`);
});

test("login as existing user", async ({ page, insertNewUser }) => {
  const password = faker.internet.password();
  const user = await insertNewUser({ password });

  if (!user.name) {
    throw new Error("User not found");
  }

  await page.goto("/login");
  await page.getByRole("textbox", { name: /username/i }).fill(user.username);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /log in/i }).click();
  await expect(page).toHaveURL(`/`);

  await expect(page.getByRole("link", { name: user.name })).toBeVisible();
});
