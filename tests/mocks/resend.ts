import { faker } from "@faker-js/faker";
import fsExtra from "fs-extra";
import { type HttpHandler, HttpResponse, http } from "msw";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const EmailSchema = z.object({
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  html: z.string().optional(),
  text: z.string(),
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const emailFixturesDirPath = path.join(__dirname, "..", "fixtures", "email");
await fsExtra.ensureDir(emailFixturesDirPath);

export const handlers: Array<HttpHandler> = [
  http.post("https://api.resend.com/emails", async ({ request }) => {
    const email = await EmailSchema.parseAsync(await request.json());

    console.log("Sending email", email);

    // 🐨 write the email as json to a json file in the email directory with the
    // filename set to the "to" email address.
    await fsExtra.writeJSON(
      path.join(emailFixturesDirPath, `./${email.to}.json`),
      email,
    );

    return HttpResponse.json({
      id: faker.string.alphanumeric(),
      from: email.from,
      to: email.to,
      created_at: new Date().toISOString(),
    });
  }),
];
