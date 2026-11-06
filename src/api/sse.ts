import express, { Response } from "express";

const router = express.Router();
const clients = new Set<Response>();

router.get("/stream", (_req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  clients.add(res);
  res.on("close", () => clients.delete(res));
});

let id = 0;
export function broadcast(event: string, data: unknown) {
  const msg = `id: ${++id}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) res.write(msg);
}

export default router;
