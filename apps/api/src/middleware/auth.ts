import type { RequestHandler } from "express";
import { ApiError } from "../http/errors.js";

export type AuthenticatedUser = NonNullable<Express.Request["auth"]>;

export type TokenVerifier = {
  verifyIdToken(token: string, checkRevoked: boolean): Promise<{ uid: string }>;
};

export type UserResolver = (
  firebaseUid: string,
) => Promise<AuthenticatedUser>;

export function createAuthMiddleware(
  verifier: TokenVerifier,
  resolveUser: UserResolver,
): RequestHandler {
  return async (request, _response, next) => {
    const authorization = request.header("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      next(new ApiError(401, "AUTH_REQUIRED", "Entre para continuar."));
      return;
    }

    const token = authorization.slice("Bearer ".length).trim();
    if (!token) {
      next(new ApiError(401, "AUTH_REQUIRED", "Entre para continuar."));
      return;
    }

    try {
      const decoded = await verifier.verifyIdToken(token, true);
      request.auth = await resolveUser(decoded.uid);
      next();
    } catch {
      next(
        new ApiError(
          401,
          "TOKEN_INVALID",
          "Sua sessão é inválida ou expirou. Entre novamente.",
        ),
      );
    }
  };
}
