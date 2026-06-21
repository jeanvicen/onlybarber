import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import {
  InMemoryIdempotencyStore,
  createIdempotencyMiddleware,
} from "./idempotency.js";

function createApp() {
  const app = express();
  const store = new InMemoryIdempotencyStore();
  let mutations = 0;
  app.use(express.json());
  app.use((req, _res, next) => {
    req.auth = { id: "user_1", firebaseUid: "fb_1", role: "STUDENT" };
    next();
  });
  app.post("/mutate", createIdempotencyMiddleware(store), async (req, res) => {
    if (req.header("x-delay") === "true") {
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
    mutations += 1;
    res.status(201).json({ id: `result_${mutations}`, title: req.body.title });
  });
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const value = error as { status: number; code: string; message: string };
    res.status(value.status).json({ error_code: value.code, message: value.message });
  });
  return { app, mutations: () => mutations };
}

describe("Idempotency-Key middleware", () => {
  it("requires a key on state-changing requests", async () => {
    const { app } = createApp();
    const response = await request(app).post("/mutate").send({ title: "Fade" });
    expect(response.status).toBe(400);
    expect(response.body.error_code).toBe("IDEMPOTENCY_KEY_REQUIRED");
  });

  it("replays the original response for the same key and payload", async () => {
    const { app, mutations } = createApp();
    const first = await request(app)
      .post("/mutate")
      .set("Idempotency-Key", "key-12345678")
      .send({ title: "Fade" });
    const second = await request(app)
      .post("/mutate")
      .set("Idempotency-Key", "key-12345678")
      .send({ title: "Fade" });
    expect(second.status).toBe(201);
    expect(second.body).toEqual(first.body);
    expect(second.headers["idempotency-replayed"]).toBe("true");
    expect(mutations()).toBe(1);
  });

  it("rejects the same key with a different payload", async () => {
    const { app } = createApp();
    await request(app)
      .post("/mutate")
      .set("Idempotency-Key", "key-12345678")
      .send({ title: "Fade" });
    const response = await request(app)
      .post("/mutate")
      .set("Idempotency-Key", "key-12345678")
      .send({ title: "Barba" });
    expect(response.status).toBe(409);
    expect(response.body.error_code).toBe("IDEMPOTENCY_CONFLICT");
  });

  it("executes only once when identical requests arrive concurrently", async () => {
    const { app, mutations } = createApp();
    const send = () =>
      request(app)
        .post("/mutate")
        .set("Idempotency-Key", "key-concurrent")
        .set("X-Delay", "true")
        .send({ title: "Fade" });

    const [first, second] = await Promise.all([send(), send()]);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(first.body).toEqual(second.body);
    expect(mutations()).toBe(1);
  });
});
