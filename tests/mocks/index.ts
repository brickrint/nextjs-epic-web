import closeWithGrace from "close-with-grace";
import { setupServer } from "msw/node";

import { handlers as resendHandlers } from "./resend";

const server = setupServer(...resendHandlers);

server.listen({ onUnhandledRequest: "warn" });
console.info("🔶 Mock server installed");

closeWithGrace(() => {
  server.close();
});
