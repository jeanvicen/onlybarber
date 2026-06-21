import { describe, expect, it } from "vitest";
import { apiErrorSchema } from "./errors.js";

describe("apiErrorSchema", () => {
  it("accepts a stable structured error", () => {
    expect(
      apiErrorSchema.parse({
        error_code: "IDEMPOTENCY_CONFLICT",
        message: "Esta operação já foi enviada com dados diferentes.",
        request_id: "req_123",
      }),
    ).toEqual({
      error_code: "IDEMPOTENCY_CONFLICT",
      message: "Esta operação já foi enviada com dados diferentes.",
      request_id: "req_123",
    });
  });

  it("rejects an unknown error code", () => {
    expect(() =>
      apiErrorSchema.parse({
        error_code: "SOMETHING_RANDOM",
        message: "Falha.",
        request_id: "req_123",
      }),
    ).toThrow();
  });
});
