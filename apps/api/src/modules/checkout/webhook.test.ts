import { describe, expect, it, vi } from "vitest";
import { buildRevenueEntries, processPaymentEvent } from "./webhook.js";

describe("Stripe webhook", () => {
  it("processes the same event id only once", async () => {
    const seen = new Set<string>();
    const repository = {
      claimEvent: vi.fn(async (id: string) => {
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      }),
      settlePaidOrder: vi.fn().mockResolvedValue(undefined),
    };
    const event = { id: "evt_1", type: "checkout.session.completed", orderId: "order_1", paymentIntentId: "pi_1" };
    expect(await processPaymentEvent(event, repository)).toBe("processed");
    expect(await processPaymentEvent(event, repository)).toBe("duplicate");
    expect(repository.settlePaidOrder).toHaveBeenCalledTimes(1);
  });

  it("creates revenue entries that preserve every cent", () => {
    const entries = buildRevenueEntries(19_700, false);
    expect(entries).toEqual([
      { recipient: "INSTRUCTOR", amountCents: 13_790 },
      { recipient: "PLATFORM", amountCents: 4_925 },
      { recipient: "PROCESSOR", amountCents: 985 },
    ]);
    expect(entries.reduce((sum, entry) => sum + entry.amountCents, 0)).toBe(19_700);
  });
});
