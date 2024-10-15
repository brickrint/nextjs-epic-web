import { expect, test } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("searchbox", { name: /search/i }).fill("kody");
  await page.getByRole("button", { name: /search/i }).click();

  await page.waitForURL(`/users?search=kody`);
  await expect(page.getByText("Epic Notes Users")).toBeVisible();
  const userList = page.getByRole("main").getByRole("list");
  await expect(userList.getByRole("listitem")).toHaveCount(1);
  await expect(page.getByAltText("kody")).toBeVisible();

  await page
    .getByRole("searchbox", { name: /search/i })
    .fill("__non_existing_user__");
  await page.getByRole("button", { name: /search/i }).click();
  await page.waitForURL(`/users?search=__non_existing_user__`);

  await expect(userList.getByRole("listitem")).not.toBeVisible();
  await expect(page.getByText(/no users found/i)).toBeVisible();
});

test("get started link", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Click the get started link.
  await page.getByRole("link", { name: "Get started" }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(
    page.getByRole("heading", { name: "Installation" }),
  ).toBeVisible();
});
