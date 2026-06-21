import { z } from "zod";

export const errorCodeSchema = z.enum([
  "AUTH_REQUIRED",
  "TOKEN_INVALID",
  "FORBIDDEN",
  "VALIDATION_ERROR",
  "IDEMPOTENCY_KEY_REQUIRED",
  "IDEMPOTENCY_CONFLICT",
  "RATE_LIMITED",
  "NOT_FOUND",
  "BALANCE_PENDING",
  "WEBHOOK_INVALID",
  "INTERNAL_ERROR",
]);

export const apiErrorSchema = z.object({
  error_code: errorCodeSchema,
  message: z.string().min(1),
  request_id: z.string().min(1),
  details: z.record(z.string(), z.array(z.string())).optional(),
});

export type ErrorCode = z.infer<typeof errorCodeSchema>;
export type ApiErrorBody = z.infer<typeof apiErrorSchema>;
