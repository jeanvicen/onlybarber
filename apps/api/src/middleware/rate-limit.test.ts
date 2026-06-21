import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import {
  InMemoryRateLimitStore,
  createRateLimitMiddleware,
} from "./rate-limit.js";

function createApp(maxPerUser: number, maxPerIp: number) {
  const app = express();
  app.set("trust proxy", 1);
  app.use((req, _res, next) => {
    const id = req.header("x-test-user") ?? "user_1";
    req.auth = { id, firebaseUid: `fb_${id}`, role: "STUDENT" };
    next();
  });
  app.get(
    "/resource",
    createRateLimitMiddleware(new InMemoryRateLimitStore(), {
      windowMs: 60_000,
      maxPerUser,
      maxPerIp,
    }),
    (_req, res) => res.json({ ok: true }),
  );
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const value = error as { status: number; code: string; message: string; retryAfter?: number };
    if (value.retryAfter) res.setHeader("Retry-After", value.retryAfter);
    res.status(value.status).json({ error_code: value.code, message: value.message });
  });
  return app;
}

describe("rate limit by user and IP", () => {
  it("limits the same user even across different IPs", async () => {
    const app = createApp(2, 10);
    await request(app).get("/resource").set("X-Forwarded-For", "10.0.0.1");
    await request(app).get("/resource").set("X-Forwarded-For", "10.0.0.2");
    const response = await request(app).get("/resource").set("X-Forwarded-For", "10.0.0.3");
    expect(response.status).toBe(429);
    expect(response.body.error_code).toBe("RATE_LIMITED");
    expect(Number(response.headers["retry-after"])).toBeGreaterThan(0);
  });

  it("limits the same IP even with different users", async () => {
    const app = createApp(10, 2);
    await request(app).get("/resource").set("X-Test-User", "user_1").set("X-Forwarded-For", "10.0.0.1");
    await request(app).get("/resource").set("X-Test-User", "user_2").set("X-Forwarded-For", "10.0.0.1");
    const response = await request(app)
      .get("/resource")
      .set("X-Test-User", "user_3")
      .set("X-Forwarded-For", "10.0.0.1");
    expect(response.status).toBe(429);
  });
});
