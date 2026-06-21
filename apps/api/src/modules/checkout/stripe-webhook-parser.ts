import { ApiError } from "../../http/errors.js";

type StripeEventShape = {
  id: string;
  type: string;
  data: {
    object: {
      payment_intent?: string | { id: string } | null;
      metadata?: Record<string, string> | null;
    };
  };
};

type StripeWebhookClient = {
  constructEvent(rawBody: Buffer, signature: string, secret: string): StripeEventShape;
};

export function createStripeWebhookParser(client: StripeWebhookClient, secret: string) {
  return (rawBody: Buffer, signature: string) => {
    let event: StripeEventShape;
    try {
      event = client.constructEvent(rawBody, signature, secret);
    } catch {
      throw new ApiError(400, "WEBHOOK_INVALID", "Assinatura do pagamento inválida.");
    }

    const paymentIntent = event.data.object.payment_intent;
    const paymentIntentId = typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id;
    const orderId = event.data.object.metadata?.orderId;
    if (!paymentIntentId || !orderId) {
      throw new ApiError(400, "WEBHOOK_INVALID", "Evento de pagamento incompleto.");
    }

    return { id: event.id, type: event.type, orderId, paymentIntentId };
  };
}
