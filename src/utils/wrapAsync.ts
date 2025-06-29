import { Request, Response, NextFunction } from 'express';

/**
 * A wrapper to catch async errors in Express routes.
 * Automatically forwards errors to Express error handler.
 */
export const wrapAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
