import { ApiError } from "../../http/errors.js";

type CheckoutRepository = {
  findPublishedCourse(courseId: string): Promise<{ id: string; title: string; priceCents: number } | null>;
  createPendingOrder(input: { userId: string; courseId: string; priceCents: number }): Promise<{ id: string }>;
  attachSession(orderId: string, sessionId: string): Promise<void>;
};

type StripeGateway = {
  createCheckoutSession(
    input: { orderId: string; courseId: string; title: string; unitAmount: number; userId: string },
    idempotencyKey: string,
  ): Promise<{ id: string; url: string }>;
};

type CheckoutRequest = { userId: string; courseId: string; idempotencyKey: string };

export function createCheckoutService(repository: CheckoutRepository, stripe: StripeGateway) {
  return {
    async create(request: CheckoutRequest): Promise<{ orderId: string; url: string }> {
      const course = await repository.findPublishedCourse(request.courseId);
      if (!course) throw new ApiError(404, "NOT_FOUND", "Curso não encontrado ou indisponível.");

      const order = await repository.createPendingOrder({
        userId: request.userId,
        courseId: course.id,
        priceCents: course.priceCents,
      });
      const session = await stripe.createCheckoutSession(
        {
          orderId: order.id,
          courseId: course.id,
          title: course.title,
          unitAmount: course.priceCents,
          userId: request.userId,
        },
        request.idempotencyKey,
      );
      await repository.attachSession(order.id, session.id);
      return { orderId: order.id, url: session.url };
    },
  };
}
