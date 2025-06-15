import { UserRole } from '../entities/user.entity';

export const checkRole = (allowedRoles: UserRole[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};