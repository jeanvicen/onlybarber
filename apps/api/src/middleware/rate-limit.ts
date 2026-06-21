import type { RequestHandler } from "express";
import { ApiError } from "../http/errors.js";

type Counter = { count: number; resetAt: number };

export interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<Counter>;
}

export class InMemoryRateLimitStore implements RateLimitStore {
  private readonly counters = new Map<string, Counter>();

  async increment(key: string, windowMs: number): Promise<Counter> {
    const now = Date.now();
    const current = this.counters.get(key);
    if (!current || current.resetAt <= now) {
      const created = { count: 1, resetAt: now + windowMs };
      this.counters.set(key, created);
      return created;
    }
    current.count += 1;
    return current;
  }
}

class RateLimitError extends ApiError {
  readonly retryAfter: number;

  constructor(resetAt: number) {
    super(
      429,
      "RATE_LIMITED",
      "Muitas solicitações. Aguarde um momento e tente novamente.",
    );
    this.retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1_000));
  }
}

type RateLimitOptions = {
  windowMs: number;
  maxPerUser: number;
  maxPerIp: number;
};

export function createRateLimitMiddleware(
  store: RateLimitStore,
  options: RateLimitOptions,
): RequestHandler {
  return async (request, _response, next) => {
    try {
      const scope = `${request.method}:${request.route?.path ?? request.path}`;
      const ip = request.ip ?? request.socket.remoteAddress ?? "unknown";
      const ipCounter = await store.increment(`ip:${ip}:${scope}`, options.windowMs);
      if (ipCounter.count > options.maxPerIp) {
        next(new RateLimitError(ipCounter.resetAt));
        return;
      }

      if (request.auth) {
        const userCounter = await store.increment(
          `user:${request.auth.id}:${scope}`,
          options.windowMs,
        );
        if (userCounter.count > options.maxPerUser) {
          next(new RateLimitError(userCounter.resetAt));
          return;
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
