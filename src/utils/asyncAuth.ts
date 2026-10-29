import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";

interface JWTBody extends JwtPayload {
  readonly id: string;
  readonly email: string;
  readonly role?: "admin" | "moderator";
}

interface WithAuth extends Request {
  user: JWTBody;
}

export const withAuth: (
  fn: (req: WithAuth, res: Response, next: NextFunction) => any,
) => RequestHandler = (fn) => {
  return (req, res, next) => {
    if (typeof req === "object" && req !== null && "user" in req) {
      Promise.resolve(fn(req as WithAuth, res, next)).catch(next);
    } else {
      throw new Error("Invalid authAdmin controller");
    }
  };
};
