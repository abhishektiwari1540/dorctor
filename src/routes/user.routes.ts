import { Router, Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { UserRole } from "../entities/user.entity";
import { UsersController } from "../controllers/users.controller";
import { getRepository } from "typeorm";
import { checkJwt } from '../middleware/checkJwt';
import { User } from "../entities/user.entity";
import { wrapAsync as asyncHandler } from '../utils/wrapAsync';

import { existsSync } from 'fs';
import { join } from 'path';
const router = Router();

// Create controller instance with dependencies
const usersController = new UsersController(getRepository(User));

// Properly typed async wrapper
const wrapAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Type declarations for Express Request with user
declare global {
  namespace Express {
    interface Request {
      user?: {
        role: UserRole;
        [key: string]: any;
      };
    }
  }
}

// Middleware type fix
// type Middleware = (req: Request, res: Response, next: NextFunction) => void;

// Test route
router.get('/test', (req: Request, res: Response) => {
  res.send('Test route working');
});

// Get all users
// router.get(
//   "/",
//   checkJwt as Middleware,
//   checkRole([UserRole.PARTNER]) as Middleware,
//   wrapAsync(async (req: Request, res: Response) => {
//     const result = await usersController.listAll();
//     res.json(result);
//   })
// );

// // Get one user
// router.get(
//   "/:id",
//   checkJwt as Middleware,
//   checkRole([UserRole.PARTNER]) as Middleware,
//   wrapAsync(async (req: Request, res: Response) => {
//     const result = await usersController.getOneById(Number(req.params.id));
//     res.json(result);
//   })
// );

// Create new user
router.post(
  "/",
  [
    body("countryCode").isString().isLength({ min: 1, max: 5 }),
    body("phone").isString().isLength({ min: 10, max: 15 }),
    body("name").optional().isString().isLength({ min: 2, max: 100 }),
    body("email").optional().isEmail(),
    body("age").optional().isInt({ min: 1, max: 120 }),
    body("password").optional().isLength({ min: 8 }),
    body("role").optional().isIn(Object.values(UserRole)),
  ],
  wrapAsync(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const result = await usersController.createUser(req.body);
    res.status(201).json(result);
  })
);



/**
 * @route   POST /register-profile
 * @desc    Register or update user profile
 * @access  Protected (JWT required)
 */
router.post(
  '/register-profile',
  checkJwt,
  [
    body('countryCode').optional().isString().isLength({ min: 1, max: 5 }),
    body('phone').optional().isString().isLength({ min: 10, max: 15 }),
    body('title').optional().isString(),
    body('gender').optional().isIn(['male', 'female', 'other']),
    body('language').optional().isString(),
    body('dob').optional().isISO8601().withMessage('DOB must be a valid ISO8601 date'),
    body('servicePin').optional().isString(),
    body('experience').optional().isInt({ min: 0 }),
    body('serviceArea').optional().isString(),
    body('aboutMe').optional().isString(),
    body('experience_year').optional().isString(),
  ],
  wrapAsync(async (req: Request, res: Response) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Call controller with request body and user info from token
    const result = await usersController.registerProfile(req.body, req.user);

    return res.status(201).json({
      success: true,
      message: 'Profile saved successfully',
      data: result,
    });
  })
);
// Delete user
// router.delete(
//   "/:id",
//   checkJwt as Middleware,
//   checkRole([UserRole.PARTNER]) as Middleware,
//   wrapAsync(async (req: Request, res: Response) => {
//     const result = await usersController.deleteUser(Number(req.params.id));
//     res.json(result);
//   })
// );

// OTP routes (no authentication needed)
router.post(
  "/send-otp",
  wrapAsync(async (req: Request, res: Response) => {
    const result = await usersController.sendOtp(req.body);
    res.json(result);
  })
);

// OTP Verify (no authentication needed)
router.post(
  "/verify-otp",
  wrapAsync(async (req: Request, res: Response) => {
    const result = await usersController.verifyOtp(req.body);
    res.json(result);
  })
);

router.post(
  "/forgot-password",
  [body("identifier").isString().notEmpty()],
  wrapAsync(async (req: Request, res: Response) => {
    const result = await usersController.forgotPassword(req.body);
    res.json(result);
  })
);

router.post(
  "/reset-password",
  [
    body("identifier").isString().notEmpty(),
    body("newPassword").isLength({ min: 8 }),
  ],
  wrapAsync(async (req: Request, res: Response) => {
    const result = await usersController.resetPassword(req.body);
    res.json(result);
  })
);



// Error handling middleware
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

export default router;