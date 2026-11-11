import type { IncomingMessage, ServerResponse } from "http";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      status: "ok",
      platform: "vercel",
      timestamp: new Date().toISOString(),
    })
  );
}
