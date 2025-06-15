import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';

export const checkJwt = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Just attach the payload directly to req.user
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};