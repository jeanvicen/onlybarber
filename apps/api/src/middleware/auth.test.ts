import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createAuthMiddleware, type TokenVerifier } from "./auth.js";

function testApp(verifier: TokenVerifier) {
  const app = express();
  app.get(
    "/me",
    createAuthMiddleware(verifier, async (firebaseUid) => ({
      id: "user_1",
      firebaseUid,
      role: "INSTRUCTOR",
    })),
    (req, res) => res.json(req.auth),
  );
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const apiError = error as { status: number; code: string; message: string };
    res.status(apiError.status ?? 500).json({
      error_code: apiError.code ?? "INTERNAL_ERROR",
      message: apiError.message,
      request_id: "req_test",
    });
  });
  return app;
}

describe("Firebase authentication middleware", () => {
  it("requires a bearer token", async () => {
    const verifier = { verifyIdToken: vi.fn() };
    const response = await request(testApp(verifier)).get("/me");
    expect(response.status).toBe(401);
    expect(response.body.error_code).toBe("AUTH_REQUIRED");
  });

  it("validates the token with revocation checks", async () => {
    const verifier = {
      verifyIdToken: vi.fn().mockResolvedValue({ uid: "firebase_1" }),
    };
    const response = await request(testApp(verifier))
      .get("/me")
      .set("Authorization", "Bearer valid-token");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: "user_1", firebaseUid: "firebase_1" });
    expect(verifier.verifyIdToken).toHaveBeenCalledWith("valid-token", true);
  });

  it.each([
    "auth/id-token-expired",
    "auth/argument-error",
    "auth/id-token-revoked",
  ])("maps %s to a safe structured error", async (code) => {
    const verifier = {
      verifyIdToken: vi.fn().mockRejectedValue(Object.assign(new Error("sdk detail"), { code })),
    };
    const response = await request(testApp(verifier))
      .get("/me")
      .set("Authorization", "Bearer fake-token");
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error_code: "TOKEN_INVALID",
      message: "Sua sessão é inválida ou expirou. Entre novamente.",
    });
    expect(response.text).not.toContain("sdk detail");
  });
});
