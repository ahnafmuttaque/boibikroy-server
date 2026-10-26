import type {NextFunction, Request, Response} from "express";
import type {_ZodType} from "zod";

const validationMiddleware =  (zodSchema:_ZodType) => {
    return async (req: Request, res: Response, next: NextFunction)  => {
        await zodSchema.parseAsync(req.body);
       next();
    }
}

export default validationMiddleware;