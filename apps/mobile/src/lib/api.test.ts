import { describe, expect, it, jest } from "@jest/globals";
import { createApiClient } from "./api";

describe("API client", () => {
  it("sends Firebase token and reuses one idempotency key across retries", async () => {
    const fetcher = jest
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "order_1" }), { status: 201 }));
    const client = createApiClient({
      baseUrl: "https://api.onlybarber.test",
      fetcher,
      getToken: async () => "firebase-token",
      createKey: () => "stable-key-123",
    });

    await expect(client.mutate("/orders", { courseId: "course_1" }, 1)).resolves.toEqual({ id: "order_1" });
    expect(fetcher).toHaveBeenCalledTimes(2);
    for (const call of fetcher.mock.calls) {
      const init = call[1] as RequestInit;
      expect(init.headers).toMatchObject({
        Authorization: "Bearer firebase-token",
        "Idempotency-Key": "stable-key-123",
      });
    }
  });

  it("surfaces structured Portuguese API errors", async () => {
    const fetcher = jest.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ error_code: "RATE_LIMITED", message: "Aguarde um momento.", request_id: "req_1" }), { status: 429 }),
    );
    const client = createApiClient({ baseUrl: "https://api.onlybarber.test", fetcher, getToken: async () => "token", createKey: () => "key-12345678" });
    await expect(client.query("/courses")).rejects.toMatchObject({ code: "RATE_LIMITED", message: "Aguarde um momento." });
  });
});
