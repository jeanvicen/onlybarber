import { describe, expect, it, vi } from "vitest";
import { createStripeWebhookParser } from "./stripe-webhook-parser.js";

describe("Stripe webhook signature parser", () => {
  it("rejects an invalid signature without exposing SDK details", () => {
    const client = { constructEvent: vi.fn(() => { throw new Error("sensitive stripe detail"); }) };
    const parser = createStripeWebhookParser(client, "whsec_test");
    expect(() => parser(Buffer.from("{}"), "bad-signature")).toThrowError(
      expect.objectContaining({ code: "WEBHOOK_INVALID", status: 400 }),
    );
  });

  it("extracts only the payment fields required by the domain", () => {
    const client = {
      constructEvent: vi.fn().mockReturnValue({
        id: "evt_1",
        type: "checkout.session.completed",
        data: { object: { payment_intent: "pi_1", metadata: { orderId: "order_1" } } },
      }),
    };
    const parser = createStripeWebhookParser(client, "whsec_test");
    expect(parser(Buffer.from("raw"), "valid")).toEqual({
      id: "evt_1",
      type: "checkout.session.completed",
      orderId: "order_1",
      paymentIntentId: "pi_1",
    });
    expect(client.constructEvent).toHaveBeenCalledWith(expect.any(Buffer), "valid", "whsec_test");
  });
});
