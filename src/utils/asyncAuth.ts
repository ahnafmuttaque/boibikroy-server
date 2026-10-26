import type { NextFunction, Request, RequestHandler, Response } from "express";
interface BaseUser {
  id: string;
  email: string;
  phoneNo: string;
}
interface WithAdmin extends Request{
  admin: {
    role: string;
  } & BaseUser
}

interface WithUser {
  user: BaseUser
}

export const withAuthAdmin: (fn: (req: WithAdmin, res: Response, next: NextFunction) => any) => RequestHandler = (fn) => {
  return (req, res, next) => {
    if (typeof req === "object" && req !== null && "admin" in req) {
      Promise.resolve(fn(req as WithAdmin, res, next)).catch(next)
    } else {
     throw new Error("Invalid authAdmin controller")
    }
  }
}

export const withAuthUser: (fn: (req: WithUser, res: Response, next: NextFunction) => any) => RequestHandler = (fn) => {
  return (req, res, next) => {
    if (typeof req === "object" && req !== null && "user" in req) {
      Promise.resolve(fn(req as WithUser, res, next)).catch(next)
    } else {
     throw new Error("Invalid authUser controller")
    }
  }
}
