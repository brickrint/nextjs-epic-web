import { faker } from "@faker-js/faker";
import { type HttpHandler, HttpResponse, http } from "msw";
import { z } from "zod";

const EmailSchema = z.object({
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  html: z.string().optional(),
  text: z.string(),
});

export const handlers: Array<HttpHandler> = [
  http.post("https://api.resend.com/emails", async ({ request }) => {
    const body = await EmailSchema.parseAsync(await request.json());

    return HttpResponse.json({
      id: faker.string.alphanumeric(),
      from: body.from,
      to: body.to,
      created_at: new Date().toISOString(),
    });
  }),
];
