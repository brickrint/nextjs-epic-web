import { expect, test } from "tests/playwright-utils";

test("Search from home page", async ({ page, insertNewUser }) => {
  const user = await insertNewUser();

  await page.goto("/");

  await page.getByRole("searchbox", { name: /search/i }).fill(user.username);
  await page.getByRole("button", { name: /search/i }).click();

  await page.waitForURL(
    `/users?${new URLSearchParams({ search: user.username })}`,
  );
  await expect(page.getByText("Epic Notes Users")).toBeVisible();
  const userList = page.getByRole("main").getByRole("list");
  await expect(userList.getByRole("listitem")).toHaveCount(1);
  if (!user.name) {
    throw new Error("User not found");
  }
  await expect(page.getByAltText(user.name)).toBeVisible();

  await page
    .getByRole("searchbox", { name: /search/i })
    .fill("__non_existing_user__");
  await page.getByRole("button", { name: /search/i }).click();
  await page.waitForURL(`/users?search=__non_existing_user__`);

  await expect(userList.getByRole("listitem")).not.toBeVisible();
  await expect(page.getByText(/no users found/i)).toBeVisible();
});
