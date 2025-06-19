import { Router, Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { UserRole } from "../entities/user.entity";
import { UsersController } from "../controllers/users.controller";
import { getRepository } from "typeorm";
import { User } from "../entities/user.entity";

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

// // Create new user
// router.post(
//   "/",
//   [
//     checkJwt as Middleware,
//     checkRole([UserRole.PARTNER]) as Middleware,
//     body("countryCode").isString().isLength({ min: 1, max: 5 }),
//     body("phone").isString().isLength({ min: 10, max: 15 }),
//     body("name").optional().isString().isLength({ min: 2, max: 100 }),
//     body("email").optional().isEmail(),
//     body("age").optional().isInt({ min: 1, max: 120 }),
//     body("password").optional().isLength({ min: 8 }),
//     body("role").optional().isIn(Object.values(UserRole)),
//   ],
//   wrapAsync(async (req: Request, res: Response) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     const result = await usersController.createUser(req.body);
//     res.status(201).json(result);
//   })
// );

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

// Error handling middleware
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

export default router;