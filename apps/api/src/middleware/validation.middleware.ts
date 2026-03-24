import { type Request, type Response, type NextFunction } from 'express';
import { type AnyZodObject, ZodError } from 'zod';

import { error } from '../utils/response';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        error(res, 'Validation failed', 'VALIDATION_ERROR', 400, details);
        return;
      }
      next(err);
      return;
    }
  };
};

export default { validate };
