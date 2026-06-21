import type { RequestHandler } from "express";
import { ApiError } from "../http/errors.js";

type Role = NonNullable<Express.Request["auth"]>["role"];

export function requireRole(...roles: Role[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.auth || !roles.includes(request.auth.role)) {
      next(
        new ApiError(
          403,
          "FORBIDDEN",
          "Você não tem permissão para esta ação.",
        ),
      );
      return;
    }

    next();
  };
}
