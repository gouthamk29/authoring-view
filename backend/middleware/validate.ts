import type { ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";
export const validate = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next();
  };
};
