import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { requireRole } from "./authorize.js";

function appFor(role?: "STUDENT" | "INSTRUCTOR" | "ADMIN") {
  const app = express();
  app.use((req, _res, next) => {
    if (role) req.auth = { id: "user_1", firebaseUid: "fb_1", role };
    next();
  });
  app.post("/courses", requireRole("INSTRUCTOR", "ADMIN"), (_req, res) => res.sendStatus(204));
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const apiError = error as { status: number; code: string; message: string };
    res.status(apiError.status).json({ error_code: apiError.code, message: apiError.message });
  });
  return app;
}

describe("requireRole", () => {
  it("allows an instructor", async () => {
    expect((await request(appFor("INSTRUCTOR")).post("/courses")).status).toBe(204);
  });

  it("rejects a student", async () => {
    const response = await request(appFor("STUDENT")).post("/courses");
    expect(response.status).toBe(403);
    expect(response.body.error_code).toBe("FORBIDDEN");
  });

  it("rejects a missing authenticated actor", async () => {
    expect((await request(appFor()).post("/courses")).status).toBe(403);
  });
});
