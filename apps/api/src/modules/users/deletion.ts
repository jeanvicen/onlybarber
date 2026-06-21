type DeletionStatus = "PENDING" | "CANCELLED" | "BLOCKED" | "COMPLETED";

type DeletionRequest = {
  status: DeletionStatus;
  requestedAt: Date;
  deleteAfter: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  blockReason?: "BALANCE_PENDING";
};

type FinancialState = {
  balanceCents: number;
  hasDispute: boolean;
  hasPendingWithdrawal: boolean;
};

const APPEAL_WINDOW_MS = 42 * 60 * 60 * 1_000;

export function requestDeletion(now: Date): DeletionRequest {
  return {
    status: "PENDING",
    requestedAt: now,
    deleteAfter: new Date(now.getTime() + APPEAL_WINDOW_MS),
  };
}

export function cancelDeletion(request: DeletionRequest, now: Date): DeletionRequest {
  if (request.status !== "PENDING" || now >= request.deleteAfter) {
    throw new Error("DELETION_CANNOT_BE_CANCELLED");
  }
  return { ...request, status: "CANCELLED", cancelledAt: now };
}

export function finalizeDeletion(
  request: DeletionRequest,
  now: Date,
  financial: FinancialState,
): DeletionRequest {
  if (request.status !== "PENDING" || now < request.deleteAfter) {
    throw new Error("DELETION_NOT_READY");
  }
  if (
    financial.balanceCents > 0 ||
    financial.hasDispute ||
    financial.hasPendingWithdrawal
  ) {
    return { ...request, status: "BLOCKED", blockReason: "BALANCE_PENDING" };
  }
  return { ...request, status: "COMPLETED", completedAt: now };
}
