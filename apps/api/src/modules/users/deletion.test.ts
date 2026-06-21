import { describe, expect, it } from "vitest";
import { cancelDeletion, finalizeDeletion, requestDeletion } from "./deletion.js";

describe("account deletion", () => {
  const now = new Date("2026-06-21T00:00:00.000Z");

  it("schedules deletion exactly 42 hours later", () => {
    const request = requestDeletion(now);
    expect(request.status).toBe("PENDING");
    expect(request.deleteAfter.toISOString()).toBe("2026-06-22T18:00:00.000Z");
  });

  it("allows cancellation during the appeal window", () => {
    expect(cancelDeletion(requestDeletion(now), new Date("2026-06-21T10:00:00.000Z")).status).toBe("CANCELLED");
  });

  it.each([
    { balanceCents: 1, hasDispute: false, hasPendingWithdrawal: false },
    { balanceCents: 0, hasDispute: true, hasPendingWithdrawal: false },
    { balanceCents: 0, hasDispute: false, hasPendingWithdrawal: true },
  ])("blocks final deletion while money needs resolution: %o", (financial) => {
    const result = finalizeDeletion(requestDeletion(now), new Date("2026-06-22T18:00:01.000Z"), financial);
    expect(result.status).toBe("BLOCKED");
    expect(result.blockReason).toBe("BALANCE_PENDING");
  });

  it("completes after 42 hours when no financial obligation remains", () => {
    const result = finalizeDeletion(requestDeletion(now), new Date("2026-06-22T18:00:01.000Z"), {
      balanceCents: 0,
      hasDispute: false,
      hasPendingWithdrawal: false,
    });
    expect(result.status).toBe("COMPLETED");
    expect(result.completedAt?.toISOString()).toBe("2026-06-22T18:00:01.000Z");
  });
});
