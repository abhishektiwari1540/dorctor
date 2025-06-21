import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../entities/user.entity';

interface AuthenticatedRequest extends Request {
  user?: {
    role: UserRole;
    // other user properties
  };
}

export const checkRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authenticatedReq = req as AuthenticatedRequest;
    
    if (!authenticatedReq.user || !allowedRoles.includes(authenticatedReq.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    return next();
  };
};