import { describe, expect, it, vi } from "vitest";
import { createCheckoutService } from "./checkout.js";

describe("checkout service", () => {
  it("uses the server price and forwards the idempotency key", async () => {
    const repository = {
      findPublishedCourse: vi.fn().mockResolvedValue({ id: "course_1", title: "Fade", priceCents: 19_700 }),
      createPendingOrder: vi.fn().mockResolvedValue({ id: "order_1" }),
      attachSession: vi.fn().mockResolvedValue(undefined),
    };
    const stripe = {
      createCheckoutSession: vi.fn().mockResolvedValue({ id: "cs_test_1", url: "https://checkout.stripe.test/1" }),
    };
    const service = createCheckoutService(repository, stripe);
    const result = await service.create({ userId: "user_1", courseId: "course_1", idempotencyKey: "purchase-key-123" });
    expect(result.url).toBe("https://checkout.stripe.test/1");
    expect(repository.createPendingOrder).toHaveBeenCalledWith({ userId: "user_1", courseId: "course_1", priceCents: 19_700 });
    expect(stripe.createCheckoutSession).toHaveBeenCalledWith(expect.objectContaining({ orderId: "order_1", unitAmount: 19_700 }), "purchase-key-123");
  });

  it("rejects an unavailable course before contacting Stripe", async () => {
    const repository = {
      findPublishedCourse: vi.fn().mockResolvedValue(null),
      createPendingOrder: vi.fn(),
      attachSession: vi.fn(),
    };
    const stripe = { createCheckoutSession: vi.fn() };
    await expect(createCheckoutService(repository, stripe).create({ userId: "user_1", courseId: "missing", idempotencyKey: "purchase-key-123" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(stripe.createCheckoutSession).not.toHaveBeenCalled();
  });
});
