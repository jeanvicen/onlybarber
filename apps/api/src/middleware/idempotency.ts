import { createHash } from "node:crypto";
import type { RequestHandler } from "express";
import { ApiError } from "../http/errors.js";

type StoredResponse = {
  requestHash: string;
  statusCode: number;
  body: unknown;
  expiresAt: number;
};

export interface IdempotencyStore {
  acquire(storageKey: string, requestHash: string): Promise<AcquireResult>;
  complete(storageKey: string, value: StoredResponse): Promise<void>;
}

type AcquireResult =
  | { kind: "acquired" }
  | { kind: "completed"; value: StoredResponse }
  | { kind: "pending"; requestHash: string; value: Promise<StoredResponse> };

type PendingResponse = {
  requestHash: string;
  value: Promise<StoredResponse>;
  resolve: (value: StoredResponse) => void;
};

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly values = new Map<string, StoredResponse | PendingResponse>();

  async acquire(storageKey: string, requestHash: string): Promise<AcquireResult> {
    const value = this.values.get(storageKey);
    if (value && "expiresAt" in value && value.expiresAt <= Date.now()) {
      this.values.delete(storageKey);
      return this.acquire(storageKey, requestHash);
    }
    if (value && "expiresAt" in value) return { kind: "completed", value };
    if (value) {
      return {
        kind: "pending",
        requestHash: value.requestHash,
        value: value.value,
      };
    }

    let resolve!: (response: StoredResponse) => void;
    const pending = new Promise<StoredResponse>((done) => {
      resolve = done;
    });
    this.values.set(storageKey, { requestHash, value: pending, resolve });
    return { kind: "acquired" };
  }

  async complete(storageKey: string, value: StoredResponse): Promise<void> {
    const pending = this.values.get(storageKey);
    this.values.set(storageKey, value);
    if (pending && "resolve" in pending) pending.resolve(value);
  }
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}

function requestHash(method: string, path: string, body: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify([method, path, canonicalize(body)]))
    .digest("hex");
}

export function createIdempotencyMiddleware(
  store: IdempotencyStore,
  ttlMs = 24 * 60 * 60 * 1_000,
): RequestHandler {
  return async (request, response, next) => {
    const key = request.header("idempotency-key")?.trim();
    if (!key || key.length < 8 || key.length > 200) {
      next(
        new ApiError(
          400,
          "IDEMPOTENCY_KEY_REQUIRED",
          "Envie uma chave de idempotência válida para concluir esta ação.",
        ),
      );
      return;
    }

    if (!request.auth) {
      next(new ApiError(401, "AUTH_REQUIRED", "Entre para continuar."));
      return;
    }

    const hash = requestHash(request.method, request.path, request.body);
    const storageKey = `${request.auth.id}:${request.method}:${request.path}:${key}`;
    const acquired = await store.acquire(storageKey, hash);

    if (acquired.kind !== "acquired") {
      const stored =
        acquired.kind === "pending" ? await acquired.value : acquired.value;
      const storedHash =
        acquired.kind === "pending" ? acquired.requestHash : stored.requestHash;
      if (storedHash !== hash) {
        next(
          new ApiError(
            409,
            "IDEMPOTENCY_CONFLICT",
            "Esta operação já foi enviada com dados diferentes.",
          ),
        );
        return;
      }
      response.setHeader("Idempotency-Replayed", "true");
      response.status(stored.statusCode).json(stored.body);
      return;
    }

    const originalJson = response.json.bind(response);
    response.json = ((body: unknown) => {
      void store
        .complete(storageKey, {
          requestHash: hash,
          statusCode: response.statusCode,
          body,
          expiresAt: Date.now() + ttlMs,
        })
        .then(() => originalJson(body), next);
      return response;
    }) as typeof response.json;

    next();
  };
}
