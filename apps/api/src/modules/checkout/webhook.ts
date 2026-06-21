import { splitRevenue } from "@onlybarber/shared";

type PaymentEvent = {
  id: string;
  type: string;
  orderId: string;
  paymentIntentId: string;
};

type PaymentRepository = {
  claimEvent(eventId: string): Promise<boolean>;
  settlePaidOrder(input: { orderId: string; paymentIntentId: string }): Promise<void>;
};

export async function processPaymentEvent(
  event: PaymentEvent,
  repository: PaymentRepository,
): Promise<"processed" | "duplicate" | "ignored"> {
  if (event.type !== "checkout.session.completed") return "ignored";
  const claimed = await repository.claimEvent(event.id);
  if (!claimed) return "duplicate";
  await repository.settlePaidOrder({
    orderId: event.orderId,
    paymentIntentId: event.paymentIntentId,
  });
  return "processed";
}

export function buildRevenueEntries(totalCents: number, affiliateSale: boolean) {
  const split = splitRevenue(totalCents, affiliateSale);
  const entries = [
    { recipient: "INSTRUCTOR", amountCents: split.instructor },
    { recipient: "PLATFORM", amountCents: split.platform },
    { recipient: "PROCESSOR", amountCents: split.processor },
  ];
  if (split.affiliate > 0) {
    entries.push({ recipient: "AFFILIATE", amountCents: split.affiliate });
  }
  return entries;
}
